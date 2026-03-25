export interface NarrationContextInput {
  script?: string;
  storyTopic?: string;
  contentTone?: string;
  videoGenre?: string;
  sceneLocation?: string;
  durationSeconds?: number;
  language: string;
  readSpeed: number;
}

function pickLinesFromScript(script: string): string[] {
  const dialogueLines = script
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^(LỜI THOẠI|LOI THOAI)\s*:/i.test(line))
    .map((line) => line.replace(/^(LỜI THOẠI|LOI THOAI)\s*:\s*/i, ""))
    .map((line) => line.replace(/^"|"$/g, ""))
    .filter(Boolean);

  if (dialogueLines.length > 0) {
    return dialogueLines;
  }

  return script
    .replace(/SCENE\s*\d+[^\n]*/gi, "")
    .replace(/(BỐI CẢNH|BOI CANH|NHÂN VẬT|NHAN VAT|HÌNH ẢNH|HINH ANH)\s*:/gi, "")
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function estimateWordsPerMinute(language: string): number {
  if (language === "English") {
    return 155;
  }

  if (language === "한국어" || language === "日本語") {
    return 135;
  }

  return 145;
}

function normalizeSpacing(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function limitNarrationLength(text: string, targetWords: number): string {
  const words = text.split(" ").filter(Boolean);
  if (words.length <= targetWords) {
    return text;
  }

  const trimmed = words.slice(0, Math.max(12, targetWords)).join(" ");
  const lastSentenceIndex = Math.max(trimmed.lastIndexOf("."), trimmed.lastIndexOf("!"), trimmed.lastIndexOf("?"));
  if (lastSentenceIndex > 40) {
    return trimmed.slice(0, lastSentenceIndex + 1);
  }

  return `${trimmed}.`;
}

export function buildNarrationText(context: NarrationContextInput): string {
  const script = context.script?.trim() || "";
  const scriptLines = script ? pickLinesFromScript(script) : [];
  const raw = scriptLines.join(" ").trim();

  const contextSeed = [
    context.storyTopic ? `Hôm nay chúng ta cùng khám phá ${context.storyTopic}.` : "",
    context.videoGenre ? `Theo phong cách ${context.videoGenre.toLowerCase()}.` : "",
    context.sceneLocation ? `Bối cảnh tại ${context.sceneLocation.toLowerCase()}.` : "",
    context.contentTone ? `Tông nội dung ${context.contentTone.toLowerCase()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const combined = normalizeSpacing(`${contextSeed} ${raw}`);
  const fallback = normalizeSpacing(
    `Hôm nay chúng tôi giới thiệu ${context.storyTopic || "sản phẩm trái cây tươi"} với phong cách tự nhiên và gần gũi.`
  );

  const narration = combined || fallback;

  const baseWpm = estimateWordsPerMinute(context.language);
  const speedMultiplier = 0.75 + (Math.min(100, Math.max(0, context.readSpeed)) / 100) * 0.5;
  const targetSeconds = Math.max(4, Math.min(90, context.durationSeconds || 15));
  const targetWords = Math.max(16, Math.round((baseWpm * speedMultiplier * targetSeconds) / 60));

  return limitNarrationLength(narration, targetWords);
}

export function estimateNarrationDurationSeconds(
  text: string,
  language: string,
  readSpeed: number
): number {
  const words = text.split(" ").filter(Boolean).length;
  const baseWpm = estimateWordsPerMinute(language);
  const speedMultiplier = 0.75 + (Math.min(100, Math.max(0, readSpeed)) / 100) * 0.5;
  const wordsPerSecond = (baseWpm * speedMultiplier) / 60;

  return Number((words / Math.max(wordsPerSecond, 0.1)).toFixed(1));
}
