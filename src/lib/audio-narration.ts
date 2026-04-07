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

type SceneBlock = {
  sceneNo: number | null;
  content: string;
};

function splitSceneBlocks(script: string): SceneBlock[] {
  const normalized = script.replace(/\r\n/g, "\n");
  const parts = normalized.split(/(?:^|\n)\s*SCENE\s+(\d+)\s*/gi);

  if (parts.length < 3) {
    return [{ sceneNo: null, content: normalized }];
  }

  const blocks: SceneBlock[] = [];
  for (let index = 1; index < parts.length; index += 2) {
    const sceneNo = Number(parts[index]);
    const content = (parts[index + 1] || "").trim();
    if (content) {
      blocks.push({ sceneNo: Number.isFinite(sceneNo) ? sceneNo : null, content });
    }
  }

  return blocks.length > 0 ? blocks : [{ sceneNo: null, content: normalized }];
}

function extractDialogueFromBlock(block: string): string[] {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const dialogueLines: string[] = [];
  let inDialogue = false;

  for (const line of lines) {
    if (/^(LỜI THOẠI|LOI THOAI)\s*:/i.test(line)) {
      inDialogue = true;
      const sameLineDialogue = line
        .replace(/^(LỜI THOẠI|LOI THOAI)\s*:\s*/i, "")
        .replace(/^"|"$/g, "")
        .trim();

      if (sameLineDialogue) {
        dialogueLines.push(sameLineDialogue);
      }
      continue;
    }

    if (/^(CẢNH QUAY|CANH QUAY)\s*:/i.test(line) || /^SCENE\s+\d+/i.test(line)) {
      inDialogue = false;
      continue;
    }

    if (!inDialogue) {
      continue;
    }

    const cleaned = line.replace(/^[-*•]\s*/, "").replace(/^"|"$/g, "").trim();
    if (cleaned) {
      dialogueLines.push(cleaned);
    }
  }

  return dialogueLines;
}

export function extractDialogueLinesFromScript(script: string, sceneNumber?: number): string[] {
  const blocks = splitSceneBlocks(script);
  const selectedBlocks =
    sceneNumber !== undefined
      ? blocks.filter((block) => block.sceneNo === sceneNumber)
      : blocks;

  const dialogueLines = selectedBlocks.flatMap((block) => extractDialogueFromBlock(block.content));

  if (dialogueLines.length > 0) {
    return dialogueLines;
  }

  const normalizedScript = script.replace(/\r\n/g, "\n");
  return [...normalizedScript.matchAll(/(?:^|\n)\s*(?:LỜI THOẠI|LOI THOAI)\s*:\s*([^\n]+)/gi)]
    .map((match) => match[1]?.trim().replace(/^"|"$/g, "") || "")
    .filter(Boolean);
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
  const sceneOneScriptLines = script ? extractDialogueLinesFromScript(script, 1) : [];
  const scriptLines =
    sceneOneScriptLines.length > 0
      ? sceneOneScriptLines
      : script
      ? extractDialogueLinesFromScript(script)
      : [];
  const raw = scriptLines.join(" ").trim();

  // When script dialogue exists, keep narration text strictly aligned with script lines
  // so on-screen lip movement has a better chance to match generated audio.
  const combined = normalizeSpacing(raw);
  const fallback = normalizeSpacing(
    `Hôm nay chúng tôi giới thiệu ${context.storyTopic || "sản phẩm trái cây tươi"} với phong cách tự nhiên và gần gũi.`
  );

  if (combined) {
    // If script dialogue exists, keep full Scene 1 narration without word trimming.
    return combined;
  }

  const narration = fallback;

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
