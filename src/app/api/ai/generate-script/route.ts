import { NextRequest, NextResponse } from "next/server";

interface GenerateScriptRequest {
  topic: string;
  characterDescription?: string;
  contentTone?: string;
  numberOfScenes?: number;
}

/**
 * Generate video script using Claude or similar API
 * For now, this is a placeholder that returns a template script
 * In production, you would integrate with Claude API or similar
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateScriptRequest;

    const {
      topic,
      characterDescription = "A farmer",
      contentTone = "Engaging",
      numberOfScenes = 3,
    } = body;

    // Template script generator (replace with actual AI API call)
    const script = generateTemplateScript(
      topic,
      characterDescription,
      contentTone,
      numberOfScenes
    );

    return NextResponse.json({
      data: {
        script,
        estimatedDuration: `${Math.min(numberOfScenes * 5, 60)} seconds`,
        sceneCount: numberOfScenes,
      },
    });
  } catch (error) {
    console.error("POST /api/ai/generate-script error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}

/**
 * Generate a template video script
 * TODO: Replace with actual Claude/OpenAI API integration
 */
function generateTemplateScript(
  topic: string,
  character: string,
  tone: string,
  scenes: number
): string {
  const sceneScripts: string[] = [];

  for (let i = 1; i <= scenes; i++) {
    const sceneContent = generateSceneContent(
      i,
      scenes,
      topic,
      character,
      tone
    );
    sceneScripts.push(sceneContent);
  }

  return sceneScripts.join("\n\n---\n\n");
}

function generateSceneContent(
  sceneNum: number,
  totalScenes: number,
  topic: string,
  character: string,
  tone: string
): string {
  const introScenes: Record<string, string> = {
    1: `SCENE ${sceneNum} - INTRODUCTION
${character} appears on screen, looking directly at the camera with a warm smile.

NARRATION: "Chào bạn! Hôm nay tôi muốn giới thiệu với bạn về ${topic}."

VISUAL: Close-up of ${topic} being held or displayed beautifully.`,
  };

  const middleScenes: Record<string, string> = {
    2: `SCENE ${sceneNum} - HIGHLIGHTS
${character} is shown interacting with ${topic}, pointing out key features.

NARRATION: "Điều đặc biệt về ${topic} là chất lượng và độ tươi mới."

VISUAL: Multiple angles showing the best features of ${topic}.`,
  };

  const closingScenes: Record<string, string> = {
    3: `SCENE ${sceneNum} - CLOSING
${character} gives a goodbye gesture to camera.

NARRATION: "Cảm ơn các bạn đã xem! Hãy thử ${topic} hôm nay nhé!"

VISUAL: ${topic} in perfect lighting, fade to white.`,
  };

  if (sceneNum === 1) {
    return introScenes[1];
  } else if (sceneNum === totalScenes) {
    return closingScenes[totalScenes];
  } else {
    return middleScenes[2] || middleScenes[sceneNum.toString()] || middleScenes[2];
  }
}
