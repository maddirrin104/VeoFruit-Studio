import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}

const genAI = new GoogleGenAI({ apiKey });

export class Veo3Error extends Error {
  code: "QUOTA_EXCEEDED" | "RATE_LIMITED" | "API_ERROR";
  retryable: boolean;

  constructor(
    message: string,
    code: "QUOTA_EXCEEDED" | "RATE_LIMITED" | "API_ERROR",
    retryable: boolean
  ) {
    super(message);
    this.name = "Veo3Error";
    this.code = code;
    this.retryable = retryable;
  }
}

function normalizeVeo3Error(error: unknown): Veo3Error {
  const status = (error as { status?: number })?.status;
  const rawMessage = (error as Error)?.message || "Unknown Veo3 error";
  const lowerMessage = rawMessage.toLowerCase();

  if (
    status === 429 &&
    (lowerMessage.includes("quota") ||
      lowerMessage.includes("resource_exhausted") ||
      lowerMessage.includes("exceeded your current quota"))
  ) {
    return new Veo3Error(
      "Bạn đã vượt quota Veo3/Gemini API. Vui lòng nâng hạn mức hoặc đợi reset quota rồi thử lại.",
      "QUOTA_EXCEEDED",
      false
    );
  }

  if (status === 429 || lowerMessage.includes("rate limit")) {
    return new Veo3Error(
      "API Veo3 đang bị giới hạn tần suất. Vui lòng thử lại sau ít phút.",
      "RATE_LIMITED",
      true
    );
  }

  return new Veo3Error(
    `Veo3 video generation failed: ${rawMessage}`,
    "API_ERROR",
    true
  );
}

export interface Veo3VideoRequest {
  prompt: string;
  duration?: number; // seconds, between 5 and 120
}

export interface Veo3VideoResponse {
  videoUrl: string;
  duration: number;
  operationId: string;
}

/**
 * Generate video using Veo3.1 model
 * @param prompt The text prompt describing the video
 * @param durationSeconds Duration of the video in seconds (5-120)
 * @returns Video URL and metadata
 */
export async function generateVideoWithVeo3(
  prompt: string,
  durationSeconds: number = 15
): Promise<Veo3VideoResponse> {
  try {
    console.log(`[Veo3] Generating video with prompt: ${prompt.substring(0, 100)}...`);
    
    // Start video generation
    let operation = await (genAI.models as any).generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: prompt,
    });

    const startTime = Date.now();
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes max wait

    // Poll operation status until ready
    while (!operation.done) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > maxWaitTime) {
        throw new Error("Video generation timeout after 10 minutes");
      }

      console.log("[Veo3] Waiting for video generation... (polling in 5s)");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      operation = await genAI.operations.getVideosOperation({
        operation: operation,
      });
    }

    if (!operation.response?.generatedVideos?.[0]?.video) {
      throw new Error("No video generated in response");
    }

    const generatedVideo = operation.response?.generatedVideos?.[0];
    if (!generatedVideo?.video) {
      throw new Error("No video generated in response");
    }
    
    const videoFile = generatedVideo.video;

    // Get download URL or store the video
    const videoUrl = (videoFile as any).uri || (videoFile as any).name || "video.mp4";

    console.log(`[Veo3] ✅ Video generated successfully: ${videoUrl}`);

    return {
      videoUrl,
      duration: durationSeconds,
      operationId: operation.name || "",
    };
  } catch (error) {
    console.error("[Veo3] ❌ Video generation failed:", error);
    throw normalizeVeo3Error(error);
  }
}

/**
 * Build a detailed video prompt from configuration
 */
export function buildVideoPrompt(
  script: string,
  emotionStyle: string,
  visualStyle: string,
  motionIntensity: number,
  otherDetails?: Record<string, any>
): string {
  const intensityLevel =
    motionIntensity < 33
      ? "slow and calm"
      : motionIntensity < 67
      ? "moderate"
      : "dynamic and fast-paced";

  const cameraMovement =
    motionIntensity < 33
      ? "minimal camera movement, stable framing"
      : motionIntensity < 67
      ? "balanced camera movement with gentle push-ins"
      : "energetic camera movement with quick but controlled reframing";

  const transitionGuidance = otherDetails?.transitionEnabled
    ? "smooth transitions between shots"
    : "hard cuts only, no transition effects";

  const subjectConsistencyGuidance = otherDetails?.subjectConsistent
    ? "keep the same main subject identity and appearance consistent across all shots"
    : "subject consistency can vary naturally between shots";

  const cappedCharacterDescription =
    typeof otherDetails?.characterDescription === "string"
      ? otherDetails.characterDescription.trim().slice(0, 220)
      : "";

  // Keep style directives first so they survive provider-side prompt trimming.
  const directionBlock = [
    "Create a professional fruit product video.",
    `Visual style: ${visualStyle}.`,
    `Emotional tone: ${emotionStyle}.`,
    `Motion level: ${intensityLevel}; ${cameraMovement}.`,
    `Editing direction: ${transitionGuidance}.`,
    `Continuity direction: ${subjectConsistencyGuidance}.`,
    otherDetails?.videoGenre ? `Genre: ${otherDetails.videoGenre}.` : "",
    otherDetails?.sceneLocation ? `Scene location: ${otherDetails.sceneLocation}.` : "",
    cappedCharacterDescription ? `Character direction: ${cappedCharacterDescription}.` : "",
    otherDetails?.contentTone ? `Content tone: ${otherDetails.contentTone}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Narrative constraints are explicit so script/character choices are not ignored.
  const narrativeBlock = [
    "Narrative requirements (must follow):",
    otherDetails?.storyTopic ? `- Main topic: ${otherDetails.storyTopic}.` : "",
    otherDetails?.characterType ? `- Character type: ${otherDetails.characterType}.` : "",
    cappedCharacterDescription ? `- Character persona: ${cappedCharacterDescription}.` : "",
    otherDetails?.contentTone ? `- Dialogue tone: ${otherDetails.contentTone}.` : "",
    otherDetails?.videoGenre ? `- Genre framing: ${otherDetails.videoGenre}.` : "",
    otherDetails?.sceneLocation ? `- Primary location: ${otherDetails.sceneLocation}.` : "",
    otherDetails?.numberOfScenes
      ? `- Target structure: approximately ${otherDetails.numberOfScenes} scenes.`
      : "",
    "- Respect the script flow and key talking points below.",
  ]
    .filter(Boolean)
    .join("\n");

  // Reserve room for style controls by capping script payload before outer truncation.
  const normalizedScript = script.replace(/\s+/g, " ").trim();
  const maxScriptChars = 560;
  const scriptExcerpt =
    normalizedScript.length > maxScriptChars
      ? `${normalizedScript.slice(0, 360)} ... ${normalizedScript.slice(-180)}`
      : normalizedScript;

  return `${directionBlock}\n\n${narrativeBlock}\n\nScript context:\n${scriptExcerpt}`.trim();
}
