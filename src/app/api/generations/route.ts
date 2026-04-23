import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { buildVideoPrompt, generateVideoWithVeo3 } from "@/lib/veo3";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Prisma } from "@/generated/prisma";
import {
  RunwayGenerationError,
  generateVideoWithRunway,
  mapAspectRatioToRunwayRatio,
} from "@/lib/runway";
import {
  KlingGenerationError,
  generateTextToVideoWithKling,
  generateImageToVideoWithKling,
  mapAspectRatioForKling,
} from "@/lib/kling";
import {
  buildFptVoiceDiagnosticConfig,
  buildAudioFileName,
  generateVoiceOverWithFpt,
  isFptConfigured,
} from "@/lib/fpt-tts";
import {
  buildNarrationText,
  estimateNarrationDurationSeconds,
} from "@/lib/audio-narration";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import {
  mixBackgroundMusic,
  optimizeVoiceOverAudio,
} from "@/lib/audio-postprocess";
import { buildFilesApiPath, getRuntimeMediaPath } from "@/lib/runtime-path";
import { ensurePlayableMp3Buffer } from "@/lib/audio-validation";
import { CreateGenerationRequest, WorkflowMode } from "@/types/studio";
import { downloadAndSaveVideo } from "@/lib/video-storage";
import { parseScriptIntoScenes, buildSceneSlotsForClips } from "@/lib/scene-parser";
import { concatenateVideoFiles } from "@/lib/video-concat";

type VideoProjectRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.videoProject.findUnique>>
>;

type PromptContext = {
  storyTopic?: string;
  script?: string;
  characterDescription?: string;
  characterType?: string;
  contentTone?: string;
  videoGenre?: string;
  sceneLocation?: string;
  narrationGuide?: string;
  numberOfScenes?: number;
};

type TranslatedPromptContext = Pick<
  PromptContext,
  | "storyTopic"
  | "script"
  | "characterDescription"
  | "characterType"
  | "contentTone"
  | "videoGenre"
  | "sceneLocation"
  | "narrationGuide"
>;

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function tryParseTranslatedContext(rawText: string): Partial<TranslatedPromptContext> | null {
  const cleaned = stripCodeFences(rawText);

  try {
    return JSON.parse(cleaned) as Partial<TranslatedPromptContext>;
  } catch {
    // Gemini can occasionally prepend/append non-JSON text; try the first JSON object slice.
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace < 0 || lastBrace <= firstBrace) {
      return null;
    }

    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate) as Partial<TranslatedPromptContext>;
    } catch {
      return null;
    }
  }
}

async function translatePromptContextToEnglish(
  context: PromptContext
): Promise<TranslatedPromptContext> {
  const runtime = await getRuntimeSettings();
  const genAI = runtime.googleApiKey
    ? new GoogleGenAI({ apiKey: runtime.googleApiKey, apiVersion: "v1" })
    : null;

  if (!genAI) {
    return context;
  }

  const payload = {
    storyTopic: context.storyTopic ?? "",
    script: context.script ?? "",
    characterDescription: context.characterDescription ?? "",
    characterType: context.characterType ?? "",
    contentTone: context.contentTone ?? "",
    videoGenre: context.videoGenre ?? "",
    sceneLocation: context.sceneLocation ?? "",
    narrationGuide: context.narrationGuide ?? "",
  };

  const model = genAI.models as unknown as {
    generateContent: (args: {
      model: string;
      contents: string;
      config?: {
        temperature?: number;
        topP?: number;
        maxOutputTokens?: number;
      };
    }) => Promise<{ text?: string }>;
  };

  try {
    const result = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        "Translate the following Vietnamese fruit-video planning data into concise natural English for an AI video generation prompt.",
        "Keep the exact product identity unchanged. If the topic is strawberry, keep it strawberry and never replace it with apple or any other fruit.",
        "Preserve meaning, scene order, tone, and character intent.",
        "Output JSON only with the same keys as the input.",
        "Do not add markdown, code fences, explanations, or extra keys.",
        "Input JSON:",
        JSON.stringify(payload),
      ].join("\n"),
      config: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 1200,
      },
    });

    const rawText = result.text?.trim();
    if (!rawText) {
      return context;
    }

    const parsed = tryParseTranslatedContext(rawText);
    if (!parsed) {
      console.warn("[Generation] Prompt translation returned non-JSON output; fallback to Vietnamese prompt.");
      return context;
    }

    return {
      storyTopic: parsed.storyTopic?.trim() || context.storyTopic,
      script: parsed.script?.trim() || context.script,
      characterDescription: parsed.characterDescription?.trim() || context.characterDescription,
      characterType: parsed.characterType?.trim() || context.characterType,
      contentTone: parsed.contentTone?.trim() || context.contentTone,
      videoGenre: parsed.videoGenre?.trim() || context.videoGenre,
      sceneLocation: parsed.sceneLocation?.trim() || context.sceneLocation,
      narrationGuide: parsed.narrationGuide?.trim() || context.narrationGuide,
    };
  } catch (error) {
    console.warn("[Generation] Prompt translation failed, falling back to Vietnamese prompt:", error);
    return context;
  }
}

function getAudioUrlFromVoiceSettings(voiceSettings: Prisma.JsonValue | null): string | undefined {
  if (!voiceSettings || typeof voiceSettings !== "object" || Array.isArray(voiceSettings)) {
    return undefined;
  }

  const audioUrl = (voiceSettings as Prisma.JsonObject).audioUrl;
  return typeof audioUrl === "string" ? audioUrl : undefined;
}

const AUDIO_OUTPUT_DIR = getRuntimeMediaPath("generated-audio");

async function persistAudio(buffer: Buffer, fileName: string): Promise<string> {
  await fs.mkdir(AUDIO_OUTPUT_DIR, { recursive: true });
  const filePath = path.join(AUDIO_OUTPUT_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return buildFilesApiPath("generated-audio", fileName);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateGenerationRequest;

    const { projectId, videoConfig, imageConfig, audioConfig, workflowMode } = body;
    const promptContext: PromptContext = {
      storyTopic: body.storyTopic,
      script: body.script,
      characterDescription: body.characterDescription,
      characterType: body.characterType,
      contentTone: body.contentTone,
      videoGenre: body.videoGenre,
      sceneLocation: body.sceneLocation,
      numberOfScenes: body.numberOfScenes,
    };

    // Verify project exists and fetch its details
    const project = await prisma.videoProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!promptContext.storyTopic && !project?.storyTopic) {
      return NextResponse.json(
        { error: "Project topic is required. Please add content first." },
        { status: 400 }
      );
    }

    // Get the next generation number
    const lastGeneration = await prisma.videoGeneration.findFirst({
      where: { projectId },
      orderBy: { generationNo: "desc" },
    });

    const generationNo = (lastGeneration?.generationNo ?? 0) + 1;

    // Create generation record with pending status
    const generation = await prisma.videoGeneration.create({
      data: {
        projectId,
        generationNo,
        status: "pending",
        aiModel: "runway-gen4.5",
        resolution: videoConfig.resolution,
        aspectRatio: videoConfig.aspectRatio,
        durationSeconds: videoConfig.durationSeconds,
      },
    });

    // Start video generation in background
    void generateVideoInBackground(
      generation.id,
      project,
      videoConfig,
      imageConfig,
      audioConfig,
      promptContext,
      workflowMode
    ).catch((error) => {
      console.error(
        `[Generation ${generation.id}] Background generation job crashed unexpectedly:`,
        error
      );
    });

    return NextResponse.json(
      {
        data: {
          id: generation.id,
          projectId: generation.projectId,
          status: generation.status,
          progress: 0,
          createdAt: generation.createdAt,
          message: "Video generation started. Polling status for updates.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/generations error:", error);
    return NextResponse.json(
      { error: "Failed to create generation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Prisma.VideoGenerationWhereInput = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const generations = await prisma.videoGeneration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.videoGeneration.count({ where });

    const gensWithConfigs = generations.map((gen) => ({
      ...gen,
      videoConfig: null,
      imageConfig: null,
      audioConfig: null,
      audioUrl: getAudioUrlFromVoiceSettings(gen.voiceSettings),
    }));

    return NextResponse.json({
      data: gensWithConfigs,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    console.error("GET /api/generations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}

/**
 * Generate audio for a video generation (used in parallel with video generation)
 * Handles FPT TTS, optimization, mixing - returns voice settings object
 */
async function generateAudioForGeneration({
  generationId,
  narrationTextForSync,
  audioConfig,
  videoConfig,
}: {
  generationId: string;
  narrationTextForSync: string;
  audioConfig: CreateGenerationRequest["audioConfig"];
  videoConfig: CreateGenerationRequest["videoConfig"];
}): Promise<Prisma.InputJsonObject> {
  const narrationMode =
    audioConfig?.narrationMode === "script_read_along"
      ? "script_read_along"
      : "separate_voiceover";

  const voiceSettings: Prisma.InputJsonObject = {
    ...audioConfig,
    provider: "fpt-ai",
    narrationMode,
    status: "skipped",
  };

  const fptConfigured = await isFptConfigured();

  if (!fptConfigured) {
    return {
      ...voiceSettings,
      status: "skipped",
      reason:
        narrationMode === "script_read_along"
          ? "Chế độ đọc theo kịch bản cần FPT_AI_API_KEY để tạo audio tự động."
          : "FPT_AI_API_KEY is not configured",
    };
  }

  try {
    const voiceDiagnostic = await buildFptVoiceDiagnosticConfig({
      voiceType: audioConfig.voiceGender,
      language: audioConfig.language,
      readSpeed: audioConfig.readSpeed,
      emotionIntensity: audioConfig.emotionIntensity,
      outputFormat: audioConfig.outputFormat,
    });

    const audioBuffer = await generateVoiceOverWithFpt({
      text: narrationTextForSync,
      settings: {
        voiceType: audioConfig.voiceGender,
        language: audioConfig.language,
        readSpeed: audioConfig.readSpeed,
        emotionIntensity: audioConfig.emotionIntensity,
        outputFormat: audioConfig.outputFormat,
      },
    });

    const validatedRawVoice = await ensurePlayableMp3Buffer(
      audioBuffer,
      "FPT generation voice"
    );

    const optimizedVoice = await optimizeVoiceOverAudio({
      inputBuffer: validatedRawVoice.buffer,
      targetDurationSeconds: videoConfig.durationSeconds,
      inputExtension: "mp3",
    });

    let stableVoice = await ensurePlayableMp3Buffer(
      optimizedVoice.buffer,
      "Optimized generation voice"
    ).catch((validationError) => {
      console.warn(
        `[Generation ${generationId}] Optimized voice invalid, fallback to raw buffer:`,
        validationError
      );
      return validatedRawVoice;
    });

    const withBgMusic = audioConfig.bgMusicEnabled
      ? await mixBackgroundMusic({
          voiceBuffer: stableVoice.buffer,
          voiceDurationSeconds:
            optimizedVoice.durationAfterSeconds ?? stableVoice.durationSeconds,
          outputExtension: "mp3",
        })
      : { buffer: stableVoice.buffer, mixed: false as const };

    stableVoice = await ensurePlayableMp3Buffer(
      withBgMusic.buffer,
      "Final generation voice"
    ).catch((validationError) => {
      console.warn(
        `[Generation ${generationId}] Mixed voice invalid, fallback to previous playable buffer:`,
        validationError
      );
      return stableVoice;
    });

    const outputExt = audioConfig.outputFormat === "wav" ? "mp3" : audioConfig.outputFormat;
    const audioFileName = buildAudioFileName(`gen-${generationId}`, outputExt);
    const audioUrl = await persistAudio(stableVoice.buffer, audioFileName);

    return {
      ...audioConfig,
      provider: "fpt-ai",
      narrationMode,
      voiceId: voiceDiagnostic.voice,
      voiceConfig: {
        speed: voiceDiagnostic.speed,
        outputFormat: voiceDiagnostic.outputFormat,
      },
      status: "completed",
      audioUrl,
      narrationText: narrationTextForSync,
      estimatedDurationSeconds: estimateNarrationDurationSeconds(
        narrationTextForSync,
        audioConfig.language,
        audioConfig.readSpeed
      ),
      postProcessing: {
        trimmedSilence: optimizedVoice.trimmedSilence,
        durationBeforeSeconds: optimizedVoice.durationBeforeSeconds,
        durationAfterSeconds: optimizedVoice.durationAfterSeconds,
        speedFactorApplied: optimizedVoice.speedFactorApplied,
        backgroundMusicEnabled: Boolean(audioConfig.bgMusicEnabled),
        backgroundMusicMixed: withBgMusic.mixed,
        backgroundMusicNote: withBgMusic.reason,
      },
    };
  } catch (audioError) {
    console.error(`[Generation ${generationId}] Voice-over failed:`, audioError);
    return {
      ...audioConfig,
      provider: "fpt-ai",
      narrationMode,
      status: "failed",
      error:
        (audioError as Error)?.message ||
        "Không thể tạo voice-over tự động. Video vẫn được tạo thành công.",
    };
  }
}

const CLIP_TEMP_DIR = getRuntimeMediaPath("concat-temp");
const VIDEO_OUTPUT_DIR = getRuntimeMediaPath("uploads", "videos");

async function downloadClipFile(videoUrl: string, clipId: string): Promise<string> {
  await fs.mkdir(CLIP_TEMP_DIR, { recursive: true });
  const filePath = path.join(CLIP_TEMP_DIR, `${clipId}.mp4`);
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`Failed to download clip ${clipId}: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));
  return filePath;
}

async function generateSingleClip(
  generationId: string,
  prompt: string,
  aiProvider: string,
  videoConfig: CreateGenerationRequest["videoConfig"],
  promptImageUrl: string | undefined,
): Promise<string> {
  if (aiProvider === "veo3") {
    const veo3Result = await generateVideoWithVeo3(prompt, Math.min(videoConfig.durationSeconds, 30));
    console.log(`[Generation ${generationId}] ✅ Veo3 clip ready: ${veo3Result.operationId}`);
    return veo3Result.videoUrl;
  }

  if (aiProvider === "kling") {
    const klingResult = promptImageUrl
      ? await generateImageToVideoWithKling({
          imageUrl: promptImageUrl,
          prompt,
          negativePrompt: "",
          duration: videoConfig.durationSeconds <= 5 ? "5" : "10",
          aspectRatio: mapAspectRatioForKling(videoConfig.aspectRatio),
          mode: "pro",
          sound: "on",
        })
      : await generateTextToVideoWithKling({
          prompt,
          negativePrompt: "",
          duration: videoConfig.durationSeconds <= 5 ? "5" : "10",
          aspectRatio: mapAspectRatioForKling(videoConfig.aspectRatio),
          mode: "pro",
          sound: "on",
        });
    console.log(`[Generation ${generationId}] ✅ Kling clip ready: ${klingResult.taskId}`);
    return klingResult.videoUrl ?? "";
  }

  // Runway
  const runwayResult = await generateVideoWithRunway({
    prompt,
    model: "gen4.5",
    ratio: mapAspectRatioToRunwayRatio(videoConfig.aspectRatio),
    durationSeconds: Math.min(videoConfig.durationSeconds, 10),
    promptImageUrl,
  });
  console.log(`[Generation ${generationId}] ✅ Runway clip ready`);
  return runwayResult.videoUrl;
}

/**
 * Run video generation in background (non-blocking)
 */
async function generateVideoInBackground(
  generationId: string,
  project: VideoProjectRecord,
  videoConfig: CreateGenerationRequest["videoConfig"],
  imageConfig: CreateGenerationRequest["imageConfig"],
  audioConfig: CreateGenerationRequest["audioConfig"],
  promptContext: {
    storyTopic?: string;
    script?: string;
    characterDescription?: string;
    characterType?: string;
    contentTone?: string;
    videoGenre?: string;
    sceneLocation?: string;
    numberOfScenes?: number;
  },
  workflowMode?: WorkflowMode
) {
  try {
    await prisma.videoGeneration.update({
      where: { id: generationId },
      data: { status: "processing" },
    });

    const referenceImageUrl =
      typeof imageConfig?.referenceImageUrl === "string" &&
      imageConfig.referenceImageUrl.trim().length > 0
        ? imageConfig.referenceImageUrl.trim()
        : undefined;
    const referenceImageSource =
      imageConfig?.referenceImageSource === "url" ||
      imageConfig?.referenceImageSource === "upload"
        ? imageConfig.referenceImageSource
        : undefined;
    const referenceImageName =
      typeof imageConfig?.referenceImageName === "string" &&
      imageConfig.referenceImageName.trim().length > 0
        ? imageConfig.referenceImageName.trim()
        : undefined;
    const brandBackgroundImageUrl =
      typeof imageConfig?.brandBackgroundImageUrl === "string" &&
      imageConfig.brandBackgroundImageUrl.trim().length > 0
        ? imageConfig.brandBackgroundImageUrl.trim()
        : undefined;
    const brandBackgroundImageName =
      typeof imageConfig?.brandBackgroundImageName === "string" &&
      imageConfig.brandBackgroundImageName.trim().length > 0
        ? imageConfig.brandBackgroundImageName.trim()
        : undefined;
    const brandBackgroundImageSource =
      imageConfig?.brandBackgroundImageSource === "url" ||
      imageConfig?.brandBackgroundImageSource === "upload"
        ? imageConfig.brandBackgroundImageSource
        : undefined;

    const hasReferenceImage = Boolean(referenceImageUrl);
    const hasBrandBackgroundImage = Boolean(brandBackgroundImageUrl);
    const effectiveSubjectConsistent = hasReferenceImage
      ? true
      : Boolean(imageConfig.subjectConsistent);

    const narrationTextForSync = buildNarrationText({
      script: promptContext.script,
      storyTopic: promptContext.storyTopic,
      contentTone: promptContext.contentTone,
      videoGenre: promptContext.videoGenre,
      sceneLocation: promptContext.sceneLocation,
      durationSeconds: videoConfig.durationSeconds,
      language: audioConfig.language,
      readSpeed: audioConfig.readSpeed,
    });

    const translatedPromptContext = await translatePromptContextToEnglish({
      ...promptContext,
      narrationGuide: narrationTextForSync,
    });

    // Shared prompt builder options (used for both single and multi-clip)
    const sharedPromptOptions = {
      storyTopic: translatedPromptContext.storyTopic || project.storyTopic,
      characterDescription: translatedPromptContext.characterDescription,
      characterType: translatedPromptContext.characterType,
      contentTone: translatedPromptContext.contentTone,
      videoGenre: translatedPromptContext.videoGenre,
      sceneLocation: translatedPromptContext.sceneLocation,
      subjectConsistent: effectiveSubjectConsistent,
      hasReferenceImage,
      referenceImageSource,
      referenceImageName,
      hasBrandBackgroundImage,
      brandBackgroundImageSource,
      brandBackgroundImageName,
    };

    // When both product + brand images exist, prioritize brand image as the scene anchor
    const promptImageUrl = hasBrandBackgroundImage ? brandBackgroundImageUrl : referenceImageUrl;
    const aiProvider = workflowMode === "veo3-direct" ? "veo3" : (videoConfig.aiProvider || "runway");

    if (promptImageUrl) {
      console.log(`[Generation ${generationId}] Image-to-video: ${promptImageUrl.substring(0, 80)}...`);
    }

    // Determine clips needed for the target duration
    const clipsNeeded = videoConfig.durationSeconds > 10
      ? Math.ceil(videoConfig.durationSeconds / 10)
      : 1;

    console.log(`[Generation ${generationId}] Starting ${aiProvider} (${clipsNeeded} clip${clipsNeeded > 1 ? "s" : ""}) + FPT audio in parallel...`);

    // Audio always runs in parallel regardless of clip count
    const audioPromise = generateAudioForGeneration({
      generationId,
      narrationTextForSync,
      audioConfig,
      videoConfig,
    }).then(settings => {
      console.log(`[Generation ${generationId}] ✅ Audio generation completed`);
      return settings;
    });

    let finalVideoUrl: string;

    if (clipsNeeded > 1) {
      // ── Multi-scene: generate one 10 s clip per scene then concatenate ──
      const rawScenes = parseScriptIntoScenes(promptContext.script || "");
      const translatedScenes = parseScriptIntoScenes(translatedPromptContext.script || "");

      // Pad/trim scenes to exactly the number of clips needed
      const sceneSlots = buildSceneSlotsForClips(
        rawScenes.length > 0 ? rawScenes : [{ sceneNo: 1, visualPrompt: "", voiceover: "", rawText: "" }],
        clipsNeeded
      );
      const translatedSlots = buildSceneSlotsForClips(
        translatedScenes.length > 0 ? translatedScenes : sceneSlots,
        clipsNeeded
      );

      const clipPaths: string[] = [];

      for (let sceneIdx = 0; sceneIdx < sceneSlots.length; sceneIdx++) {
        // Store progress in thumbnailUrl so the [id] route can expose it
        await prisma.videoGeneration.update({
          where: { id: generationId },
          data: { thumbnailUrl: `progress:${sceneIdx + 1}/${clipsNeeded}` },
        });

        const translatedScene = translatedSlots[sceneIdx];
        const rawScene = sceneSlots[sceneIdx];

        // Use translated visual description when available
        const sceneVisual =
          (translatedScene.visualPrompt || rawScene.visualPrompt || "").trim() ||
          translatedPromptContext.storyTopic ||
          project.storyTopic ||
          "Fruit product scene";
        const sceneVoiceover =
          (translatedScene.voiceover || rawScene.voiceover || "").trim();

        const scenePrompt = buildVideoPrompt(
          sceneVisual,
          imageConfig.emotionStyle,
          imageConfig.visualStyle,
          imageConfig.motionIntensity,
          {
            ...sharedPromptOptions,
            numberOfScenes: 1,
            transitionEnabled: false,
            narrationGuide: sceneVoiceover || translatedPromptContext.narrationGuide || narrationTextForSync,
          }
        );

        console.log(`[Generation ${generationId}] 🎬 Generating clip ${sceneIdx + 1}/${clipsNeeded}...`);

        const clipVideoUrl = await generateSingleClip(
          generationId,
          scenePrompt,
          aiProvider,
          { ...videoConfig, durationSeconds: 10 },
          promptImageUrl,
        );

        if (!clipVideoUrl) {
          throw new Error(`Scene ${sceneIdx + 1} produced no video URL from ${aiProvider}.`);
        }

        const clipPath = await downloadClipFile(clipVideoUrl, `${generationId}-clip-${sceneIdx + 1}`);
        clipPaths.push(clipPath);
        console.log(`[Generation ${generationId}] ✅ Clip ${sceneIdx + 1}/${clipsNeeded} saved`);
      }

      // Concatenate all clips into the final video
      await fs.mkdir(VIDEO_OUTPUT_DIR, { recursive: true });
      const finalPath = path.join(VIDEO_OUTPUT_DIR, `${generationId}.mp4`);
      console.log(`[Generation ${generationId}] Concatenating ${clipPaths.length} clips...`);
      await concatenateVideoFiles(clipPaths, finalPath);

      // Clean up temp clip files
      for (const clipPath of clipPaths) {
        await fs.unlink(clipPath).catch(() => {});
      }

      finalVideoUrl = buildFilesApiPath("uploads", "videos", `${generationId}.mp4`);
      console.log(`[Generation ${generationId}] ✅ Multi-scene video ready: ${finalVideoUrl}`);
    } else {
      // ── Single clip: existing behavior ──
      const fullPrompt = buildVideoPrompt(
        translatedPromptContext.script || translatedPromptContext.storyTopic || project.storyTopic || "Fruit product video",
        imageConfig.emotionStyle,
        imageConfig.visualStyle,
        imageConfig.motionIntensity,
        {
          ...sharedPromptOptions,
          numberOfScenes: promptContext.numberOfScenes,
          transitionEnabled: imageConfig.transitionEnabled,
          narrationGuide: translatedPromptContext.narrationGuide || narrationTextForSync,
        }
      );

      const singleVideoUrl = await generateSingleClip(
        generationId,
        fullPrompt,
        aiProvider,
        videoConfig,
        promptImageUrl,
      );

      try {
        finalVideoUrl = await downloadAndSaveVideo(singleVideoUrl, generationId);
      } catch (storageError) {
        console.error(`[Generation ${generationId}] Failed to save video locally:`, storageError);
        finalVideoUrl = singleVideoUrl;
      }

      console.log(`[Generation ${generationId}] ✅ Single-clip video ready`);
    }

    const voiceSettings = await audioPromise;

    await prisma.videoGeneration.update({
      where: { id: generationId },
      data: {
        status: "completed",
        outputUrl: finalVideoUrl,
        thumbnailUrl: null,
        voiceSettings,
      },
    });

    console.log(`[Generation ${generationId}] ✅ Generation completed!`);
  } catch (error) {
    console.error(`[Generation ${generationId}] ❌ Generation failed:`, error);

    const fallbackMessage = "Không thể tạo video lúc này. Vui lòng thử lại sau.";
    const errorMessage =
      error instanceof RunwayGenerationError || error instanceof KlingGenerationError
        ? error.message
        : (error as Error)?.message || fallbackMessage;

    await prisma.videoGeneration.update({
      where: { id: generationId },
      data: {
        status: "failed",
        thumbnailUrl: `error:${errorMessage}`.slice(0, 1000),
      },
    });
  }
}
