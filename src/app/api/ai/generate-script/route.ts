import { promises as fs } from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, createPartFromBase64, createPartFromText } from "@google/genai";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { resolvePublicPathFromRequestPath } from "@/lib/runtime-path";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type ImageAngle = "eye_level" | "diagonal" | "close_up" | "top_down";

interface GenerateScriptRequest {
  topic: string;
  characterDescription?: string;
  characterType?: string;
  sceneLocation?: string;
  voiceType?: "Nam" | "Nữ";
  videoGenre?: string;
  contentTone?: string;
  numberOfScenes?: number;
  aiModel?: string;
  referenceImageUrl?: string;
  referenceImageName?: string;
  referenceImageSource?: "upload" | "url";
  brandBackgroundImageUrl?: string;
  brandBackgroundImageName?: string;
  brandBackgroundImageSource?: "upload" | "url";
  imageAngle?: ImageAngle;
}

const CHARS_PER_SCENE = 400;
const MIN_CHARS_PER_SCENE = 300;
const MAX_CHARS_PER_SCENE = 500;
const GEMINI_MAX_RETRIES = 3;

// Vietnamese TTS (FPT) reads ~17 chars/sec at medium speed.
// Target range for dialogue per 10s clip: 160-200 chars (= ~9-12s audio, fits 10s video).
const DIALOGUE_CHARS_PER_10S_MIN = 160;
const DIALOGUE_CHARS_PER_10S_MAX = 200;

// Per-scene clip is 10s; target slightly less so TTS fits without heavy trim.
function getTargetDurationSeconds(sceneCount: number): { min: number; max: number } {
  const perSceneMin = 8;
  const perSceneMax = 10;
  return { min: sceneCount * perSceneMin, max: sceneCount * perSceneMax };
}

function getScriptCharLimits(sceneCount: number) {
  const n = Math.max(1, sceneCount);
  return {
    target: n * CHARS_PER_SCENE,
    min: n * MIN_CHARS_PER_SCENE,
    max: n * MAX_CHARS_PER_SCENE,
    maxOutputTokens: Math.min(8192, Math.max(4096, n * 1500)),
  };
}

type FruitProfile = {
  label: string;
  sensory: string;
  usage: string;
  visualCue: string;
};

function buildFruitProfile(topic: string): FruitProfile {
  const normalized = topic.toLowerCase();

  if (normalized.includes("măng cụt") || normalized.includes("mang cut")) {
    return {
      label: "măng cụt",
      sensory: "vỏ tím đẹp, múi trắng ngà, vị chua ngọt dịu và thơm nhẹ",
      usage: "ăn trực tiếp, đãi khách, làm món tráng miệng hoặc mix khay trái cây",
      visualCue: "lớp vỏ tím sẫm bóng nhẹ và múi trắng sạch sẽ khi bổ ra",
    };
  }

  if (normalized.includes("sầu riêng") || normalized.includes("sau rieng")) {
    return {
      label: "sầu riêng",
      sensory: "múi vàng béo, mùi thơm đặc trưng và độ dẻo mịn hấp dẫn",
      usage: "ăn chín, làm kem, bánh, sinh tố hoặc món tráng miệng",
      visualCue: "cơm sầu riêng vàng ươm, bóng mịn và dày múi",
    };
  }

  if (normalized.includes("xoài") || normalized.includes("xoai")) {
    return {
      label: "xoài",
      sensory: "vị ngọt thơm, thịt chắc mọng, vàng tươi bắt mắt",
      usage: "ăn trực tiếp, ép nước, làm sinh tố, salad hoặc chấm muối",
      visualCue: "da xoài vàng óng hoặc xanh vàng đều màu, cắt ra có thịt vàng tươi",
    };
  }

  if (normalized.includes("bơ")) {
    return {
      label: "bơ",
      sensory: "thịt bơ béo mịn, mềm dẻo và dễ ăn",
      usage: "ăn với sữa, xay sinh tố, làm món healthy hoặc bữa phụ",
      visualCue: "ruột bơ xanh vàng mướt và bề mặt cắt mịn, đều",
    };
  }

  if (normalized.includes("thanh long") || normalized.includes("dragon fruit")) {
    return {
      label: "thanh long",
      sensory: "ruột mọng nước, vị thanh mát, dễ ăn và tươi sáng trên hình",
      usage: "ăn trực tiếp, ép nước, mix salad hoặc làm món mát lạnh",
      visualCue: "vỏ thanh long nổi bật và ruột hồng/trắng nhiều hạt nhỏ đẹp mắt",
    };
  }

  if (normalized.includes("chôm chôm") || normalized.includes("chom chom")) {
    return {
      label: "chôm chôm",
      sensory: "vị ngọt giòn, mọng nước, ăn vui miệng",
      usage: "ăn vặt, tráng miệng, đãi khách hoặc mix khay trái cây",
      visualCue: "vỏ đỏ gai mềm bắt mắt và ruột trắng trong căng mọng",
    };
  }

  if (normalized.includes("ổi") || normalized.includes("oi")) {
    return {
      label: "ổi",
      sensory: "thơm nhẹ, giòn mát, vị thanh dễ ăn",
      usage: "ăn trực tiếp, chấm muối ớt, làm gỏi hoặc ép nước",
      visualCue: "mặt cắt giòn, ruột sáng màu và hạt rõ",
    };
  }

  if (normalized.includes("nhãn") || normalized.includes("nhan")) {
    return {
      label: "nhãn",
      sensory: "ngọt thơm, mọng nước và dễ ăn từng trái",
      usage: "ăn vặt, làm chè, tráng miệng hoặc biếu tặng",
      visualCue: "vỏ nâu sáng, cùi trong và hạt đen nhỏ nổi bật",
    };
  }

  return {
    label: topic,
    sensory: "tươi ngon, nổi bật trên hình và dễ tạo cảm giác đáng mua",
    usage: "ăn trực tiếp, làm sinh tố, tráng miệng hoặc dùng cho gia đình",
    visualCue: "màu sắc tươi sáng và bề mặt trái đẹp mắt",
  };
}

type GeminiGenerateContentArgs = {
  model: string;
  contents: Array<{ role?: string; parts: unknown[] }> | string;
  config?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
};

type GeminiGenerateContentModel = {
  generateContent: (args: GeminiGenerateContentArgs) => Promise<{ text?: string }>;
};

export async function POST(request: NextRequest) {
  try {
    const runtime = await getRuntimeSettings();
    if (!runtime.googleApiKey) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_API_KEY chưa được cấu hình. Hãy mở phần Settings trong app để nhập API key Veo3/Gemini.",
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey: runtime.googleApiKey, apiVersion: "v1" });

    const body = (await request.json()) as GenerateScriptRequest;

    const {
      topic,
      characterDescription = "",
      characterType = "Nữ tư vấn viên cửa hàng trái cây",
      sceneLocation = "Cửa hàng trái cây",
      voiceType = "Nữ",
      videoGenre = "Giới thiệu trong cửa hàng",
      contentTone = "Giới thiệu",
      numberOfScenes = 3,
      aiModel,
      referenceImageUrl,
      referenceImageName,
      referenceImageSource,
      brandBackgroundImageUrl,
      brandBackgroundImageName,
      brandBackgroundImageSource,
      imageAngle = "eye_level",
    } = body;

    const resolvedCharacterDescription =
      characterDescription.trim() ||
      buildDefaultCharacterDescription(voiceType, characterType, sceneLocation);

    const productImagePart = referenceImageUrl
      ? await loadReferenceImagePart(request, referenceImageUrl)
      : undefined;

    const brandBackgroundImagePart = brandBackgroundImageUrl
      ? await loadReferenceImagePart(request, brandBackgroundImageUrl)
      : undefined;

    const requestedScenes = Math.max(1, Math.min(18, numberOfScenes));
    const charLimits = getScriptCharLimits(requestedScenes);

    const prompt = buildGeminiScriptPrompt({
      topic,
      characterDescription: resolvedCharacterDescription,
      characterType,
      sceneLocation,
      voiceType,
      videoGenre,
      contentTone,
      numberOfScenes: requestedScenes,
      aiModel,
      targetChars: charLimits.target,
      minChars: charLimits.min,
      maxChars: charLimits.max,
      referenceImageName,
      referenceImageSource,
      hasReferenceImage: Boolean(productImagePart),
      brandBackgroundImageName,
      brandBackgroundImageSource,
      hasBrandBackgroundImage: Boolean(brandBackgroundImagePart),
      imageAngle: aiModel === "gen4_turbo" ? imageAngle : undefined,
    });

    const instructionBlock = [
      "Bạn là biên kịch video bán trái cây.",
      "Luôn trả lời bằng tiếng Việt.",
      "Không được viết ngắn cụt.",
      "Phải tạo kịch bản đủ dài, có cấu trúc rõ ràng theo từng cảnh.",
      "Mỗi cảnh cần có mô tả hình ảnh và lời thoại đầy đủ.",
      "Chuyển chủ đề/nội dung đầu vào thành kịch bản video ngắn dễ quay.",
      "Hook trong 3 giây đầu phải gây tò mò.",
      "Nội dung chính mạch lạc, chia thành các đoạn ngắn dễ đọc.",
      "Cảnh cuối phải có CTA rõ ràng.",
      `Thời lượng lời thoại tổng phải nằm trong ${getTargetDurationSeconds(requestedScenes).min}-${getTargetDurationSeconds(requestedScenes).max} giây, phù hợp TikTok/Reels/Shorts.`,
      `Giới hạn thoại: mỗi cảnh lời thoại PHẢI ĐẠT ${DIALOGUE_CHARS_PER_10S_MIN}-${DIALOGUE_CHARS_PER_10S_MAX} ký tự (4-5 câu ngắn, ~180 ký tự) để khớp đúng 10 giây TTS — KHÔNG được viết 1 câu ngắn cụt dưới 100 ký tự.`,
      "Chỉ trả về kịch bản, không giải thích.",
    ].join(" ");

    const model = genAI.models as unknown as GeminiGenerateContentModel;

    const contents = productImagePart || brandBackgroundImagePart
      ? [{
          role: "user",
          parts: [
            createPartFromText(`${instructionBlock}\n\n${prompt}`),
            ...(productImagePart
              ? [
                  createPartFromText(
                    "Ảnh sản phẩm chính: hãy giữ đúng loại trái cây, màu sắc và độ tươi trong ảnh này."
                  ),
                  productImagePart,
                ]
              : []),
            ...(brandBackgroundImagePart
              ? [
                  createPartFromText(
                    "Ảnh brand/background: hãy giữ đúng mặt tiền, bảng hiệu, quầy và nhận diện cửa hàng trong ảnh này."
                  ),
                  brandBackgroundImagePart,
                ]
              : []),
          ],
        }]
      : `${instructionBlock}\n\n${prompt}`;

    let script = "";
    let warningMessage: string | undefined;
    let scriptSource: "gemini" | "fallback" = "gemini";

    try {
      const result = await generateContentWithRetry(model, {
        model: "gemini-2.5-flash",
        contents,
        config: {
          temperature: 0.55,
          topP: 0.95,
          maxOutputTokens: charLimits.maxOutputTokens,
        },
      });

      script = result.text?.trim() || "";
      if (!script) {
        throw new Error("Gemini returned an empty script response");
      }
    } catch (error) {
      console.error("[generate-script] Initial Gemini error:", {
        message: (error as Error)?.message,
        status: extractGeminiStatusCode(error),
      });

      if (!isTransientGeminiError(error)) {
        throw error;
      }

      warningMessage =
        "Gemini đang quá tải tạm thời, hệ thống đã dùng kịch bản dự phòng để bạn vẫn có thể tiếp tục tạo video.";

      script = buildDeterministicSceneFallback({
        topic,
        sceneLocation,
        characterType,
        numberOfScenes: requestedScenes,
      });
      scriptSource = "fallback";
    }

    script = normalizeSceneHeadings(script);

    const initialSceneCount = countScenes(script);
    const hasShortVoice = hasShortDialogue(script, requestedScenes);
    console.warn(`[generate-script] initial scene count: ${initialSceneCount} / ${requestedScenes}, shortDialogue: ${hasShortVoice}`);

    if (initialSceneCount < requestedScenes || hasLikelyTruncatedEnding(script) || hasShortVoice) {
      const hasSingleScene = initialSceneCount <= 1;
      const strictPrompt = [
        `${instructionBlock}`,
        "",
        `${prompt}`,
        "",
        "YÊU CẦU BẮT BUỘC (KHÔNG ĐƯỢC SAI):",
        `- Viết đúng ${requestedScenes} cảnh, đánh số chính xác từ SCENE 1 đến SCENE ${requestedScenes}.`,
        "- Mỗi cảnh đều phải có đủ 2 mục: Cảnh quay và Lời thoại.",
        "- Không được dừng giữa câu, không được trả về bản nháp ngắn.",
        "- Cảnh đầu bắt buộc là hook 3 giây gây tò mò.",
        "- Cảnh cuối bắt buộc có CTA rõ ràng.",
        `- Tổng thời lượng lời thoại phải nằm trong ${getTargetDurationSeconds(requestedScenes).min}-${getTargetDurationSeconds(requestedScenes).max} giây (TikTok/Reels/Shorts).`,
        `- Tổng độ dài toàn kịch bản khoảng ${charLimits.target} ký tự (dao động ${charLimits.min}-${charLimits.max} ký tự).`,
        "- Chỉ trả về kịch bản hoàn chỉnh.",
        ...(hasShortVoice ? [
          `- ⚠️ Lời thoại MỖI CẢNH trong bản nháp trên quá ngắn (dưới ${DIALOGUE_CHARS_PER_10S_MIN} ký tự). PHẢI viết lại lời thoại đủ 4-5 câu liền mạch, tổng ${DIALOGUE_CHARS_PER_10S_MIN}-${DIALOGUE_CHARS_PER_10S_MAX} ký tự mỗi cảnh. Ví dụ lời thoại đúng độ dài: "Bạn đã bao giờ thử măng cụt Bình Dương chưa? Loại trái cây được mệnh danh là Nữ hoàng nhiệt đới này có vỏ tím sẫm căng bóng, bên trong là múi trắng ngà mọng nước, vị chua ngọt hài hòa khó quên. Gia đình tôi ăn mỗi tuần mà không bao giờ chán! Ghé ngay để chọn phần tươi ngon nhất cho nhà bạn."`,
        ] : []),
        ...(hasSingleScene ? [] : ["", "Bản nháp chưa đạt (hãy viết lại đầy đủ):", script]),
      ].join("\n");

      try {
        const retryResult = await generateContentWithRetry(model, {
          model: "gemini-2.5-flash",
          contents: strictPrompt,
          config: {
            temperature: 0.45,
            topP: 0.9,
            maxOutputTokens: charLimits.maxOutputTokens,
          },
        });

        const retriedScript = retryResult.text?.trim();
        if (retriedScript) {
          script = normalizeSceneHeadings(retriedScript);
          scriptSource = "gemini";
          console.warn(`[generate-script] retry-1 scene count: ${countScenes(script)} / ${requestedScenes}`);
        }
      } catch (retryError) {
        console.error("[generate-script] Retry-1 Gemini error:", {
          message: (retryError as Error)?.message,
          status: extractGeminiStatusCode(retryError),
        });

        if (!isTransientGeminiError(retryError)) {
          throw retryError;
        }

        if (!warningMessage) {
          warningMessage =
            "Gemini đang quá tải tạm thời, hệ thống giữ bản kịch bản hiện tại để tránh gián đoạn.";
        }
      }

      const retry1ShortVoice = hasShortDialogue(script, requestedScenes);
      if (countScenes(script) < requestedScenes || retry1ShortVoice) {
        console.warn(`[generate-script] retry-2 triggered, scene count: ${countScenes(script)} / ${requestedScenes}, shortDialogue: ${retry1ShortVoice}`);
        const forcedPrompt = [
          `${instructionBlock}`,
          "",
          `Hãy viết kịch bản video bán trái cây cho chủ đề: ${topic}.`,
          `Bắt buộc viết đúng ${requestedScenes} cảnh, đánh số SCENE 1 đến SCENE ${requestedScenes}.`,
          "Mỗi cảnh có: Cảnh quay + Lời thoại.",
          "Không viết ít hơn số cảnh yêu cầu, không cắt dở câu, không giải thích.",
          `Lời thoại mỗi cảnh PHẢI dài ${DIALOGUE_CHARS_PER_10S_MIN}-${DIALOGUE_CHARS_PER_10S_MAX} ký tự (4-5 câu liền mạch). Tuyệt đối không được viết lời thoại ngắn dưới ${DIALOGUE_CHARS_PER_10S_MIN} ký tự.`,
          "Chỉ trả về kịch bản hoàn chỉnh.",
        ].join("\n");

        try {
          const retry2Result = await generateContentWithRetry(model, {
            model: "gemini-2.5-flash",
            contents: forcedPrompt,
            config: {
              temperature: 0.3,
              topP: 0.85,
              maxOutputTokens: 8192,
            },
          });

          const retry2Script = retry2Result.text?.trim();
          if (retry2Script) {
            script = normalizeSceneHeadings(retry2Script);
            scriptSource = "gemini";
            console.warn(`[generate-script] retry-2 scene count: ${countScenes(script)} / ${requestedScenes}`);
          }
        } catch (retry2Error) {
          if (!isTransientGeminiError(retry2Error)) {
            throw retry2Error;
          }
        }
      }
    }

    if (countScenes(script) < requestedScenes) {
      const actualScenes = countScenes(script);
      if (!warningMessage) {
        warningMessage =
          `Gemini tạo ${actualScenes} cảnh thay vì ${requestedScenes} cảnh yêu cầu. Kịch bản AI vẫn được sử dụng — bạn có thể chỉnh sửa thêm nếu cần.`;
      }
    }

    script = ensureCompleteEnding(script);
    script = fitScriptLength(script, charLimits.target, charLimits.min, charLimits.max);

    return NextResponse.json({
      data: {
        script,
        estimatedDuration: `${getTargetDurationSeconds(requestedScenes).min}-${getTargetDurationSeconds(requestedScenes).max} seconds`,
        sceneCount: numberOfScenes,
        warning: warningMessage,
        source: scriptSource,
      },
    });
  } catch (error) {
    console.error("POST /api/ai/generate-script error:", error);

    if (isTransientGeminiError(error)) {
      return NextResponse.json(
        {
          error:
            "Gemini đang quá tải tạm thời (503). Vui lòng thử lại sau 15-60 giây hoặc bấm Random để dùng kịch bản dự phòng.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}

function extractGeminiStatusCode(error: unknown): number | undefined {
  const directStatus = (error as { status?: unknown })?.status;
  if (typeof directStatus === "number") {
    return directStatus;
  }

  const message = (error as Error)?.message || "";
  const matched = message.match(/"status"\s*:\s*(\d{3})/);
  if (!matched) {
    return undefined;
  }

  const parsed = Number(matched[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isTransientGeminiError(error: unknown): boolean {
  const status = extractGeminiStatusCode(error);
  if (status === 429 || status === 503) {
    return true;
  }

  const message = ((error as Error)?.message || "").toLowerCase();
  return (
    message.includes("high demand") ||
    message.includes("unavailable") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted")
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateContentWithRetry(
  model: GeminiGenerateContentModel,
  args: GeminiGenerateContentArgs
): Promise<{ text?: string }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    try {
      return await model.generateContent(args);
    } catch (error) {
      lastError = error;
      const status = extractGeminiStatusCode(error);
      console.warn(`[generateContentWithRetry] Attempt ${attempt}/${GEMINI_MAX_RETRIES} failed:`, {
        message: (error as Error)?.message,
        status,
      });

      if (!isTransientGeminiError(error) || attempt >= GEMINI_MAX_RETRIES) {
        throw error;
      }

      const delayMs = 900 * 2 ** (attempt - 1);
      console.log(`[generateContentWithRetry] Retrying after ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

async function loadReferenceImagePart(request: NextRequest, referenceImageUrl: string) {
  const normalizedUrl = referenceImageUrl.trim();
  const parsed = new URL(normalizedUrl, request.url);

  if (
    parsed.origin === new URL(request.url).origin ||
    parsed.pathname.startsWith("/uploads/") ||
    parsed.pathname.startsWith("/api/files/")
  ) {
    const filePath = resolvePublicPathFromRequestPath(parsed.pathname);
    if (!filePath) {
      throw new Error("Invalid local reference image path");
    }
    const fileBuffer = await fs.readFile(filePath);
    return createPartFromBase64(fileBuffer.toString("base64"), detectMimeType(filePath));
  }

  const response = await fetch(parsed.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.status}`);
  }

  const mimeType = normalizeMimeType(response.headers.get("content-type")) || detectMimeType(parsed.pathname);
  const buffer = Buffer.from(await response.arrayBuffer());
  return createPartFromBase64(buffer.toString("base64"), mimeType);
}

function normalizeMimeType(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.split(";")[0]?.trim();
  return normalized || undefined;
}

function detectMimeType(filePathOrName: string): string {
  const lower = filePathOrName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

type GenreGuidance = { structure: string; cameraHint: string };

function buildGenreGuidance(videoGenre: string): GenreGuidance {
  const g = videoGenre.toLowerCase();

  if (g.includes("livestream"))
    return {
      structure: "Chào khán giả trực tiếp → Demo sản phẩm ngay tại tay → Ưu đãi hôm nay → Kêu gọi chốt đơn ngay.",
      cameraHint: "Góc quay tự nhiên như livestream thật, nhân vật cầm sản phẩm demo trực tiếp cho camera.",
    };

  if (g.includes("hướng dẫn") || g.includes("bí quyết") || g.includes("bảo quản") || g.includes("mẹo lựa"))
    return {
      structure: "Hook đặt vấn đề/câu hỏi thực tế → Hướng dẫn bước 1 → Bước 2 → Bước 3 (nếu có) → Kết quả thực tế → CTA.",
      cameraHint: "Góc cận tay thao tác rõ từng bước, nhìn từ trên xuống, ánh sáng đủ để thấy chi tiết.",
    };

  if (g.includes("nấu ăn") || g.includes("công thức"))
    return {
      structure: "Giới thiệu món ăn và trái cây chính → Nguyên liệu cần chuẩn bị → Các bước chế biến → Thành phẩm hoàn chỉnh → CTA.",
      cameraHint: "Cận nguyên liệu tươi, góc top-down khi thực hiện, toàn cảnh thành phẩm hấp dẫn.",
    };

  if (g.includes("kể chuyện") || g.includes("thương hiệu"))
    return {
      structure: "Mở đầu bằng tình huống/vấn đề cụ thể → Hành trình/câu chuyện gắn với sản phẩm → Sản phẩm là giải pháp → Kết thúc ý nghĩa + CTA.",
      cameraHint: "Cảnh rộng kể chuyện, cận cảm xúc nhân vật, cảnh hậu trường tự nhiên chân thật.",
    };

  if (g.includes("review") || g.includes("đánh giá") || g.includes("trải nghiệm cá nhân"))
    return {
      structure: "Giới thiệu sản phẩm đang review → Nhận xét thực tế từng tiêu chí (ngoại hình, mùi, vị...) → Ưu điểm nổi bật → Kết luận thật + CTA.",
      cameraHint: "Cận tay cầm sản phẩm, nhìn thẳng camera, cảnh cắn/thử sản phẩm thực tế.",
    };

  if (g.includes("so sánh") || g.includes("tư vấn chọn"))
    return {
      structure: "Đặt vấn đề lựa chọn → So sánh tiêu chí từng loại cụ thể → Kết luận rõ ràng nên chọn gì vì sao → CTA.",
      cameraHint: "Đặt các sản phẩm cạnh nhau, cận từng loại để thấy sự khác biệt rõ ràng.",
    };

  if (g.includes("talkshow"))
    return {
      structure: "Câu hỏi mở đầu gây tò mò → Nhân vật tư vấn/chia sẻ trực tiếp → Hỏi đáp tự nhiên → CTA.",
      cameraHint: "Góc phỏng vấn, nhìn thẳng camera, cử chỉ tay tự nhiên, không staged.",
    };

  if (g.includes("minigame") || g.includes("tương tác"))
    return {
      structure: "Hook câu đố/thử thách liên quan trái cây → Gợi ý manh mối → Reveal sản phẩm → Kêu gọi bình luận/đoán/chia sẻ + CTA.",
      cameraHint: "Cắt cảnh nhanh, text overlay câu hỏi, cận sản phẩm khi reveal.",
    };

  if (g.includes("mùa") || g.includes("khuyến mãi") || g.includes("ưu đãi"))
    return {
      structure: "Hook thời điểm đặc biệt/ưu đãi có hạn → Lý do mua ngay → Chi tiết ưu đãi/mùa vụ → CTA khẩn cấp.",
      cameraHint: "Cảnh tươi sáng phong phú, nhấn mạnh tính thời điểm và sự phong phú của sản phẩm.",
    };

  if (g.includes("vlog"))
    return {
      structure: "Giới thiệu hành trình/ngày hôm nay → Khám phá và trải nghiệm tự nhiên → Cảm nhận thật → CTA.",
      cameraHint: "Tay cầm camera, cảnh đời thường không dàn dựng, góc selfie tự nhiên.",
    };

  // Default: giới thiệu sản phẩm
  return {
    structure: "Hook 3 giây gây tò mò → Giới thiệu sản phẩm và điểm nổi bật → Lợi ích/cảm giác mua hàng → CTA mua ngay.",
    cameraHint: "Cận sản phẩm, toàn cảnh quầy, nhân vật cầm sản phẩm giới thiệu.",
  };
}

function buildToneGuidance(contentTone: string): string {
  const t = contentTone.toLowerCase();

  if (t.includes("viral")) return "Hook gây sốc hoặc tò mò mạnh, ngôn ngữ bắt trend, câu chữ ngắn dễ share và gây phản ứng. Tuyệt đối tránh ngôn ngữ quảng cáo cứng nhắc.";
  if (t.includes("hài hước")) return "Lồng ghép tình huống dí dỏm, dùng ẩn dụ vui, câu chữ hóm hỉnh nhẹ nhàng. Tránh nghiêm túc quá mức, nhưng vẫn làm nổi bật sản phẩm.";
  if (t.includes("giáo dục")) return "Dùng số liệu hoặc sự kiện cụ thể, giải thích nguyên nhân/cơ chế. Tone chuyên gia nhưng gần gũi, tránh biệt ngữ khó hiểu.";
  if (t.includes("lợi ích sức khỏe")) return "Nhấn vitamin, khoáng chất, tác dụng sức khỏe cụ thể. Tone đáng tin cậy, không quá khô khan, vẫn hấp dẫn để xem.";
  if (t.includes("kể chuyện")) return "Xây dựng tình huống/nhân vật cụ thể, cảm xúc chân thật, có cao trào nhỏ và kết thúc ý nghĩa. Tránh liệt kê thuần túy.";
  if (t.includes("bán hàng nhẹ nhàng")) return "Không ép buộc, gợi ý tự nhiên như bạn bè chia sẻ. CTA mềm mại ('ghé thử xem', 'có thể thích lắm đó'). Tránh urgency giả tạo.";
  if (t.includes("livestream")) return "Gọi người xem trực tiếp ('mọi người ơi', 'các bạn ơi'), tạo urgency tự nhiên, khuyến khích comment/đặt hàng ngay.";
  if (t.includes("khuyến mãi")) return "Nhấn giá ưu đãi, số lượng/thời gian có hạn. Tạo urgency rõ ràng nhưng không cường điệu, vẫn đáng tin cậy.";
  if (t.includes("hướng dẫn")) return "Dùng động từ hành động rõ (chọn, nhìn, kiểm tra, nhấn nhẹ...), từng bước rõ ràng dễ làm theo ngay.";
  if (t.includes("so sánh")) return "Khách quan, dùng từ so sánh trực tiếp, đưa tiêu chí cụ thể, không thiên vị. Giúp người xem tự quyết định.";
  if (t.includes("mẹo") || t.includes("chia sẻ")) return "Tone bạn bè mách nước thật tình, dùng 'bí quyết là...', 'ít ai biết rằng...'. Thực tế áp dụng được ngay.";
  if (t.includes("phong cách đời thường")) return "Tự nhiên như trò chuyện thật, không dùng từ hoa mỹ hay quảng cáo, ngôn ngữ hàng ngày giản dị.";
  if (t.includes("cảm hứng tích cực")) return "Dùng từ truyền năng lượng và cảm xúc tích cực cao, kết thúc ấm áp và truyền cảm hứng cho người xem.";
  if (t.includes("review")) return "Tự nhiên, thật, không quá bán hàng. Có ý kiến cá nhân rõ ràng, nhận xét thẳng thắn. Người xem cảm giác được nghe bạn bè review.";
  if (t.includes("giới thiệu")) return "Chuyên nghiệp, rõ ràng, cân bằng giữa thông tin sản phẩm và cảm xúc. Trực tiếp vào điểm nổi bật.";

  return "Chuyên nghiệp, thân thiện, ngôn ngữ tự nhiên, cân bằng giữa thông tin và cảm xúc.";
}

function buildGen4TurboAngleGuidance(imageAngle: ImageAngle): string {
  switch (imageAngle) {
    case "diagonal":
      return [
        "- Góc ảnh: Chéo nhẹ từ xa. Mô tả Cảnh quay: 'Camera zoom out nhẹ theo góc chéo, lộ dần nhân vật đứng bên cạnh quầy trái cây. Cô mỉm cười, chỉ tay vào trái cây và nói chuyện với camera.'",
        "- Nhân vật đứng SẴN ở góc cạnh — camera di chuyển để lộ ra, KHÔNG phải nhân vật bước vào hay xuất hiện đột ngột.",
      ].join("\n");
    case "close_up":
      return [
        "- Góc ảnh: Cận cảnh (close-up). Mô tả Cảnh quay: 'Camera từ từ kéo ra từ cận cảnh trái cây, lộ dần nhân vật đứng bên cạnh. Cô mỉm cười, chỉ tay vào trái cây và nói chuyện với camera.'",
        "- Nhân vật đứng SẴN bên cạnh trái cây ngay từ đầu — chỉ bị crop ngoài frame, camera zoom out để lộ ra.",
      ].join("\n");
    case "top_down":
      return [
        "- Góc ảnh: Từ trên xuống (top-down). Mô tả Cảnh quay: 'Camera tilt lên từ từ từ góc trên xuống, lộ dần nhân vật đứng phía sau sản phẩm. Cô mỉm cười, chỉ tay vào trái cây và nói chuyện với camera.'",
        "- Nhân vật đứng SẴN phía sau — camera đổi góc để lộ ra, KHÔNG phải nhân vật bỗng xuất hiện.",
      ].join("\n");
    case "eye_level":
    default:
      return [
        "- Góc ảnh: Trực diện ngang tầm mắt. Mô tả Cảnh quay: 'Camera từ từ kéo lùi ra, lộ ra nhân vật đứng sẵn phía sau quầy trái cây. Cô mỉm cười, chỉ tay vào những quả trái cây và nói chuyện với camera.'",
        "- Nhân vật đứng SẴN phía sau quầy — camera kéo ra để lộ, KHÔNG phải nhân vật bước vào hay xuất hiện đột ngột.",
      ].join("\n");
  }
}

function buildModelSpecificGuidance(aiModel?: string, imageAngle?: ImageAngle): string {
  if (aiModel === "gen4_turbo") {
    const angleGuidance = buildGen4TurboAngleGuidance(imageAngle ?? "eye_level");
    return [
      "",
      "⚠️ YÊU CẦU ĐẶC BIỆT – Model Gen4 Turbo (Image-to-Video):",
      "- Gen4 Turbo: video bắt đầu từ ảnh tham chiếu (chứa trái cây), camera di chuyển để lộ nhân vật đứng sẵn. KHÔNG viết kịch bản như nhân vật xuất hiện ngay từ đầu hay bước vào cảnh.",
      "- Kịch bản chỉ mô tả HÀNH ĐỘNG sau khi nhân vật được lộ ra: chỉ tay vào trái cây, nói chuyện với camera.",
      "- ⚠️ TUYỆT ĐỐI KHÔNG viết nhân vật cầm trái cây lên, bổ trái, cắt trái, hay di chuyển trái cây theo bất kỳ cách nào. Nhân vật CHỈ đứng và chỉ tay vào quả trái cây trong ảnh.",
      "- Phần Visual KHÔNG được mô tả lại những gì đã có trong ảnh tham chiếu — chỉ mô tả CHUYỂN ĐỘNG của nhân vật và camera.",
      angleGuidance,
      "- Ví dụ Visual SAI: 'Nữ tư vấn viên đứng bên quầy trái cây tươi ngon, xung quanh là những quả măng cụt...' (mô tả lại ảnh — sai).",
      `- Phần Voiceover: ${DIALOGUE_CHARS_PER_10S_MIN}-${DIALOGUE_CHARS_PER_10S_MAX} ký tự (4-5 câu, ~180 ký tự). KHÔNG viết 1 câu ngắn cụt.`,
      "- KHÔNG dùng 'chuyển cảnh', 'fade', 'cut'. Một shot liên tục duy nhất.",
    ].join("\n");
  }
  if (aiModel === "gen4.5") {
    return [
      "",
      "⚠️ YÊU CẦU ĐẶC BIỆT – Model Gen4.5 (Text-to-Video & Image-to-Video):",
      "- Gen4.5 hỗ trợ cả text-to-video và image-to-video, có thể có nhiều cảnh với chuyển cảnh.",
      "- Mỗi cảnh cần mô tả visual rõ ràng: góc máy, bố cục, chuyển động của presenter và sản phẩm.",
      "- Mỗi cảnh nên có một điểm nhấn riêng (giới thiệu, cận cảnh sản phẩm, call-to-action...).",
      "- Voiceover mỗi cảnh phải ăn khớp với thời lượng và nội dung visual của cảnh đó.",
    ].join("\n");
  }
  if (aiModel && (aiModel.startsWith("veo") || aiModel.includes("veo"))) {
    return [
      "",
      "⚠️ YÊU CẦU ĐẶC BIỆT – Model Veo3 (Text-to-Video chất lượng điện ảnh):",
      "- Veo3 render chất lượng cao, hỗ trợ video dài hơn (đến 30 giây), nhiều cảnh phong phú.",
      "- Mô tả chi tiết ánh sáng, màu sắc, texture sản phẩm — Veo3 tái hiện rất tốt các chi tiết hình ảnh.",
      "- Có thể dùng góc máy đa dạng: close-up, medium shot, wide shot theo từng cảnh.",
      "- Voiceover cần nhịp điệu tự nhiên, phù hợp phong cách điện ảnh chuyên nghiệp.",
      "- Mỗi cảnh có thể dài hơn và phức tạp hơn so với các model khác.",
    ].join("\n");
  }
  return "";
}

function buildGeminiScriptPrompt(input: {
  topic: string;
  characterDescription: string;
  characterType: string;
  sceneLocation: string;
  voiceType: "Nam" | "Nữ";
  videoGenre: string;
  contentTone: string;
  numberOfScenes: number;
  aiModel?: string;
  targetChars: number;
  minChars: number;
  maxChars: number;
  referenceImageName?: string;
  referenceImageSource?: "upload" | "url";
  hasReferenceImage: boolean;
  brandBackgroundImageName?: string;
  brandBackgroundImageSource?: "upload" | "url";
  hasBrandBackgroundImage: boolean;
  imageAngle?: ImageAngle;
}): string {
  const sourceLabel =
    input.referenceImageSource === "upload"
      ? "ảnh upload từ máy"
      : input.referenceImageSource === "url"
      ? "ảnh từ URL"
      : "ảnh tham chiếu";

  const brandSourceLabel =
    input.brandBackgroundImageSource === "upload"
      ? "ảnh brand upload từ máy"
      : input.brandBackgroundImageSource === "url"
      ? "ảnh brand từ URL"
      : "ảnh brand/background";

  const referenceBlock = input.hasReferenceImage
    ? [
        `Ảnh sản phẩm: ${sourceLabel}.`,
        input.referenceImageName ? `Tên file: ${input.referenceImageName}.` : "",
        "Hãy quan sát ảnh để nhận biết đúng loại trái cây, màu sắc, độ tươi, texture và chi tiết sản phẩm chính.",
        "Nếu ảnh có trái cây cụ thể, ưu tiên đúng loại trái cây đó trong kịch bản và không đổi sang loại khác.",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const brandReferenceBlock = input.hasBrandBackgroundImage
    ? [
        `Ảnh brand/background: ${brandSourceLabel}.`,
        input.brandBackgroundImageName ? `Tên file: ${input.brandBackgroundImageName}.` : "",
        "Hãy quan sát ảnh này để giữ đúng mặt tiền, bảng hiệu, quầy hàng, bố cục cửa hàng và nhận diện brand.",
        "Nếu ảnh brand có không gian cửa hàng cụ thể, dùng nó làm nền chính của video.",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const genreGuide = buildGenreGuidance(input.videoGenre);
  const toneGuide = buildToneGuidance(input.contentTone);

  return [
    "Bạn là biên kịch video ngắn chuyên nghiệp cho nội dung trái cây bán hàng.",
    "Mục tiêu chính là tạo kịch bản giúp người xem muốn mua, tin sản phẩm và hiểu nhanh điểm nổi bật của trái cây.",
    `Phân tích trái cây chính: ${buildFruitProfile(input.topic).label} - ${buildFruitProfile(input.topic).sensory}.`,
    `Gợi ý sử dụng: ${buildFruitProfile(input.topic).usage}.`,
    input.aiModel === "gen4_turbo"
      ? `Chi tiết hình ảnh cần nhấn: ngoại quan trái cây nguyên vẹn — màu sắc vỏ, độ căng bề mặt, độ tươi nhìn thấy được. KHÔNG bổ, cắt, hay chỉnh sửa trái cây trong video; trái cây luôn nguyên vẹn như trong ảnh tham chiếu.`
      : `Chi tiết hình ảnh cần nhấn: ${buildFruitProfile(input.topic).visualCue}.`,
    `Chủ đề: ${input.topic}.`,
    `Nhân vật: ${input.characterType}.`,
    `Mô tả nhân vật: ${input.characterDescription}.`,
    `Bối cảnh mong muốn: ${input.sceneLocation}.`,
    `Thể loại video: "${input.videoGenre}". Cấu trúc kịch bản PHẢI theo đúng: ${genreGuide.structure}`,
    `Tông nội dung: "${input.contentTone}". Phong cách ngôn ngữ và giọng điệu: ${toneGuide}`,
    `Giới tính voiceover: ${input.voiceType}.`,
    `Số cảnh: ĐÚNG ${input.numberOfScenes} cảnh, không hơn không kém.`,
    referenceBlock,
    brandReferenceBlock,
    "",
    "Yêu cầu đầu ra:",
    "- Viết bằng tiếng Việt tự nhiên, phù hợp video ngắn bán trái cây.",
    "- Biến chủ đề/nội dung đầu vào thành kịch bản video, không viết kiểu ghi chú rời rạc.",
    `- BẮT BUỘC theo đúng cấu trúc thể loại "${input.videoGenre}": ${genreGuide.structure}`,
    `- BẮT BUỘC áp dụng tông nội dung "${input.contentTone}": ${toneGuide}`,
    "- Hook trong 3 giây đầu phải phù hợp với thể loại đã chọn (hook bán hàng cho giới thiệu sản phẩm, hook câu hỏi cho hướng dẫn, hook tình huống cho kể chuyện, hook câu đố cho minigame...).",
    "- Nhấn các yếu tố phù hợp loại trái cây: độ tươi, màu sắc, độ mọng, hương vị, nguồn gốc, cảm giác đáng mua.",
    "- Tránh lặp cùng một mô tả 'tươi ngon, mọng nước, bắt mắt' cho mọi cảnh; mỗi cảnh dùng một góc cảm quan khác nhau.",
    "- Nếu ảnh tham chiếu là trái cây cụ thể, phải giữ đúng loại trái cây đó làm trung tâm nội dung.",
    "- Nếu phù hợp với thể loại, thêm gợi ý sử dụng: mua để ăn ngay, biếu tặng, làm sinh tố, làm món tráng miệng hoặc dùng cho gia đình.",
    "- Không phóng đại hoặc hứa hẹn sai sự thật; ngôn ngữ thuyết phục nhưng vẫn tự nhiên và đáng tin.",
    "- Kịch bản phải dài hơn một đoạn giới thiệu bình thường. Mỗi cảnh tối thiểu 2-3 câu thoại và 1-2 câu mô tả hình ảnh.",
    "- Mỗi cảnh phải có chi tiết khác nhau, không lặp ý giữa các cảnh.",
    `- Cảnh quay và góc máy phải phù hợp thể loại: ${genreGuide.cameraHint}`,
    `- Tổng thời lượng lời thoại mục tiêu: ${getTargetDurationSeconds(input.numberOfScenes).min}-${getTargetDurationSeconds(input.numberOfScenes).max} giây (${input.numberOfScenes} cảnh × ~10s/cảnh), phù hợp TikTok/Reels/Shorts.`,
    `- ⚠️ ĐỘ DÀI THOẠI BẮT BUỘC: Phần "Lời thoại" mỗi cảnh PHẢI CÓ ${DIALOGUE_CHARS_PER_10S_MIN}-${DIALOGUE_CHARS_PER_10S_MAX} ký tự. KHÔNG được viết 1-2 câu ngắn cụt — phải có đủ 4 câu. Ví dụ chuẩn (~200 ký tự): "Bạn biết măng cụt được gọi là nữ hoàng trái cây nhiệt đới chưa? Vỏ tím bóng, múi trắng ngà, vị ngọt thanh mát lịm. Bổ dưỡng, tốt cho cả gia đình từ trẻ đến lớn. Đặt ngay để nhận quả tươi giao tận nhà hôm nay!" KHÔNG viết ít hơn ${DIALOGUE_CHARS_PER_10S_MIN} ký tự.`,
    "- Chia nội dung thành từng đoạn ngắn; mỗi đoạn thoại 1 câu, nhịp đọc tự nhiên, dễ thu âm.",
    "- Chia rõ thành từng cảnh theo format:",
    "  SCENE 1",
    "  Cảnh quay: [mô tả cảnh quay bằng tiếng Việt, ngắn gọn, rõ hành động, góc máy, ánh sáng, bối cảnh]",
    "  Lời thoại:",
    "  [câu thoại 1 - hook gây tò mò]",
    "  [câu thoại 2 - nêu đặc điểm nổi bật]",
    "  [câu thoại 3 - lợi ích / cảm nhận]",
    "  [câu thoại 4 - CTA hoặc kết thúc]",
    "- QUAN TRỌNG: Phần Lời thoại KHÔNG được có tiền tố tên nhân vật. KHÔNG viết 'Nữ tư vấn viên: ...' hay bất kỳ dạng 'TênNhânVật: ...' nào. Chỉ viết câu thoại thuần, mỗi câu một dòng, không có prefix.",
    "- Toàn bộ đầu ra phải là tiếng Việt, bao gồm cả Cảnh quay và Lời thoại.",
    "- Mỗi cảnh nên ngắn, dễ đọc, dễ thu âm, nhịp nói tự nhiên.",
    input.hasReferenceImage && input.hasBrandBackgroundImage
      ? "- Nếu có cả ảnh sản phẩm và ảnh brand/background, phải giữ đúng trái cây theo ảnh sản phẩm và giữ đúng bối cảnh/mặt tiền theo ảnh brand; kịch bản nên mô tả chúng xuất hiện cùng nhau một cách tự nhiên."
      : "- Nếu có ảnh tham chiếu, kịch bản phải bám theo ảnh và không đi lệch quá xa nội dung ảnh.",
    "- Không viết phần giải thích, chỉ trả về kịch bản hoàn chỉnh.",
    "- Đảm bảo câu chữ phù hợp để dùng ngay cho tạo video.",
    `- Tổng độ dài toàn kịch bản khoảng ${input.targetChars} ký tự (dao động ${input.minChars}-${input.maxChars} ký tự).`,
    "- Không được cắt dở câu ở cuối; câu cuối phải hoàn chỉnh.",
    buildModelSpecificGuidance(input.aiModel, input.imageAngle),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildDefaultCharacterDescription(
  voiceType: "Nam" | "Nữ",
  characterType: string,
  sceneLocation: string
): string {
  // Handle custom character type
  if (characterType.includes("Khác") || characterType.includes("Tùy chọn")) {
    return `Nhân vật giới thiệu tại ${sceneLocation}, phong cách tự nhiên, giao tiếp mạnh mẽ, diễn đạt mạch lạc và tập trung vào thông tin hữu ích cho người mua.`;
  }

  if (characterType.includes("3D")) {
    return `Nhân vật 3D tại ${sceneLocation}, biểu cảm rõ ràng, lời dẫn ngắn gọn, nhịp nói linh hoạt và năng lượng tích cực.`;
  }

  if (characterType.includes("Đầu bếp")) {
    return `Đầu bếp tại ${sceneLocation}, phong thái chuyên nghiệp, giải thích cách chọn nguyên liệu và gợi ý món ăn thực tế.`;
  }

  if (characterType.includes("review") || characterType.includes("vlog")) {
    return `Người sáng tạo nội dung tại ${sceneLocation}, phong cách tự nhiên, nói chuyện gần gũi, nhấn mạnh trải nghiệm thực tế.`;
  }

  if (characterType.includes("Mẹ bỉm")) {
    return `Phụ huynh trẻ tại ${sceneLocation}, cách nói nhẹ nhàng, tập trung tiêu chí an toàn, dinh dưỡng và dễ áp dụng cho gia đình.`;
  }

  if (characterType.includes("Chủ shop")) {
    return `Chủ shop trái cây tại ${sceneLocation}, phong cách thân thiện, hiểu rõ nguồn hàng theo ngày, tư vấn thẳng thắn về độ chín, cách chọn và bảo quản trái phù hợp nhu cầu khách hàng.`;
  }

  if (characterType.includes("nông trại") || characterType.includes("Nông trại")) {
    return `Chủ nông trại tại ${sceneLocation}, am hiểu mùa vụ, chia sẻ chân thật quy trình chăm trái từ vườn đến tay khách, giọng nói gần gũi, tự tin và đáng tin cậy.`;
  }

  if (characterType.includes("Nhân viên siêu thị")) {
    return `Nhân viên quầy trái cây tại ${sceneLocation}, tác phong chỉn chu, hướng dẫn nhanh tiêu chí chọn trái tươi, gợi ý cách bảo quản tiện lợi sau khi mua.`;
  }

  if (characterType.includes("MC")) {
    return `MC tại ${sceneLocation}, giọng nói rõ ràng, chuyên nghiệp, truyền tải thông tin mạch lạc, dễ theo dõi và thu hút người nghe.`;
  }

  if (characterType.includes("cửa hàng") || sceneLocation.includes("cửa hàng") || sceneLocation.includes("Cửa hàng")) {
    if (characterType.includes("Nữ") || voiceType === "Nữ") {
      return `Nữ tư vấn viên cửa hàng trái cây tại ${sceneLocation}, tác phong chuyên nghiệp, giao tiếp thân thiện, am hiểu sản phẩm từng loại trái, tư vấn hợp lý về chất lượng, độ chín, giá cả và cách bảo quản.`;
    }
    return `Nam tư vấn viên cửa hàng trái cây tại ${sceneLocation}, phong thái điềm tĩnh, tư vấn rõ ràng, không khuyên nhưỡng, nhấn mạnh độ tươi, hương vị, upsize giá trị và cách bảo quản đúng cách.`;
  }

  if (characterType.includes("Nữ") || voiceType === "Nữ") {
    return `Nữ tư vấn viên tại ${sceneLocation}, tác phong chuyên nghiệp, giao tiếp thân thiện, giới thiệu điểm nổi bật của từng loại trái cây, tư vấn chân thành.`;
  }

  if (characterType.includes("Nam") || voiceType === "Nam") {
    return `Nam tư vấn viên tại ${sceneLocation}, phong thái điềm tĩnh, tư vấn rõ ràng, nhấn mạnh độ tươi, hương vị, chất lượng và cách bảo quản.`;
  }

  return `Nhân vật giới thiệu tại ${sceneLocation}, phong cách gần gũi, diễn đạt mạch lạc và tập trung vào thông tin hữu ích cho người mua.`;
}

function countScenes(script: string): number {
  return (script.match(/(^|\n)\s*(?:SCENE|CẢNH|CANH)\s+\d+/gi) || []).length;
}

function normalizeSceneHeadings(script: string): string {
  // Also strip markdown markers that Gemini sometimes adds: **SCENE 1**, ## Cảnh 2:, etc.
  return script.replace(
    /(^|\n)\s*(?:[#*_]+\s*)?(?:SCENE|CẢNH|CANH)\s*[*_]*\s*[:#\-]?\s*(\d+)\b[*_]*/gi,
    (_match, prefix: string, sceneNo: string) => `${prefix}SCENE ${sceneNo}`
  );
}

function hasShortDialogue(script: string, sceneCount: number): boolean {
  // Extract each scene's dialogue block (text after "Lời thoại:" up to next SCENE heading or end)
  const sceneBlocks = script.split(/(?:^|\n)\s*SCENE\s+\d+/i).filter(Boolean);
  let shortCount = 0;

  for (const block of sceneBlocks) {
    const match = block.match(/Lời\s+thoại\s*:\s*([\s\S]*?)(?=\n\s*(?:Cảnh\s+quay|Lời\s+thoại)\s*:|$)/i);
    if (!match) {
      shortCount++;
      continue;
    }
    const dialogue = match[1].replace(/\s+/g, " ").trim();
    if (dialogue.length < DIALOGUE_CHARS_PER_10S_MIN) {
      shortCount++;
    }
  }

  // Trigger retry if more than half the scenes have short dialogue
  return shortCount > Math.floor(sceneCount / 2);
}

function hasLikelyTruncatedEnding(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return true;
  }

  return !/[.!?…"'”)]$/.test(trimmed);
}

function ensureCompleteEnding(script: string): string {
  const normalized = script.replace(/\r\n/g, "\n").trim();
  if (!hasLikelyTruncatedEnding(normalized)) {
    return normalized;
  }

  const lastSentenceEnd = Math.max(
    normalized.lastIndexOf("."),
    normalized.lastIndexOf("!"),
    normalized.lastIndexOf("?")
  );

  if (lastSentenceEnd > Math.floor(normalized.length * 0.55)) {
    return normalized.slice(0, lastSentenceEnd + 1).trim();
  }

  return `${normalized} Hãy ghé cửa hàng để chọn ngay phần trái cây tươi ngon phù hợp cho gia đình bạn.`;
}

function fitScriptLength(
  script: string,
  targetChars: number,
  minChars: number,
  maxChars: number
): string {
  const normalized = script.replace(/\r\n/g, "\n").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }

  const inspectionWindow = normalized.slice(0, maxChars + 120);
  const sentenceEnd = Math.max(
    inspectionWindow.lastIndexOf("."),
    inspectionWindow.lastIndexOf("!"),
    inspectionWindow.lastIndexOf("?")
  );

  if (sentenceEnd >= minChars) {
    return inspectionWindow.slice(0, sentenceEnd + 1).trim();
  }

  const softCap = Math.max(minChars, Math.min(maxChars, targetChars + 80));
  const softSlice = normalized.slice(0, softCap);
  const wordBreak = softSlice.lastIndexOf(" ");

  const safe = wordBreak > 0 ? softSlice.slice(0, wordBreak).trim() : softSlice.trim();
  return /[.!?…"'”)]$/.test(safe) ? safe : `${safe}.`;
}

function buildDeterministicSceneFallback(input: {
  topic: string;
  sceneLocation: string;
  characterType: string;
  numberOfScenes: number;
}): string {
  const fruitProfile = buildFruitProfile(input.topic);
  const scenes: string[] = [];

  for (let index = 1; index <= input.numberOfScenes; index += 1) {
    const isFirst = index === 1;
    const isLast = index === input.numberOfScenes;

    let visualPrompt = "";
    let voiceover = "";

    if (isFirst) {
      visualPrompt = `0-3 giây đầu: Toàn cảnh ${input.sceneLocation}, máy quay lao nhanh vào quầy, dừng ở tay ${input.characterType} đang cầm ${fruitProfile.label} với ${fruitProfile.visualCue}.`;
      voiceover = `Bạn có bao giờ mua ${fruitProfile.label} mà nhìn đẹp nhưng ăn không như kỳ vọng chưa? Ngay 3 giây đầu này, tôi sẽ chỉ bạn dấu hiệu nhận biết trái thật sự đáng mua tại ${input.sceneLocation}.`;
    } else if (isLast) {
      visualPrompt = `Cận cảnh ${fruitProfile.label} được đóng gói sạch đẹp tại ${input.sceneLocation}, nhân vật mỉm cười chào và chỉ vào quầy hàng cùng thông tin liên hệ.`;
      voiceover = `Nếu bạn muốn chọn ${fruitProfile.label} đúng chuẩn, hãy ghé ${input.sceneLocation} hoặc nhắn ngay cho cửa hàng để được tư vấn nhanh. Chốt đơn hôm nay để nhận trái tươi, đều vị và lên hình đẹp đúng như bạn mong đợi.`;
    } else {
      visualPrompt = `Các góc quay ngắn 3-5 giây: cận cảnh ${fruitProfile.label} với màu sắc, độ căng mọng, ${fruitProfile.visualCue}; xen kẽ cảnh ${input.characterType} tư vấn trực tiếp tại quầy.`;
      voiceover = `${fruitProfile.label} có ${fruitProfile.sensory}. Loại này rất hợp để ${fruitProfile.usage}. Mỗi lô hàng đều được chọn theo tiêu chí rõ ràng để bạn mua nhanh mà vẫn yên tâm chất lượng.`;
    }

    scenes.push(
      [
        `SCENE ${index}`,
        `Cảnh quay: ${visualPrompt}`,
        `Lời thoại: ${voiceover}`,
      ].join("\n")
    );
  }

  return scenes.join("\n\n");
}
