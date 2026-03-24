import { NextRequest, NextResponse } from "next/server";

interface GenerateScriptRequest {
  topic: string;
  characterDescription?: string;
  characterType?: string;
  sceneLocation?: string;
  voiceType?: "Nam" | "Nữ" | "Trung tính AI";
  videoGenre?: string;
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
      characterDescription = "",
      characterType = "Nữ bán trái cây xinh tươi",
      sceneLocation = "Cửa hàng trái cây",
      voiceType = "Nữ",
      videoGenre = "Giới thiệu trong cửa hàng",
      contentTone = "Giới thiệu",
      numberOfScenes = 3,
    } = body;

    const resolvedCharacterDescription =
      characterDescription.trim() ||
      buildDefaultCharacterDescription(voiceType, characterType, sceneLocation);

    // Template script generator (replace with actual AI API call)
    const script = generateTemplateScript(
      topic,
      resolvedCharacterDescription,
      characterType,
      sceneLocation,
      voiceType,
      videoGenre,
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
  characterDescription: string,
  characterType: string,
  sceneLocation: string,
  voiceType: "Nam" | "Nữ" | "Trung tính AI",
  videoGenre: string,
  tone: string,
  scenes: number
): string {
  const sceneScripts: string[] = [];

  for (let i = 1; i <= scenes; i++) {
    const sceneContent = generateSceneContent(
      i,
      scenes,
      topic,
      characterDescription,
      characterType,
      sceneLocation,
      voiceType,
      videoGenre,
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
  characterDescription: string,
  characterType: string,
  sceneLocation: string,
  voiceType: "Nam" | "Nữ" | "Trung tính AI",
  videoGenre: string,
  tone: string
): string {
  if (sceneNum === 1) {
    return `SCENE ${sceneNum} - MỞ CẢNH
BỐI CẢNH: ${sceneLocation}. THỂ LOẠI: ${videoGenre}. TÔNG: ${tone}.

NHÂN VẬT: ${characterType}. MÔ TẢ: ${characterDescription}

LỜI THOẠI: "Xin chào cả nhà! Hôm nay ${voiceType === "Nữ" ? "em" : voiceType === "Nam" ? "anh" : "mình"} muốn giới thiệu ${topic} tươi ngon vừa về tại ${sceneLocation.toLowerCase()}."

HÌNH ẢNH: Cận cảnh ${topic}, nhân vật mỉm cười và nâng trái cây về phía máy quay.`;
  }

  if (sceneNum === totalScenes) {
    return `SCENE ${sceneNum} - KẾT CẢNH
BỐI CẢNH: ${sceneLocation} với ánh sáng ấm áp.

LỜI THOẠI: "Cảm ơn bạn đã xem! Nếu thích ${topic}, ghé ${sceneLocation.toLowerCase()} để ${voiceType === "Nữ" ? "em" : voiceType === "Nam" ? "anh" : "mình"} tư vấn thêm nhé!"

HÌNH ẢNH: Nhân vật vẫy tay chào, logo cửa hàng xuất hiện, kết thúc mềm mại.`;
  }

  return `SCENE ${sceneNum} - NỘI DUNG CHÍNH
BỐI CẢNH: ${sceneLocation}. NHÂN VẬT: ${characterType}.

LỜI THOẠI: "${topic} có vị ngọt tự nhiên, mọng nước và phù hợp cho cả gia đình. ${voiceType === "Nữ" ? "Em" : voiceType === "Nam" ? "Anh" : "Mình"} sẽ gợi ý cách chọn quả ngon ngay tại quầy."

HÌNH ẢNH: Nhân vật chọn từng quả ${topic}, chỉ rõ độ tươi, vỏ, màu sắc và cách bảo quản.`;
}

function buildDefaultCharacterDescription(
  voiceType: "Nam" | "Nữ" | "Trung tính AI",
  characterType: string,
  sceneLocation: string
): string {
  if (characterType.includes("Nữ") || voiceType === "Nữ") {
    return `Chị bán trái cây xinh tươi tại ${sceneLocation}, nụ cười thân thiện, giọng nói ngọt ngào.`;
  }

  if (characterType.includes("Nam") || voiceType === "Nam") {
    return `Anh bán trái cây dễ thương tại ${sceneLocation}, hiền lành, lịch sự và tư vấn rõ ràng.`;
  }

  if (characterType.includes("3D")) {
    return `Nhân vật 3D hoạt hình tại ${sceneLocation}, biểu cảm sinh động, giọng điệu vui tươi.`;
  }

  return `Nhân vật thân thiện tại ${sceneLocation}, phong cách gần gũi và tự nhiên.`;
}
