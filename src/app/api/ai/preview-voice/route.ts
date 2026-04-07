import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAudioFileName,
  generateVoiceOverWithFpt,
  isFptConfigured,
  type VoiceType,
} from "@/lib/fpt-tts";
import { extractDialogueLinesFromScript } from "@/lib/audio-narration";

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

function normalizeSpacing(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function enforceMinimumPreviewLength(text: string, language: string, topic: string): string {
  const normalized = normalizeSpacing(text);
  const words = normalized.split(" ").filter(Boolean).length;
  if (words >= 14 && normalized.length >= 70) {
    return normalized;
  }

  if (language === "English") {
    return `${normalized} This is an additional sample sentence so you can hear the voice tone, pacing, and natural pronunciation more clearly.`;
  }

  if (language === "한국어") {
    return `${normalized} 음색과 속도, 발음의 자연스러움을 더 정확히 확인할 수 있도록 샘플 문장을 추가로 들려드립니다.`;
  }

  if (language === "日本語") {
    return `${normalized} 声の質感や話すスピード、発音の自然さを確認しやすいように、追加のサンプル文を読み上げます。`;
  }

  return `${normalized} Đây là câu mẫu bổ sung để bạn nghe rõ hơn chất giọng, tốc độ đọc và độ tự nhiên của phát âm cho video ${topic}.`;
}

function buildPreviewText(language: string, storyTopic?: string, script?: string): string {
  const topic = storyTopic?.trim() || "trái cây tươi";
  const scriptDialogueLines = script ? extractDialogueLinesFromScript(script, 1) : [];
  const scriptSnippet = normalizeSpacing(scriptDialogueLines.slice(0, 2).join(" "));

  if (scriptSnippet) {
    return enforceMinimumPreviewLength(scriptSnippet.slice(0, 280), language, topic);
  }

  if (language === "English") {
    return enforceMinimumPreviewLength(
      `Hello, this is a sample voice for your ${topic} video. Please pick the voice style that feels most natural for your audience.`,
      language,
      topic
    );
  }

  if (language === "한국어") {
    return enforceMinimumPreviewLength(
      "안녕하세요. 이것은 음성 미리듣기 샘플입니다. 영상 분위기에 가장 잘 맞는 목소리를 선택해 주세요.",
      language,
      topic
    );
  }

  if (language === "日本語") {
    return enforceMinimumPreviewLength(
      "こんにちは。こちらは音声プレビューのサンプルです。動画の雰囲気に合う声を選んでください。",
      language,
      topic
    );
  }

  if (language === "Tiếng Việt" || language === "Vietnamese") {
    return enforceMinimumPreviewLength(
      `Xin chào, đây là mẫu giọng đọc cho video ${topic}. Bạn hãy nghe thử và chọn giọng phù hợp nhất.`,
      language,
      topic
    );
  }

  return enforceMinimumPreviewLength(
    `Xin chào, đây là mẫu giọng đọc cho video ${topic}. Bạn hãy nghe thử và chọn giọng phù hợp nhất.`,
    language,
    topic
  );
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
