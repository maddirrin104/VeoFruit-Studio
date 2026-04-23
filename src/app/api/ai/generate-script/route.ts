import { promises as fs } from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, createPartFromBase64, createPartFromText } from "@google/genai";
import { getRuntimeSettings } from "@/lib/runtime-settings";
import { resolvePublicPathFromRequestPath } from "@/lib/runtime-path";

interface GenerateScriptRequest {
  topic: string;
  characterDescription?: string;
  characterType?: string;
  sceneLocation?: string;
  voiceType?: "Nam" | "Nữ";
  videoGenre?: string;
  contentTone?: string;
  numberOfScenes?: number;
  referenceImageUrl?: string;
  referenceImageName?: string;
  referenceImageSource?: "upload" | "url";
  brandBackgroundImageUrl?: string;
  brandBackgroundImageName?: string;
  brandBackgroundImageSource?: "upload" | "url";
}

const CHARS_PER_SCENE = 500;
const MIN_CHARS_PER_SCENE = 400;
const MAX_CHARS_PER_SCENE = 600;
const BASE_SCENE_COUNT = 3;
const MIN_TARGET_DURATION_SECONDS = 60;
const MAX_TARGET_DURATION_SECONDS = 90;
const GEMINI_MAX_RETRIES = 3;

function getScriptCharLimits(sceneCount: number) {
  const n = Math.max(BASE_SCENE_COUNT, sceneCount);
  return {
    target: n * CHARS_PER_SCENE,
    min: n * MIN_CHARS_PER_SCENE,
    max: n * MAX_CHARS_PER_SCENE,
    maxOutputTokens: Math.min(8192, Math.max(2048, n * 700)),
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
      referenceImageUrl,
      referenceImageName,
      referenceImageSource,
      brandBackgroundImageUrl,
      brandBackgroundImageName,
      brandBackgroundImageSource,
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

    const requestedScenes = Math.max(2, Math.min(18, numberOfScenes));
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
      targetChars: charLimits.target,
      minChars: charLimits.min,
      maxChars: charLimits.max,
      referenceImageName,
      referenceImageSource,
      hasReferenceImage: Boolean(productImagePart),
      brandBackgroundImageName,
      brandBackgroundImageSource,
      hasBrandBackgroundImage: Boolean(brandBackgroundImagePart),
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
      `Thời lượng tổng phải nằm trong ${MIN_TARGET_DURATION_SECONDS}-${MAX_TARGET_DURATION_SECONDS} giây, phù hợp TikTok/Reels/Shorts.`,
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

    if (countScenes(script) < requestedScenes || hasLikelyTruncatedEnding(script)) {
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
        `- Tổng thời lượng phải nằm trong ${MIN_TARGET_DURATION_SECONDS}-${MAX_TARGET_DURATION_SECONDS} giây (TikTok/Reels/Shorts).`,
        `- Tổng độ dài toàn kịch bản khoảng ${charLimits.target} ký tự (dao động ${charLimits.min}-${charLimits.max} ký tự).`,
        "- Chỉ trả về kịch bản hoàn chỉnh.",
        "",
        "Bản nháp chưa đạt (hãy viết lại đầy đủ):",
        script,
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
        }
      } catch (retryError) {
        if (!isTransientGeminiError(retryError)) {
          throw retryError;
        }

        if (!warningMessage) {
          warningMessage =
            "Gemini đang quá tải tạm thời, hệ thống giữ bản kịch bản hiện tại để tránh gián đoạn.";
        }
      }
    }

    if (countScenes(script) < requestedScenes) {
      script = buildDeterministicSceneFallback({
        topic,
        sceneLocation,
        characterType,
        numberOfScenes: requestedScenes,
      });
      scriptSource = "fallback";
      if (!warningMessage) {
        warningMessage =
          "Gemini trả về định dạng kịch bản chưa đúng số cảnh yêu cầu, hệ thống đã chuyển sang kịch bản dự phòng để đảm bảo bạn vẫn dùng được ngay.";
      }
    }

    script = ensureCompleteEnding(script);
    script = fitScriptLength(script, charLimits.target, charLimits.min, charLimits.max);

    return NextResponse.json({
      data: {
        script,
        estimatedDuration: `${MIN_TARGET_DURATION_SECONDS}-${MAX_TARGET_DURATION_SECONDS} seconds`,
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
      if (!isTransientGeminiError(error) || attempt >= GEMINI_MAX_RETRIES) {
        throw error;
      }

      const delayMs = 900 * 2 ** (attempt - 1);
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

function buildGeminiScriptPrompt(input: {
  topic: string;
  characterDescription: string;
  characterType: string;
  sceneLocation: string;
  voiceType: "Nam" | "Nữ";
  videoGenre: string;
  contentTone: string;
  numberOfScenes: number;
  targetChars: number;
  minChars: number;
  maxChars: number;
  referenceImageName?: string;
  referenceImageSource?: "upload" | "url";
  hasReferenceImage: boolean;
  brandBackgroundImageName?: string;
  brandBackgroundImageSource?: "upload" | "url";
  hasBrandBackgroundImage: boolean;
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

  return [
    "Bạn là biên kịch video ngắn chuyên nghiệp cho nội dung trái cây bán hàng.",
    "Mục tiêu chính là tạo kịch bản giúp người xem muốn mua, tin sản phẩm và hiểu nhanh điểm nổi bật của trái cây.",
    `Phân tích trái cây chính: ${buildFruitProfile(input.topic).label} - ${buildFruitProfile(input.topic).sensory}.`,
    `Gợi ý sử dụng: ${buildFruitProfile(input.topic).usage}.`,
    `Chi tiết hình ảnh cần nhấn: ${buildFruitProfile(input.topic).visualCue}.`,
    `Chủ đề: ${input.topic}.`,
    `Nhân vật: ${input.characterType}.`,
    `Mô tả nhân vật: ${input.characterDescription}.`,
    `Bối cảnh mong muốn: ${input.sceneLocation}.`,
    `Thể loại: ${input.videoGenre}.`,
    `Tông nội dung: ${input.contentTone}.`,
    `Giới tính voiceover: ${input.voiceType}.`,
    `Số cảnh mong muốn: khoảng ${input.numberOfScenes} cảnh.`,
    referenceBlock,
    brandReferenceBlock,
    "",
    "Yêu cầu đầu ra:",
    "- Viết bằng tiếng Việt tự nhiên, phù hợp video ngắn bán trái cây.",
    "- Biến chủ đề/nội dung đầu vào thành kịch bản video, không viết kiểu ghi chú rời rạc.",
    "- Ưu tiên kịch bản theo cấu trúc bán hàng: Hook mở đầu mạnh -> giới thiệu sản phẩm -> nêu lợi ích/điểm khác biệt -> chốt CTA.",
    "- Bắt buộc có hook trong 3 giây đầu (câu mở đầu gây tò mò, kéo người xem ở lại).",
    "- Nhấn các yếu tố giúp bán hàng: độ tươi, màu sắc, độ mọng, độ ngọt, nguồn gốc, độ đẹp mắt khi lên hình, cảm giác đáng mua.",
    "- Tránh lặp cùng một mô tả 'tươi ngon, mọng nước, bắt mắt' cho mọi cảnh; mỗi cảnh phải dùng một góc cảm quan khác nhau phù hợp với đúng loại trái cây.",
    "- Nếu ảnh tham chiếu là trái cây cụ thể, phải giữ đúng loại trái cây đó làm trung tâm nội dung.",
    "- Nếu phù hợp, thêm gợi ý cho người xem: mua để ăn ngay, biếu tặng, làm sinh tố, làm món tráng miệng hoặc dùng cho gia đình.",
    "- Không phóng đại quá mức hoặc hứa hẹn sai sự thật; ngôn ngữ nên thuyết phục nhưng vẫn tự nhiên.",
    "- Kịch bản phải dài hơn một đoạn giới thiệu bình thường. Với 3 cảnh, mỗi cảnh tối thiểu 2-3 câu thoại và 1-2 câu mô tả hình ảnh. Với 4 cảnh, mỗi cảnh tối thiểu 2 câu thoại và 1-2 câu mô tả hình ảnh.",
    "- Mỗi cảnh phải có chi tiết khác nhau, không lặp ý giữa các cảnh.",
    "- Cảnh đầu: hook mạnh và giới thiệu sản phẩm.",
    "- Cảnh giữa: mô tả đặc điểm trái cây, lợi ích, cảm giác mua hàng.",
    "- Cảnh cuối: chốt CTA rõ ràng, khuyến khích mua hoặc ghé cửa hàng.",
    `- Tổng thời lượng mục tiêu: ${MIN_TARGET_DURATION_SECONDS}-${MAX_TARGET_DURATION_SECONDS} giây, phù hợp TikTok/Reels/Shorts.`,
    "- Chia nội dung thành từng đoạn ngắn; mỗi đoạn thoại 1-2 câu ngắn, nhịp đọc tự nhiên, dễ thu âm.",
    "- Chia rõ thành từng cảnh theo format:",
    "  SCENE 1",
    "  Cảnh quay: [mô tả cảnh quay bằng tiếng Việt, ngắn gọn, rõ hành động, góc máy, ánh sáng, bối cảnh]",
    "  Lời thoại: [các câu thoại ngắn, tách đoạn rõ ràng, dễ đọc trong video ngắn]",
    "- Toàn bộ đầu ra phải là tiếng Việt, bao gồm cả Cảnh quay và Lời thoại.",
    "- Mỗi cảnh nên ngắn, dễ đọc, dễ thu âm, nhịp nói tự nhiên.",
    input.hasReferenceImage && input.hasBrandBackgroundImage
      ? "- Nếu có cả ảnh sản phẩm và ảnh brand/background, phải giữ đúng trái cây theo ảnh sản phẩm và giữ đúng bối cảnh/mặt tiền theo ảnh brand; kịch bản nên mô tả chúng xuất hiện cùng nhau một cách tự nhiên."
      : "- Nếu có ảnh tham chiếu, kịch bản phải bám theo ảnh và không đi lệch quá xa nội dung ảnh.",
    "- Không viết phần giải thích, chỉ trả về kịch bản hoàn chỉnh.",
    "- Đảm bảo câu chữ phù hợp để dùng ngay cho tạo video.",
    `- Tổng độ dài toàn kịch bản khoảng ${input.targetChars} ký tự (dao động ${input.minChars}-${input.maxChars} ký tự).`,
    "- Không được cắt dở câu ở cuối; câu cuối phải hoàn chỉnh.",
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
  return script.replace(
    /(^|\n)\s*(?:SCENE|CẢNH|CANH)\s*[:#-]?\s*(\d+)\b/gi,
    (_match, prefix: string, sceneNo: string) => `${prefix}SCENE ${sceneNo}`
  );
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
