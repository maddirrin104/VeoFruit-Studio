import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildVideoPrompt } from "@/lib/veo3";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Prisma } from "@prisma/client";
import {
  RunwayGenerationError,
  generateVideoWithRunway,
  mapAspectRatioToRunwayRatio,
} from "@/lib/runway";
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
import {
  mixBackgroundMusic,
  optimizeVoiceOverAudio,
} from "@/lib/audio-postprocess";
import { CreateGenerationRequest } from "@/types/studio";

type VideoProjectRecord = NonNullable<
  Awaited<ReturnType<typeof prisma.videoProject.findUnique>>
>;

function getAudioUrlFromVoiceSettings(voiceSettings: Prisma.JsonValue | null): string | undefined {
  if (!voiceSettings || typeof voiceSettings !== "object" || Array.isArray(voiceSettings)) {
    return undefined;
  }

  const audioUrl = (voiceSettings as Prisma.JsonObject).audioUrl;
  return typeof audioUrl === "string" ? audioUrl : undefined;
}

const AUDIO_OUTPUT_DIR = path.join(process.cwd(), "public", "generated-audio");

async function persistAudio(buffer: Buffer, fileName: string): Promise<string> {
  await fs.mkdir(AUDIO_OUTPUT_DIR, { recursive: true });
  const filePath = path.join(AUDIO_OUTPUT_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return `/generated-audio/${fileName}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateGenerationRequest;

    const { projectId, videoConfig, imageConfig, audioConfig } = body;
    const promptContext = {
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
      promptContext
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
  }
) {
  try {
    // Update status to processing
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

    const hasReferenceImage = Boolean(referenceImageUrl);
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

    // Build the prompt from script and config
    const prompt = buildVideoPrompt(
      promptContext.script || promptContext.storyTopic || project.storyTopic || "Fruit product video",
      imageConfig.emotionStyle,
      imageConfig.visualStyle,
      imageConfig.motionIntensity,
      {
        storyTopic: promptContext.storyTopic || project.storyTopic,
        characterDescription: promptContext.characterDescription,
        characterType: promptContext.characterType,
        contentTone: promptContext.contentTone,
        videoGenre: promptContext.videoGenre,
        sceneLocation: promptContext.sceneLocation,
        numberOfScenes: promptContext.numberOfScenes,
        transitionEnabled: imageConfig.transitionEnabled,
        subjectConsistent: effectiveSubjectConsistent,
        hasReferenceImage,
        referenceImageSource,
        referenceImageName,
        narrationGuide: narrationTextForSync,
      }
    );

    console.log(
      `[Generation ${generationId}] Starting Runway video generation${referenceImageUrl ? " (image-to-video mode)" : ""}...`
    );

    const result = await generateVideoWithRunway({
      prompt,
      model: "gen4.5",
      ratio: mapAspectRatioToRunwayRatio(videoConfig.aspectRatio),
      durationSeconds: videoConfig.durationSeconds,
      promptImageUrl: referenceImageUrl,
    });

    const narrationMode =
      audioConfig?.narrationMode === "script_read_along"
        ? "script_read_along"
        : "separate_voiceover";

    let voiceSettings: Prisma.InputJsonObject = {
      ...audioConfig,
      provider: "fpt-ai",
      narrationMode,
      status: "skipped",
    };

    if (!isFptConfigured()) {
      voiceSettings = {
        ...voiceSettings,
        status: "skipped",
        reason:
          narrationMode === "script_read_along"
            ? "Chế độ đọc theo kịch bản cần FPT_AI_API_KEY để tạo audio tự động."
            : "FPT_AI_API_KEY is not configured",
      };
    }

    if (isFptConfigured()) {
      try {
        const voiceDiagnostic = buildFptVoiceDiagnosticConfig({
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

        const optimizedVoice = await optimizeVoiceOverAudio({
          inputBuffer: audioBuffer,
          targetDurationSeconds: videoConfig.durationSeconds,
          inputExtension: "mp3",
        });

        const withBgMusic = audioConfig.bgMusicEnabled
          ? await mixBackgroundMusic({
              voiceBuffer: optimizedVoice.buffer,
              voiceDurationSeconds: optimizedVoice.durationAfterSeconds,
              outputExtension: "mp3",
            })
          : { buffer: optimizedVoice.buffer, mixed: false as const };

        const outputExt = audioConfig.outputFormat === "wav" ? "mp3" : audioConfig.outputFormat;
        const audioFileName = buildAudioFileName(`gen-${generationId}`, outputExt);
        const audioUrl = await persistAudio(withBgMusic.buffer, audioFileName);

        voiceSettings = {
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
        voiceSettings = {
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

    // Update generation with success
    await prisma.videoGeneration.update({
      where: { id: generationId },
      data: {
        status: "completed",
        outputUrl: result.videoUrl,
        voiceSettings,
      },
    });

    console.log(`[Generation ${generationId}] ✅ Generation completed!`);
  } catch (error) {
    console.error(`[Generation ${generationId}] ❌ Generation failed:`, error);

    const fallbackMessage = "Không thể tạo video lúc này. Vui lòng thử lại sau.";
    const errorMessage =
      error instanceof RunwayGenerationError
        ? error.message
        : (error as Error)?.message || fallbackMessage;

    // Update generation with error
    await prisma.videoGeneration.update({
      where: { id: generationId },
      data: {
        status: "failed",
        // Reuse thumbnailUrl field to persist human-readable error until schema adds error_message.
        thumbnailUrl: `error:${errorMessage}`.slice(0, 1000),
      },
    });
  }
}
