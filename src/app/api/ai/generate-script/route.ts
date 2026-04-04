import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, createPartFromBase64, createPartFromText } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}

const genAI = new GoogleGenAI({ apiKey, apiVersion: "v1" });

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
}

export async function POST(request: NextRequest) {
  try {
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
    } = body;

    const resolvedCharacterDescription =
      characterDescription.trim() ||
      buildDefaultCharacterDescription(voiceType, characterType, sceneLocation);

    const imagePart = referenceImageUrl
      ? await loadReferenceImagePart(request, referenceImageUrl)
      : undefined;

    const prompt = buildGeminiScriptPrompt({
      topic,
      characterDescription: resolvedCharacterDescription,
      characterType,
      sceneLocation,
      voiceType,
      videoGenre,
      contentTone,
      numberOfScenes,
      referenceImageName,
      referenceImageSource,
      hasReferenceImage: Boolean(imagePart),
    });

    const model = genAI.models as unknown as {
      generateContent: (args: {
        model: string;
        contents: Array<{ role?: string; parts: unknown[] }> | string;
        config?: {
          temperature?: number;
          topP?: number;
          maxOutputTokens?: number;
          responseMimeType?: string;
        };
      }) => Promise<{ text?: string }>;
    };

    const contents = imagePart
      ? [{ role: "user", parts: [createPartFromText(prompt), imagePart] }]
      : prompt;

    const result = await model.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: "text/plain",
      },
    });

    const script = result.text?.trim();
    if (!script) {
      throw new Error("Gemini returned an empty script response");
    }

    return NextResponse.json({
      data: {
        script,
        estimatedDuration: `${Math.min(numberOfScenes * 6, 72)} seconds`,
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

async function loadReferenceImagePart(request: NextRequest, referenceImageUrl: string) {
  const normalizedUrl = referenceImageUrl.trim();
  const parsed = new URL(normalizedUrl, request.url);

  if (
    parsed.origin === new URL(request.url).origin ||
    parsed.pathname.startsWith("/uploads/")
  ) {
    const decodedPathname = decodeURIComponent(parsed.pathname);
    const filePath = path.join(process.cwd(), "public", decodedPathname.replace(/^\//, ""));
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
  referenceImageName?: string;
  referenceImageSource?: "upload" | "url";
  hasReferenceImage: boolean;
}): string {
  const sourceLabel =
    input.referenceImageSource === "upload"
      ? "ảnh upload từ máy"
      : input.referenceImageSource === "url"
      ? "ảnh từ URL"
      : "ảnh tham chiếu";

  const referenceBlock = input.hasReferenceImage
    ? [
        `Ảnh tham chiếu: ${sourceLabel}.`,
        input.referenceImageName ? `Tên file: ${input.referenceImageName}.` : "",
        "Hãy quan sát ảnh để nhận biết trái cây, màu sắc, độ tươi, kiểu bối cảnh và gợi ý nội dung phù hợp nhất với ảnh.",
        "Nếu ảnh có trái cây cụ thể, ưu tiên đúng loại trái cây đó trong kịch bản.",
        "Nếu ảnh chứa nhiều chi tiết, hãy chọn chi tiết chính làm trọng tâm quảng cáo/video.",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return [
    "Bạn là biên kịch video ngắn chuyên nghiệp cho nội dung trái cây bán hàng.",
    "Mục tiêu chính là tạo kịch bản giúp người xem muốn mua, tin sản phẩm và hiểu nhanh điểm nổi bật của trái cây.",
    `Chủ đề: ${input.topic}.`,
    `Nhân vật: ${input.characterType}.`,
    `Mô tả nhân vật: ${input.characterDescription}.`,
    `Bối cảnh mong muốn: ${input.sceneLocation}.`,
    `Thể loại: ${input.videoGenre}.`,
    `Tông nội dung: ${input.contentTone}.`,
    `Giới tính voiceover: ${input.voiceType}.`,
    `Số cảnh mong muốn: khoảng ${input.numberOfScenes} cảnh.`,
    referenceBlock,
    "",
    "Yêu cầu đầu ra:",
    "- Viết bằng tiếng Việt tự nhiên, phù hợp video ngắn bán trái cây.",
    "- Ưu tiên kịch bản theo cấu trúc bán hàng: Hook mở đầu mạnh -> giới thiệu sản phẩm -> nêu lợi ích/điểm khác biệt -> chốt CTA.",
    "- Nhấn các yếu tố giúp bán hàng: độ tươi, màu sắc, độ mọng, độ ngọt, nguồn gốc, độ đẹp mắt khi lên hình, cảm giác đáng mua.",
    "- Nếu ảnh tham chiếu là trái cây cụ thể, phải giữ đúng loại trái cây đó làm trung tâm nội dung.",
    "- Nếu phù hợp, thêm gợi ý cho người xem: mua để ăn ngay, biếu tặng, làm sinh tố, làm món tráng miệng hoặc dùng cho gia đình.",
    "- Không phóng đại quá mức hoặc hứa hẹn sai sự thật; ngôn ngữ nên thuyết phục nhưng vẫn tự nhiên.",
    "- Chia rõ thành từng cảnh theo format:",
    "  SCENE 1",
    "  VISUAL PROMPT: [mô tả cảnh quay bằng tiếng Việt, ngắn gọn, rõ hành động, góc máy, ánh sáng, bối cảnh]",
    "  VOICEOVER: [lời thoại tiếng Việt]",
    "- Toàn bộ đầu ra phải là tiếng Việt, bao gồm cả VISUAL PROMPT và VOICEOVER.",
    "- Mỗi cảnh nên ngắn, dễ đọc, dễ thu âm, nhịp nói tự nhiên.",
    "- Nếu có ảnh tham chiếu, kịch bản phải bám theo ảnh và không đi lệch quá xa nội dung ảnh.",
    "- Không viết phần giải thích, chỉ trả về kịch bản hoàn chỉnh.",
    "- Đảm bảo câu chữ phù hợp để dùng ngay cho tạo video.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildDefaultCharacterDescription(
  voiceType: "Nam" | "Nữ",
  characterType: string,
  sceneLocation: string
): string {
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
    return `Chủ shop trái cây tại ${sceneLocation}, phong cách thân thiện, hiểu rõ nguồn hàng theo ngày, tư vấn thẳng thắn về độ chín và cách chọn trái phù hợp nhu cầu.`;
  }

  if (characterType.includes("Nhân viên siêu thị")) {
    return `Nhân viên quầy trái cây tại ${sceneLocation}, tác phong chỉn chu, hướng dẫn nhanh tiêu chí chọn trái tươi và gợi ý cách bảo quản tiện lợi sau khi mua.`;
  }

  if (characterType.includes("MC")) {
    return `MC tại ${sceneLocation}, giọng nói rõ ràng, chuyên nghiệp, truyền tải thông tin mạch lạc và dễ theo dõi.`;
  }

  if (characterType.includes("Nữ") || voiceType === "Nữ") {
    return `Nữ tư vấn viên tại ${sceneLocation}, tác phong chuyên nghiệp, giao tiếp thân thiện, giới thiệu điểm nổi bật của từng loại trái cây.`;
  }

  if (characterType.includes("Nam") || voiceType === "Nam") {
    return `Nam tư vấn viên tại ${sceneLocation}, phong thái điềm tĩnh, tư vấn rõ ràng, nhấn mạnh độ tươi, hương vị và cách bảo quản.`;
  }

  return `Nhân vật giới thiệu tại ${sceneLocation}, phong cách gần gũi, diễn đạt mạch lạc và tập trung vào thông tin hữu ích cho người mua.`;
}
