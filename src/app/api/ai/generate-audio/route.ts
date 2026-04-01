import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAudioFileName,
  generateVoiceOverWithFpt,
  isFptConfigured,
  type VoiceType,
} from "@/lib/fpt-tts";
import {
  buildNarrationText,
  estimateNarrationDurationSeconds,
} from "@/lib/audio-narration";

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

const AUDIO_OUTPUT_DIR = path.join(process.cwd(), "public", "generated-audio");

async function persistAudio(buffer: Buffer, fileName: string): Promise<string> {
  await fs.mkdir(AUDIO_OUTPUT_DIR, { recursive: true });
  const filePath = path.join(AUDIO_OUTPUT_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  return `/generated-audio/${fileName}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!isFptConfigured()) {
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

    const outputExt = body.audioConfig.outputFormat === "wav" ? "mp3" : body.audioConfig.outputFormat;
    const fileName = buildAudioFileName("voiceover", outputExt);
    const audioUrl = await persistAudio(buffer, fileName);
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
    return NextResponse.json(
      { error: "Failed to generate voice-over audio" },
      { status: 500 }
    );
  }
}
