import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAudioFileName,
  generateVoiceOverWithFpt,
  isFptConfigured,
  type VoiceType,
} from "@/lib/fpt-tts";

interface PreviewVoiceRequest {
  script?: string;
  storyTopic?: string;
  audioConfig: {
    voiceGender: VoiceType;
    language: string;
    readSpeed: number;
    emotionIntensity: number;
    outputFormat: "mp3" | "wav";
  };
}

const AUDIO_OUTPUT_DIR = path.join(process.cwd(), "public", "generated-audio");

function buildPreviewText(language: string, storyTopic?: string, script?: string): string {
  const topic = storyTopic?.trim() || "trái cây tươi";
  const scriptSnippet = script
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (scriptSnippet) {
    return scriptSnippet.slice(0, 180);
  }

  if (language === "English") {
    return `Hello, this is a sample voice for your ${topic} video. Please pick the voice style that feels most natural for your audience.`;
  }

  if (language === "한국어") {
    return "안녕하세요. 이것은 음성 미리듣기 샘플입니다. 영상 분위기에 가장 잘 맞는 목소리를 선택해 주세요.";
  }

  if (language === "日本語") {
    return "こんにちは。こちらは音声プレビューのサンプルです。動画の雰囲気に合う声を選んでください。";
  }

  if (language === "Tiếng Việt" || language === "Vietnamese") {
    return `Xin chào, đây là mẫu giọng đọc cho video ${topic}. Bạn hãy nghe thử và chọn giọng phù hợp nhất.`;
  }

  return `Xin chào, đây là mẫu giọng đọc cho video ${topic}. Bạn hãy nghe thử và chọn giọng phù hợp nhất.`;
}

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

    const body = (await request.json()) as PreviewVoiceRequest;
    if (!body.audioConfig) {
      return NextResponse.json(
        { error: "audioConfig is required" },
        { status: 400 }
      );
    }

    const sampleText = buildPreviewText(body.audioConfig.language, body.storyTopic, body.script);
    const voiceBuffer = await generateVoiceOverWithFpt({
      text: sampleText,
      settings: {
        voiceType: body.audioConfig.voiceGender,
        readSpeed: body.audioConfig.readSpeed,
        emotionIntensity: body.audioConfig.emotionIntensity,
        outputFormat: body.audioConfig.outputFormat,
        language: body.audioConfig.language,
      },
    });

    const outputExt = body.audioConfig.outputFormat === "wav" ? "mp3" : body.audioConfig.outputFormat;
    const fileName = buildAudioFileName("voice-preview", outputExt);
    const audioUrl = await persistAudio(voiceBuffer, fileName);

    return NextResponse.json({
      data: {
        audioUrl,
        sampleText,
      },
    });
  } catch (error) {
    console.error("POST /api/ai/preview-voice error:", error);
    return NextResponse.json(
      { error: "Failed to generate voice preview" },
      { status: 500 }
    );
  }
}
