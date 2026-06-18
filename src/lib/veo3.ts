import { GoogleGenAI } from "@google/genai";
import { getRuntimeSettings } from "@/lib/runtime-settings";

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

function buildLocationLockHints(sceneLocation?: string): string[] {
  const normalized = (sceneLocation || "").trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const hints = [
    "Location lock (critical, must follow):",
    `- Selected location: ${sceneLocation}.`,
    "- All scenes must remain in this selected location context.",
    "- Do not switch to a different place category than selected.",
  ];

  if (normalized.includes("nông trại") || normalized.includes("nong trai") || normalized.includes("farm")) {
    hints.push("- Use farm visuals only: orchard rows, cultivation area, harvest/basket zones, and farm pathways.");
    hints.push("- Forbidden location shifts: market stalls, supermarket aisles, shopping mall counters, urban store interiors.");
  }

  if (normalized.includes("chợ") || normalized.includes("cho")) {
    hints.push("- Keep market context consistently: stalls, handwritten price signs, open-air market rhythm.");
    hints.push("- Forbidden location shifts: farm fields, supermarket aisles, studio kitchen sets.");
  }

  if (normalized.includes("siêu thị") || normalized.includes("sieu thi") || normalized.includes("trung tâm thương mại") || normalized.includes("trung tam thuong mai")) {
    hints.push("- Keep modern retail context consistently: clean counters, indoor commercial lighting, shelf organization.");
    hints.push("- Forbidden location shifts: open-air market scenes and farm field/orchard scenes.");
  }

  if (normalized.includes("cửa hàng") || normalized.includes("cua hang") || normalized.includes("shop")) {
    hints.push("- Keep fruit-shop context consistently: compact storefront vibe, product display shelves/tables, close and personal seller-customer interaction.");
    hints.push("- Shop interior: organized fruit displays, vendor area, maybe a counter or scale visible, warm and welcoming atmosphere.");
    hints.push("- Forbidden location shifts: farm orchards, supermarket aisle look with overstocked shelves, open-air market stalls, warehouse feel.");
    hints.push("- Focus on hero fruit prominently displayed in the shop (on counter, table, or in vendor's hand).");
  }

  if (normalized.includes("bếp") || normalized.includes("bep") || normalized.includes("kitchen")) {
    hints.push("- Keep home-kitchen context consistently: countertop prep, family-home atmosphere.");
    hints.push("- Forbidden location shifts: market stalls, farm fields, supermarket aisle look.");
  }

  return hints;
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
export type Veo3Model = "veo-3.1-generate-preview" | "veo-3.1-fast" | "veo-3.1-lite";

export async function generateVideoWithVeo3(
  prompt: string,
  durationSeconds: number = 15,
  model: Veo3Model = "veo-3.1-fast"
): Promise<Veo3VideoResponse> {
  try {
    const runtime = await getRuntimeSettings();
    if (!runtime.googleApiKey) {
      throw new Veo3Error(
        "GOOGLE_API_KEY chưa được cấu hình. Hãy mở phần Settings trong app để nhập API key Veo3/Gemini.",
        "API_ERROR",
        false
      );
    }

    const genAI = new GoogleGenAI({ apiKey: runtime.googleApiKey });

    console.log(`[Veo3] Generating video with prompt: ${prompt.substring(0, 100)}...`);
    
    // Start video generation
    const modelsClient = genAI.models as unknown as {
      generateVideos: (args: { model: string; prompt: string; config?: { durationSeconds?: number; numberOfVideos?: number; aspectRatio?: string } }) => Promise<VeoVideosOperation>;
    };
    const operationsClient = genAI.operations as unknown as {
      getVideosOperation: (args: { operation: VeoVideosOperation }) => Promise<VeoVideosOperation>;
    };

    let operation = await modelsClient.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        durationSeconds: durationSeconds,
      },
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
 * Build a concise image-to-video prompt for Runway Gen4 Turbo.
 * Gen4 Turbo receives the reference image separately, so the prompt only needs
 * to describe motion, character action, and shot style — not the visual content.
 */
export type ImageAngle = "eye_level" | "diagonal" | "close_up" | "top_down";

export function buildGen4TurboPrompt(options: {
  storyTopic?: string;
  script?: string;
  characterDescription?: string;
  sceneLocation?: string;
  emotionStyle?: string;
  visualStyle?: string;
  motionIntensity?: number;
  contentTone?: string;
  imageAngle?: ImageAngle;
}): string {
  const {
    storyTopic,
    characterDescription,
    sceneLocation,
    emotionStyle,
    visualStyle,
    contentTone,
    imageAngle = "eye_level",
  } = options;

  // Cap character description: Runway has a hard prompt limit (~1000 chars).
  // Long or Vietnamese descriptions bloat the prompt and push critical constraints off the end.
  const isAscii = (s: string) => /^[\x20-\x7E]*$/.test(s);
  const charDescRaw = characterDescription?.trim() ?? "";
  const charDesc =
    charDescRaw.length > 0 && charDescRaw.length <= 45 && isAscii(charDescRaw)
      ? charDescRaw
      : "a professional female sales advisor";

  const productRef = storyTopic?.trim() || "the featured product";
  // Keep setting brief to save chars
  const setting = sceneLocation?.trim() ? `${sceneLocation}.` : "";
  const styleShort = (visualStyle || "Cinematic") + " style, 4K.";

  // Normalize expressionDesc — always produce ASCII English to avoid Vietnamese leaking in
  const expressionDesc =
    contentTone?.toLowerCase().includes("sang trọng") ||
    contentTone?.toLowerCase().includes("luxury") ||
    contentTone?.toLowerCase().includes("premium")
      ? "Elegant presentation."
      : contentTone?.toLowerCase().includes("vui") ||
        contentTone?.toLowerCase().includes("fun") ||
        contentTone?.toLowerCase().includes("cheerful")
      ? "Upbeat, smiling."
      : emotionStyle && isAscii(emotionStyle.trim()) && emotionStyle.trim().length > 0
      ? emotionStyle.trim() + "."
      : "Warm, welcoming smile.";

  // Camera motion varies by angle
  const cameraMotion = buildGen4CameraMotion(imageAngle);

  // Character definition goes FIRST so Runway locks onto the correct protagonist before
  // reading any camera motion — prevents it from using background workers or bystanders.
  const characterLock =
    `${charDesc} — Vietnamese or East Asian female sales presenter. Standing upright, facing directly into camera, warm professional smile. NOT a farm worker, NOT crouching, NOT a background bystander.`;

  // Compact template — ~700 chars total to stay safely under Runway's limit
  const parts = [
    characterLock,
    cameraMotion,
    "She points at the fruits while speaking to camera — no picking up, touching, or moving fruits.",
    "CRITICAL: Fruits from reference image stay whole, untouched, in exact original positions.",
    "Camera motion only — she does not appear, fade in, or materialize.",
    `Eye-level medium shot. Product: ${productRef}.`,
    setting,
    styleShort,
    expressionDesc,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return parts;
}

function buildGen4CameraMotion(imageAngle: ImageAngle): string {
  switch (imageAngle) {
    case "diagonal":
      return "Camera zooms out along a gentle diagonal from the fruit display in the reference image. She was already standing to the side of the display, just outside the initial frame.";

    case "close_up":
      return "Camera zooms out from the close-up of the fruit in the reference image to a natural eye-level composition. She was already standing beside the display, just outside the tight crop.";

    case "top_down":
      return "Camera tilts up from the overhead view of the fruit display to a natural eye-level angle. She was already standing upright behind the display, below the initial overhead field of view.";

    case "eye_level":
    default:
      return "Camera smoothly pulls back from the fruit display in the reference image. She was already standing behind the display, just outside the initial frame.";
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
    : "single continuous shot, no cuts, no transition effects";

  const singleShotLockGuidance =
    otherDetails?.hasReferenceImage && !otherDetails?.transitionEnabled
      ? [
          "Single-shot lock (must follow when transitions are disabled):",
          "- Use one continuous shot only from start to end (no scene change, no cutaway, no location switch).",
          "- Keep the anchored fruit visible the whole time as the visual center.",
          "- Keep the presenter visible in the frame the whole time as well, even during close-up shots (hand, shoulder, side profile, or full body near the fruit).",
          "- Do not create a fruit-only opening; the presenter must already be present from the first frame.",
          "- Place the presenter standing beside the fruit, speaking naturally to camera while pointing/gesturing to that same fruit.",
          "- Do not switch to orchard, farm rows, market B-roll, or unrelated scenery.",
          "- Final 20-30% duration: perform a slow push-in/zoom-in to a close-up of the same anchored fruit.",
          "- Do not replace the fruit during the zoom-in; keep identical fruit identity and texture.",
        ].join("\n")
      : "";

  const presenterFruitSequenceGuidance =
    otherDetails?.hasReferenceImage
      ? [
          "Required shot choreography (must follow in order):",
          "- Beat 1 (opening 20-30%): start with a close-up of the anchored fruit from the uploaded image, but keep the presenter partially visible in frame (hand, shoulder, or side profile) so the character never disappears.",
          "- Beat 2 (middle 40-60%): smoothly widen/zoom-out to reveal a presenter standing beside the same fruit, pointing to it and introducing it while keeping fruit clearly visible.",
          "- Beat 3 (ending 20-30%): smoothly zoom-in back to the same anchored fruit while the presenter remains visible in the frame or just behind it.",
          "- Never switch to a different fruit between these beats.",
          "- Never replace the middle beat with unrelated scenery or orchard montage.",
        ].join("\n")
      : "";

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

  const referenceImageGuidance = otherDetails?.hasBrandBackgroundImage
    ? [
        otherDetails?.hasReferenceImage
          ? "Reference image rules (composite product + brand background, must follow):"
          : "Reference image rules (brand background guide, must follow):",
        `- Product anchor: ${referenceProductAnchor}.`,
        `- Brand/background anchor: ${typeof otherDetails?.brandBackgroundImageName === "string" && otherDetails.brandBackgroundImageName.trim().length > 0 ? otherDetails.brandBackgroundImageName.trim() : "uploaded brand storefront image"}.`,
        otherDetails?.hasReferenceImage
          ? "- The reference image should be treated as a combined visual guide: fruit identity comes from the product reference, and the storefront/background identity comes from the brand reference."
          : "- The uploaded brand/background image should define the storefront, signage placement, counter layout, and overall brand feel.",
        "- Keep the storefront, signage placement, counter layout, and brand feel consistent with the brand/background image.",
        "- Keep the anchored fruit clearly visible in every shot as the HERO OBJECT, occupying the main visual focus in the frame.",
        "- Keep product details consistent across all scenes: color tone, texture, size ratio, and recognizable shape.",
        "- Do not replace the fruit with a different product, but also do not flatten the scene into a pure product still-life; the brand storefront should remain the setting.",
        "- The presenter/character can stand beside or in front of the storefront, but must not block the fruit hero.",
        "- Follow script progression shot-by-shot; keep the advertisement feeling like the same real brand location throughout.",
      ].join("\n")
    : otherDetails?.hasReferenceImage
    ? [
        "Reference image rules (must follow):",
        `- Reference image source: ${referenceImageSourceLabel}.`,
        `- Product anchor: ${referenceProductAnchor}.`,
        "- Use the reference image only to match PRODUCT identity (fruit/product type, color, texture, shape), not to copy its whole composition.",
        "- The same anchored product must stay present from beginning to end, not only in the first second.",
        "- Ensure the anchored product appears clearly in every shot as the HERO OBJECT, occupying the main visual focus in the frame.",
        "- Keep product details consistent across all scenes: color tone, texture, size ratio, and recognizable shape.",
        "- The PRODUCT can look similar to the reference image; all non-product elements must be generated from script context.",
        "- Do not copy background, camera angle, scene layout, logo, packaging text, watermark, or unrelated objects from the image.",
        "- Keep the presenter/character aligned with the script, but make the character secondary to the fruit in framing.",
        "- Prefer compositions where the character stands beside, behind, or slightly next to the fruit rather than blocking it.",
        "- The presenter must remain visible in every shot; never generate a shot without the character present.",
        "- The fruit must remain the clearest object in the scene; the character supports the narration and never replaces the fruit as the subject.",
        "- Follow script progression shot-by-shot; avoid turning the video into a static slideshow of the reference image.",
        "- Never replace the scripted story with pure product closeups only, but also never drift into orchard/farm scenes without the hero fruit on screen.",
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
    "- The hero fruit must stay clearly visible in every scene and should be the main subject of the shot.",
    "- Character presence is secondary: the presenter should stand beside the fruit, not dominate the frame.",
    "- Avoid switching to unrelated fruit baskets, orchard rows, or generic farm scenery if the uploaded image already defines the product.",
    "- PHYSICAL STATE LOCK (critical): maintain the exact same physical preparation state of the fruit across ALL frames — if the fruit appears whole, it must stay whole in every subsequent frame; if it appears cut or halved, it must stay cut or halved. NEVER switch between whole and cut/halved states mid-video. This applies to every shot, every angle, and every close-up.",
    "- Do NOT show the same fruit simultaneously in two different states (e.g., one whole and one halved) unless the script explicitly requires it as a deliberate comparison shot.",
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

  const selectedSceneLocation =
    typeof otherDetails?.sceneLocation === "string" ? otherDetails.sceneLocation.trim() : "";
  const locationLockHints = buildLocationLockHints(selectedSceneLocation);

  // Add background fruit consistency hints for farm and shop scenes
  const backgroundFruitConsistencyHints: string[] = [];
  const isFarmLocation =
    selectedSceneLocation.toLowerCase().includes("nông trại") ||
    selectedSceneLocation.toLowerCase().includes("nong trai") ||
    selectedSceneLocation.toLowerCase().includes("farm");

  const isShopLocation =
    selectedSceneLocation.toLowerCase().includes("cửa hàng") ||
    selectedSceneLocation.toLowerCase().includes("cua hang") ||
    selectedSceneLocation.toLowerCase().includes("shop") ||
    selectedSceneLocation.toLowerCase().includes("quầy");

  if (isFarmLocation && mainProductTopic) {
    backgroundFruitConsistencyHints.push(
      "CRITICAL - Background fruit consistency (must follow for farm scenes):",
      `- Main hero fruit: ${mainProductTopic}.`,
      `- If orchard/farm background is shown, ALL visible fruits in trees, baskets, or rows must be ${mainProductTopic} ONLY.`,
      `- Do NOT mix different fruit types (e.g., banana with apple, strawberry with orange) in the same background frame.`,
      `- Example: If hero is mango, the farm background orchard trees must ONLY show mangos hanging/growing, never apple trees or other fruits.`,
      `- Color consistency: Keep the background ${mainProductTopic} the same color tone and ripeness level as the hero product.`,
      `- If showing harvest baskets or harvest scenes, they must contain ONLY ${mainProductTopic}, not a mixed fruit medley.`,
      `- Avoid generic 'fruit farm' visuals with random assorted fruits; commit to single-fruit orchard aesthetic for ${mainProductTopic}.`,
      `- This creates visual harmony and prevents the background from looking fake or cluttered with mismatched produce.`
    );
  }

  if (isShopLocation && mainProductTopic) {
    backgroundFruitConsistencyHints.push(
      "CRITICAL - Background fruit consistency (must follow for fruit shop scenes):",
      `- Main hero fruit: ${mainProductTopic}.`,
      `- Shop display counter/shelves must PRIMARILY showcase ${mainProductTopic}, not a random mix of fruits.`,
      `- Background fruits in shop displays should be SAME TYPE as hero fruit (${mainProductTopic} only), not assorted fruits.`,
      `- Example: If hero is strawberry, shop counter displays strawberries prominently, not strawberries mixed with mangoes, apples, and bananas.`,
      `- Color consistency: Keep visible ${mainProductTopic} in background the same color tone and ripeness level as the hero product.`,
      `- Shop aesthetic: Clean, organized, with hero fruit as the clear focal point. Avoid cluttered multi-fruit chaos.`,
      `- If other fruits must appear (inevitable in real shop), keep them SIGNIFICANTLY OUT OF FOCUS or in the far background.`,
      `- If a brand storefront image is provided, preserve the brand facade, signboard, and counter layout; do not convert it into a generic produce market.`,
      `- This creates a cohesive, professional look and makes the video feel authentic to a specialty fruit shop, not a generic produce market.`
    );
  }

  // Keep style directives first so they survive provider-side prompt trimming.
  const presenterLockHints = otherDetails?.hasReferenceImage
    ? [
        "Character lock (critical, must follow):",
        "- A Vietnamese presenter must be visible from the first frame to the final frame.",
        "- Do not generate fruit-only shots without the presenter.",
        "- In every scene, show presenter + hero fruit together at least once.",
      ]
    : [];

  const directionBlock = [
    "Create a professional fruit product video.",
    "Fruit visual realism (critical, must follow):",
    "- Render all fruit with macro-photography accuracy: authentic skin texture, natural color gradients, realistic surface imperfections — NO plastic sheen or CGI smoothing.",
    "- Strawberry: achenes (seeds) are small RAISED flat golden or whitish bumps embedded ON the skin surface, NEVER holes, pores, or indentations. Skin between achenes is smooth red flesh.",
    "- All fruit skin must show natural botanical detail: subtle pores, realistic ripeness gradient from stem to tip, natural blemishes where appropriate.",
    "- Fruit flesh cross-sections (if shown) must have accurate internal structure: correct seed placement, realistic moisture/juice sheen, proper cell texture.",
    "- Watermelon: deep red/pink flesh with distinct dark seeds or seedless translucent pockets; rind transition from white to green is gradual, not abrupt.",
    "- Use natural depth of field for fruit close-ups to emphasize authentic texture details.",
    "Cultural direction (must follow):",
    "- Prioritize Vietnamese context, lifestyle, and consumer taste.",
    "- Visual cues should feel local to Vietnam and strictly align with the selected scene location.",
    "- Keep wardrobe, gestures, and pacing natural for Vietnamese audience; avoid overly Western styling.",
    "- Skin tones, lighting, props, and food presentation should feel authentic to Vietnam.",
    "- Presenter/character must have Vietnamese or East Asian appearance (face, skin tone, hair). Do NOT generate characters with Western European, Middle Eastern, or South Asian appearance.",
    ...presenterLockHints,
    ...locationLockHints,
    ...backgroundFruitConsistencyHints,
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
    presenterFruitSequenceGuidance,
    singleShotLockGuidance,
  ]
    .filter(Boolean)
    .join("\n");

  // Narrative constraints are explicit so script/character choices are not ignored.
  const narrativeBlock = [
    "Narrative requirements (must follow):",
    "- Target audience: Vietnamese viewers.",
    "- Keep character behavior and body language culturally natural in Vietnam.",
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
    otherDetails?.hasReferenceImage
      ? "- The presenter/character must remain visible in every shot and never disappear from the frame."
      : "",
    otherDetails?.hasReferenceImage
      ? "- Main character is the narrative lead for the message, but the fruit remains the visual hero in the frame."
      : "",
    otherDetails?.hasReferenceImage
      ? "- Fruit visuals support the story: use product beauty shots selectively and avoid long fruit-only montage or scenery-only shots."
      : "",
    otherDetails?.hasReferenceImage
      ? "- In each scene, show both the character and anchored fruit together at least once to preserve script intent and product clarity."
      : "",
    otherDetails?.hasReferenceImage && !otherDetails?.transitionEnabled
      ? "- Do not let reference image composition override scripted character blocking, gestures, and scene progression."
      : "",
    otherDetails?.hasReferenceImage
      ? "- Since transitions are disabled, keep one static setup with subtle camera motion only, then end with a zoom-in on the same anchored fruit while the presenter stays visible."
      : "",
    otherDetails?.hasReferenceImage
      ? "- Avoid cutting away to a wide orchard/farm establishing shot unless the uploaded image itself is clearly a farm scene; prefer simple product-table, shop, or presenter-side compositions."
      : "",
    "- If there is a conflict, prioritize script narrative for scene composition and action, while preserving product look similarity from reference image only.",
    narrationGuide ? "- Keep character mouth movement synchronized with the exact spoken narration lines below." : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Reserve room for style controls by capping script payload before outer truncation.
  const normalizedScript = script.replace(/\s+/g, " ").trim();
  const maxScriptChars = 760;
  const scriptExcerpt =
    normalizedScript.length > maxScriptChars
      ? `${normalizedScript.slice(0, 430)} ... ${normalizedScript.slice(-290)}`
      : normalizedScript;

  const spokenLinesBlock = narrationGuide
    ? `Spoken narration lines (exact words to align lip movement):\n${narrationGuide}`
    : "";

  return `${directionBlock}\n\n${narrativeBlock}\n\nScript context:\n${scriptExcerpt}${spokenLinesBlock ? `\n\n${spokenLinesBlock}` : ""}`.trim();
}
