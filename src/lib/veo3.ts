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

type FruitAnchor = {
  canonical: string;
  aliases: string[];
};

const FRUIT_ANCHORS: FruitAnchor[] = [
  { canonical: "dragon fruit", aliases: ["thanh long", "dragon fruit", "pitaya"] },
  { canonical: "strawberry", aliases: ["dau tay", "dâu tây", "strawberry"] },
  { canonical: "melon", aliases: ["dua luoi", "dưa lưới", "melon", "cantaloupe", "muskmelon"] },
  { canonical: "mango", aliases: ["xoai", "xoài", "mango"] },
  { canonical: "banana", aliases: ["chuoi", "chuối", "banana"] },
  { canonical: "orange", aliases: ["cam", "orange"] },
  { canonical: "apple", aliases: ["tao", "táo", "apple"] },
];

function normalizeForMatch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectFruitAnchor(...inputs: Array<string | undefined>): string | undefined {
  const merged = normalizeForMatch(inputs.filter(Boolean).join(" "));
  if (!merged) {
    return undefined;
  }

  for (const fruit of FRUIT_ANCHORS) {
    if (fruit.aliases.some((alias) => merged.includes(normalizeForMatch(alias)))) {
      return fruit.canonical;
    }
  }

  return undefined;
}

interface GeneratedVideoFile {
  uri?: string;
  name?: string;
}

interface GeneratedVideo {
  video?: GeneratedVideoFile;
}

interface GenerateVideosResponse {
  generatedVideos?: GeneratedVideo[];
}

interface VeoVideosOperation {
  done?: boolean;
  name?: string;
  response?: GenerateVideosResponse;
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
    const modelsClient = genAI.models as unknown as {
      generateVideos: (args: { model: string; prompt: string }) => Promise<VeoVideosOperation>;
    };
    const operationsClient = genAI.operations as unknown as {
      getVideosOperation: (args: { operation: VeoVideosOperation }) => Promise<VeoVideosOperation>;
    };

    let operation = await modelsClient.generateVideos({
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

      operation = await operationsClient.getVideosOperation({
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
    const videoUrl = videoFile.uri || videoFile.name || "video.mp4";

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
  otherDetails?: Record<string, unknown>
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

  const referenceImageSourceLabel =
    otherDetails?.referenceImageSource === "url"
      ? "web URL"
      : otherDetails?.referenceImageSource === "upload"
      ? "uploaded file"
      : "provided image";

  const referenceProductAnchor =
    typeof otherDetails?.referenceImageName === "string" &&
    otherDetails.referenceImageName.trim().length > 0
      ? otherDetails.referenceImageName.trim().replace(/\.[a-z0-9]+$/i, "")
      : typeof otherDetails?.storyTopic === "string"
      ? otherDetails.storyTopic.trim()
      : "the referenced product";

  const referenceImageGuidance = otherDetails?.hasReferenceImage
    ? [
        "Reference image rules (must follow):",
        `- Reference image source: ${referenceImageSourceLabel}.`,
        `- Product anchor: ${referenceProductAnchor}.`,
        "- Use the reference image only to match PRODUCT identity (fruit/product type, color, texture, shape).",
        "- The same anchored product must stay present from beginning to end, not only in the first second.",
        "- Ensure the anchored product appears clearly in every shot (hero visibility in each scene).",
        "- Keep product details consistent across all scenes: color tone, texture, size ratio, and recognizable shape.",
        "- The PRODUCT can look similar to the reference image; all non-product elements must be generated from script context.",
        "- Do not copy background, camera angle, scene layout, logo, packaging text, watermark, or unrelated objects from the image.",
        "- Keep the presenter/character and actions aligned with the script in every scene.",
        "- Follow script progression shot-by-shot; avoid turning the video into a static slideshow of the reference image.",
        "- Never replace the scripted story with pure product closeups only.",
      ].join("\n")
    : "";

  const detectedFruitAnchor = detectFruitAnchor(
    typeof otherDetails?.storyTopic === "string" ? otherDetails.storyTopic : undefined,
    script,
    typeof otherDetails?.referenceImageName === "string" ? otherDetails.referenceImageName : undefined
  );

  const mainProductTopic =
    typeof otherDetails?.storyTopic === "string" && otherDetails.storyTopic.trim().length > 0
      ? otherDetails.storyTopic.trim()
      : detectedFruitAnchor || referenceProductAnchor;

  const productLockHints: string[] = [
    "Product lock (critical, must follow):",
    `- Main product identity: ${mainProductTopic}.`,
    detectedFruitAnchor ? `- Canonical fruit anchor: ${detectedFruitAnchor}.` : "",
    "- Never replace the main product with a different fruit/product in any shot.",
    "- Keep the same fruit type consistent from first shot to last shot.",
    "- The hero fruit must stay clearly visible in every scene.",
  ];

  const normalizedTopic = mainProductTopic.toLowerCase();
  if (
    (normalizedTopic.includes("thanh long") || normalizedTopic.includes("dragon fruit")) ||
    detectedFruitAnchor === "dragon fruit"
  ) {
    productLockHints.push(
      "- If topic is thanh long (dragon fruit), do not generate apple/orange/banana/grape as the hero product."
    );
  }

  if (detectedFruitAnchor && detectedFruitAnchor !== "apple") {
    productLockHints.push(
      "- Do not generate apple as the hero product unless apple is explicitly the requested topic."
    );
  }

  const cappedCharacterDescription =
    typeof otherDetails?.characterDescription === "string"
      ? otherDetails.characterDescription.trim().slice(0, 220)
      : "";

  const narrationGuide =
    typeof otherDetails?.narrationGuide === "string"
      ? otherDetails.narrationGuide.replace(/\s+/g, " ").trim().slice(0, 420)
      : "";

  // Keep style directives first so they survive provider-side prompt trimming.
  const directionBlock = [
    "Create a professional fruit product video.",
    ...productLockHints,
    `Visual style: ${visualStyle}.`,
    `Emotional tone: ${emotionStyle}.`,
    `Motion level: ${intensityLevel}; ${cameraMovement}.`,
    `Editing direction: ${transitionGuidance}.`,
    `Continuity direction: ${subjectConsistencyGuidance}.`,
    otherDetails?.videoGenre ? `Genre: ${otherDetails.videoGenre}.` : "",
    otherDetails?.sceneLocation ? `Scene location: ${otherDetails.sceneLocation}.` : "",
    cappedCharacterDescription ? `Character direction: ${cappedCharacterDescription}.` : "",
    otherDetails?.contentTone ? `Content tone: ${otherDetails.contentTone}.` : "",
    referenceImageGuidance,
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
    "- Keep scene order, narrative intent, and dialogue beats aligned to the script.",
    otherDetails?.hasReferenceImage
      ? "- Maintain continuous on-screen presence of the anchored product in all scenes while character actions progress the story."
      : "",
    "- If there is a conflict, prioritize script narrative for scene composition and action, while preserving product look similarity from reference image only.",
    narrationGuide ? "- Keep character mouth movement synchronized with the exact spoken narration lines below." : "",
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

  const spokenLinesBlock = narrationGuide
    ? `Spoken narration lines (exact words to align lip movement):\n${narrationGuide}`
    : "";

  return `${directionBlock}\n\n${narrativeBlock}\n\nScript context:\n${scriptExcerpt}${spokenLinesBlock ? `\n\n${spokenLinesBlock}` : ""}`.trim();
}
