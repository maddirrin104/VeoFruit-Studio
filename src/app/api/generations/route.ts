import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildVideoPrompt } from "@/lib/veo3";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  RunwayGenerationError,
  generateVideoWithRunway,
  mapAspectRatioToRunwayRatio,
} from "@/lib/runway";
import {
  buildAudioFileName,
  generateVoiceOverWithElevenLabs,
  isElevenLabsConfigured,
} from "@/lib/elevenlabs";
import {
  buildNarrationText,
  estimateNarrationDurationSeconds,
} from "@/lib/audio-narration";
import { CreateGenerationRequest } from "@/types/studio";

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
    }) as any;

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
    }) as any;

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

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const generations = await prisma.videoGeneration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.videoGeneration.count({ where });

    const gensWithConfigs = generations.map((gen: any) => ({
      ...gen,
      videoConfig: null,
      imageConfig: null,
      audioConfig: null,
      audioUrl:
        gen?.voiceSettings && typeof gen.voiceSettings?.audioUrl === "string"
          ? gen.voiceSettings.audioUrl
          : undefined,
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
  project: any,
  videoConfig: any,
  imageConfig: any,
  audioConfig: {
    voiceGender: "Nam" | "Nữ" | "Trung tính AI";
    language: string;
    readSpeed: number;
    bgMusicEnabled: boolean;
  },
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
    await (prisma.videoGeneration.update as any)({
      where: { id: generationId },
      data: { status: "processing" },
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
        subjectConsistent: imageConfig.subjectConsistent,
      }
    );

    console.log(`[Generation ${generationId}] Starting Runway video generation...`);

    const result = await generateVideoWithRunway({
      prompt,
      model: "gen4.5",
      ratio: mapAspectRatioToRunwayRatio(videoConfig.aspectRatio),
      durationSeconds: videoConfig.durationSeconds,
    });

    let voiceSettings: Record<string, unknown> = {
      ...audioConfig,
      provider: "elevenlabs",
      status: "skipped",
      reason: "ELEVENLABS_API_KEY is not configured",
    };

    if (isElevenLabsConfigured()) {
      try {
        const narrationText = buildNarrationText({
          script: promptContext.script,
          storyTopic: promptContext.storyTopic,
          contentTone: promptContext.contentTone,
          videoGenre: promptContext.videoGenre,
          sceneLocation: promptContext.sceneLocation,
          durationSeconds: videoConfig.durationSeconds,
          language: audioConfig.language,
          readSpeed: audioConfig.readSpeed,
        });

        const audioBuffer = await generateVoiceOverWithElevenLabs({
          text: narrationText,
          settings: {
            voiceType: audioConfig.voiceGender,
            language: audioConfig.language,
            readSpeed: audioConfig.readSpeed,
          },
        });

        const audioFileName = buildAudioFileName(`gen-${generationId}`);
        const audioUrl = await persistAudio(audioBuffer, audioFileName);

        voiceSettings = {
          ...audioConfig,
          provider: "elevenlabs",
          status: "completed",
          audioUrl,
          narrationText,
          estimatedDurationSeconds: estimateNarrationDurationSeconds(
            narrationText,
            audioConfig.language,
            audioConfig.readSpeed
          ),
        };
      } catch (audioError) {
        console.error(`[Generation ${generationId}] Voice-over failed:`, audioError);
        voiceSettings = {
          ...audioConfig,
          provider: "elevenlabs",
          status: "failed",
          error:
            (audioError as Error)?.message ||
            "Không thể tạo voice-over tự động. Video vẫn được tạo thành công.",
        };
      }
    }

    // Update generation with success
    await (prisma.videoGeneration.update as any)({
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
    await (prisma.videoGeneration.update as any)({
      where: { id: generationId },
      data: {
        status: "failed",
        // Reuse thumbnailUrl field to persist human-readable error until schema adds error_message.
        thumbnailUrl: `error:${errorMessage}`.slice(0, 1000),
      },
    });
  }
}
