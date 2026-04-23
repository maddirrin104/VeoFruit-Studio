import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAudioFileName,
  generateVoiceOverWithFpt,
  isFptAudioNotReadyError,
  isFptConfigured,
  type VoiceType,
} from "@/lib/fpt-tts";
import {
  buildNarrationText,
  estimateNarrationDurationSeconds,
} from "@/lib/audio-narration";
import {
  mixBackgroundMusic,
  optimizeVoiceOverAudio,
} from "@/lib/audio-postprocess";
import { buildFilesApiPath, getRuntimeMediaPath } from "@/lib/runtime-path";
import { ensurePlayableMp3Buffer } from "@/lib/audio-validation";

interface GenerateAudioRequest {
  script?: string;
  storyTopic?: string;
  contentTone?: string;
  videoGenre?: string;
  sceneLocation?: string;
  characterDescription?: string;
  durationSeconds?: number;
  audioConfig: {
    voiceGender: VoiceType;
    language: string;
    readSpeed: number;
    emotionIntensity: number;
    outputFormat: "mp3" | "wav";
    bgMusicEnabled?: boolean;
  };
}

interface AudioGenerationResult {
  audioUrl: string;
  narrationText: string;
  narrationWords: number;
  estimatedDurationSeconds: number;
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
    if (!(await isFptConfigured())) {
      return NextResponse.json(
        { error: "FPT_AI_API_KEY is not configured" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as GenerateAudioRequest;
    if (!body.audioConfig) {
      return NextResponse.json(
        { error: "audioConfig is required" },
        { status: 400 }
      );
    }

    const narrationText = buildNarrationText({
      script: body.script,
      storyTopic: body.storyTopic,
      contentTone: body.contentTone,
      videoGenre: body.videoGenre,
      sceneLocation: body.sceneLocation,
      durationSeconds: body.durationSeconds,
      language: body.audioConfig.language,
      readSpeed: body.audioConfig.readSpeed,
    });
    const buffer = await generateVoiceOverWithFpt({
      text: narrationText,
      settings: {
        voiceType: body.audioConfig.voiceGender,
        readSpeed: body.audioConfig.readSpeed,
        emotionIntensity: body.audioConfig.emotionIntensity,
        outputFormat: body.audioConfig.outputFormat,
        language: body.audioConfig.language,
      },
    });

    const validatedRawVoice = await ensurePlayableMp3Buffer(
      buffer,
      "FPT voice-over"
    );

    const optimizedVoice = await optimizeVoiceOverAudio({
      inputBuffer: validatedRawVoice.buffer,
      targetDurationSeconds: body.durationSeconds,
      inputExtension: "mp3",
    });

    let stableVoice = await ensurePlayableMp3Buffer(
      optimizedVoice.buffer,
      "Optimized voice-over"
    ).catch((validationError) => {
      console.warn("[generate-audio] Optimized voice invalid, fallback to raw buffer:", validationError);
      return validatedRawVoice;
    });

    const withBgMusic = body.audioConfig.bgMusicEnabled
      ? await mixBackgroundMusic({
          voiceBuffer: stableVoice.buffer,
          voiceDurationSeconds:
            optimizedVoice.durationAfterSeconds ?? stableVoice.durationSeconds,
          outputExtension: "mp3",
        })
      : { buffer: stableVoice.buffer, mixed: false as const };

    stableVoice = await ensurePlayableMp3Buffer(
      withBgMusic.buffer,
      "Final mixed voice-over"
    ).catch((validationError) => {
      console.warn("[generate-audio] Mixed voice invalid, fallback to previous playable buffer:", validationError);
      return stableVoice;
    });

    const outputExt = body.audioConfig.outputFormat === "wav" ? "mp3" : body.audioConfig.outputFormat;
    const fileName = buildAudioFileName("voiceover", outputExt);
    const audioUrl = await persistAudio(stableVoice.buffer, fileName);
    const narrationWords = narrationText.split(" ").filter(Boolean).length;
    const estimatedDurationSeconds = estimateNarrationDurationSeconds(
      narrationText,
      body.audioConfig.language,
      body.audioConfig.readSpeed
    );

    const data: AudioGenerationResult = {
      audioUrl,
      narrationText,
      narrationWords,
      estimatedDurationSeconds,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/ai/generate-audio error:", error);

    if (isFptAudioNotReadyError(error)) {
      return NextResponse.json(
        {
          error:
            "FPT đang xử lý audio chậm hơn bình thường. Vui lòng thử lại sau vài giây để tạo voice-over.",
          retryable: true,
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate voice-over audio" },
      { status: 500 }
    );
  }
}
