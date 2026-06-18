export interface ParsedScene {
  sceneNo: number;
  visualPrompt: string;
  voiceover: string;
  rawText: string;
}

// Strip "CharacterName: dialogue" prefixes that AI models sometimes add despite instructions.
// Only removes the prefix when the part before ": " contains no commas (names don't have commas)
// and is at most 40 chars — short enough to be a role label, not a sentence opener.
function stripActorPrefixes(voiceover: string): string {
  return voiceover
    .split("\n")
    .map((line) => line.replace(/^[^,\n]{2,40}:\s+(?=\S)/, ""))
    .join("\n");
}

export function parseScriptIntoScenes(script: string): ParsedScene[] {
  if (!script?.trim()) {
    return [];
  }

  const normalized = script.replace(/\r\n/g, "\n").trim();

  // Find all SCENE N headings and their positions
  const headingRegex = /(?:^|\n)(SCENE\s+(\d+))\s*(?:\n|$)/gi;
  const headings: Array<{ pos: number; sceneNo: number }> = [];
  let m: RegExpExecArray | null;

  while ((m = headingRegex.exec(normalized)) !== null) {
    const lineStart = m.index + (m[0].startsWith("\n") ? 1 : 0);
    headings.push({ pos: lineStart, sceneNo: parseInt(m[2], 10) });
  }

  if (headings.length === 0) {
    return [];
  }

  const scenes: ParsedScene[] = [];

  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].pos;
    const end = i < headings.length - 1 ? headings[i + 1].pos : normalized.length;
    const chunk = normalized.slice(start, end).trim();

    // Remove the SCENE N line itself
    const body = chunk.replace(/^SCENE\s+\d+\s*\n?/i, "").trim();

    const visualMatch = body.match(/Cảnh quay\s*:\s*([\s\S]*?)(?:\nLời thoại\s*:|$)/i);
    const voiceMatch = body.match(/Lời thoại\s*:\s*([\s\S]*?)$/i);

    scenes.push({
      sceneNo: headings[i].sceneNo,
      visualPrompt: (visualMatch?.[1] ?? "").trim(),
      voiceover: stripActorPrefixes((voiceMatch?.[1] ?? "").trim()),
      rawText: chunk,
    });
  }

  return scenes;
}

export function buildSceneSlotsForClips(
  scenes: ParsedScene[],
  clipsNeeded: number
): ParsedScene[] {
  if (scenes.length === 0 || clipsNeeded <= 0) {
    return [];
  }

  const result: ParsedScene[] = [];
  for (let i = 0; i < clipsNeeded; i++) {
    result.push(scenes[i % scenes.length]);
  }
  return result;
}
