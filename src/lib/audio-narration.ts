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

export function extractDialogueLinesFromScript(script: string): string[] {
  const normalizedScript = script.replace(/\r\n/g, "\n");
  const sceneBlocks = normalizedScript
    .split(/(^|\n)\s*SCENE\s+\d+\s*/gi)
    .map((block) => block.trim())
    .filter(Boolean);

  const orderedDialogueLines: string[] = [];

  for (const block of sceneBlocks.length > 0 ? sceneBlocks : [normalizedScript]) {
    const blockDialogueLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^(LỜI THOẠI|LOI THOAI)\s*:/i.test(line))
      .map((line) => line.replace(/^(LỜI THOẠI|LOI THOAI)\s*:\s*/i, ""))
      .map((line) => line.replace(/^"|"$/g, ""))
      .filter(Boolean);

    orderedDialogueLines.push(...blockDialogueLines);
  }

  if (orderedDialogueLines.length > 0) {
    return orderedDialogueLines;
  }

  const inlineDialogueMatches = [...normalizedScript.matchAll(/(?:^|\n)\s*(?:LỜI THOẠI|LOI THOAI)\s*:\s*([^\n]+)/gi)]
    .map((match) => match[1]?.trim().replace(/^"|"$/g, "") || "")
    .filter(Boolean);

  return inlineDialogueMatches;
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
  const scriptLines = script ? extractDialogueLinesFromScript(script) : [];
  const raw = scriptLines.join(" ").trim();

  // When script dialogue exists, keep narration text strictly aligned with script lines
  // so on-screen lip movement has a better chance to match generated audio.
  const combined = normalizeSpacing(raw);
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
