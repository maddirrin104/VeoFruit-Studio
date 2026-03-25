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
      characterType = "Nữ tư vấn viên cửa hàng trái cây",
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
  const inferredVoiceType = characterType.includes("Nữ")
    ? "Nữ"
    : characterType.includes("Nam")
    ? "Nam"
    : voiceType;

  const narrator =
    inferredVoiceType === "Nữ"
      ? "em"
      : inferredVoiceType === "Nam"
      ? "anh"
      : "mình";
  const narratorCap = narrator.charAt(0).toUpperCase() + narrator.slice(1);
  const toneLine = buildToneDialogueLine(tone, {
    topic,
    sceneLocation,
    narrator,
    narratorCap,
    sceneNum,
    totalScenes,
  });

  if (sceneNum === 1) {
    return `SCENE ${sceneNum} - MỞ CẢNH
BỐI CẢNH: ${sceneLocation}. THỂ LOẠI: ${videoGenre}. TÔNG: ${tone}.

NHÂN VẬT: ${characterType}. MÔ TẢ: ${characterDescription}

LỜI THOẠI: "${toneLine.opening}"

HÌNH ẢNH: Cận cảnh ${topic}, nhân vật mỉm cười và nâng trái cây về phía máy quay.`;
  }

  if (sceneNum === totalScenes) {
    return `SCENE ${sceneNum} - KẾT CẢNH
BỐI CẢNH: ${sceneLocation} với ánh sáng ấm áp.

LỜI THOẠI: "${toneLine.ending}"

HÌNH ẢNH: Nhân vật vẫy tay chào, logo cửa hàng xuất hiện, kết thúc mềm mại.`;
  }

  return `SCENE ${sceneNum} - NỘI DUNG CHÍNH
BỐI CẢNH: ${sceneLocation}. NHÂN VẬT: ${characterType}.

LỜI THOẠI: "${toneLine.middle}"

HÌNH ẢNH: Nhân vật chọn từng quả ${topic}, chỉ rõ độ tươi, vỏ, màu sắc và cách bảo quản.`;
}

function buildToneDialogueLine(
  tone: string,
  context: {
    topic: string;
    sceneLocation: string;
    narrator: string;
    narratorCap: string;
    sceneNum: number;
    totalScenes: number;
  }
): { opening: string; middle: string; ending: string } {
  const { topic, sceneLocation, narrator, narratorCap } = context;
  const normalized = normalizeToneKey(tone);

  if (normalized.includes("hai huoc")) {
    return {
      opening: `Xin chào cả nhà, hôm nay ${narrator} đến ${sceneLocation.toLowerCase()} với nhiệm vụ tìm ra trái ${topic} ngon đến mức ăn một miếng là muốn xin thêm miếng nữa!`,
      middle: `${narratorCap} chấm nhanh ${topic}: nhìn tươi, mùi thơm, cắn vào giòn ngọt. Mẹo của ${narrator} là chọn quả chắc tay, vỏ đều màu và không dập cuống.`,
      ending: `Nếu bạn thấy ${topic} hợp gu, ghé ${sceneLocation.toLowerCase()} để ${narrator} tư vấn bản "ngon - bổ - hợp túi tiền" nhé!`,
    };
  }

  if (normalized.includes("review")) {
    return {
      opening: `Xin chào mọi người, hôm nay ${narrator} review nhanh ${topic} tại ${sceneLocation.toLowerCase()} theo 3 tiêu chí: độ tươi, hương vị và mức giá.`,
      middle: `Đánh giá thực tế: ${topic} có độ mọng tốt, vị cân bằng và dễ dùng cho cả ăn trực tiếp lẫn làm món tráng miệng. ${narratorCap} sẽ chỉ cách chọn quả đạt chất lượng ổn định.`,
      ending: `Tổng kết của ${narrator}: ${topic} đáng thử trong tầm giá hiện tại. Bạn có thể ghé ${sceneLocation.toLowerCase()} để xem lô hàng mới trong ngày.`,
    };
  }

  if (normalized.includes("ke chuyen")) {
    return {
      opening: `Sáng nay ở ${sceneLocation.toLowerCase()}, ${narrator} gặp lô ${topic} vừa về còn thơm mùi vườn. Từ khoảnh khắc đó, ${narrator} muốn kể bạn nghe hành trình của những trái quả thật sự chất lượng.`,
      middle: `${narratorCap} chọn từng trái ${topic} dựa vào cuống, độ đàn hồi và mùi hương. Mỗi chi tiết nhỏ đều quyết định trải nghiệm ngon khi mang về nhà.`,
      ending: `Câu chuyện hôm nay dừng lại ở đây, nhưng trải nghiệm với ${topic} thì còn tiếp. Ghé ${sceneLocation.toLowerCase()} để ${narrator} chia sẻ thêm nhé.`,
    };
  }

  if (normalized.includes("khuyen mai")) {
    return {
      opening: `Thông tin nhanh cho bạn: ${topic} tại ${sceneLocation.toLowerCase()} đang có chương trình ưu đãi trong ngày với số lượng giới hạn.`,
      middle: `${narratorCap} gợi ý bạn chọn ${topic} theo độ chín phù hợp nhu cầu dùng ngay hoặc để 1-2 ngày. Vừa ngon, vừa tối ưu chi phí mua sắm.`,
      ending: `Nếu cần ${topic} cho gia đình hoặc biếu tặng, ghé ${sceneLocation.toLowerCase()} sớm để nhận mức giá tốt và được ${narrator} hỗ trợ chọn hàng.`,
    };
  }

  if (normalized.includes("loi ich") || normalized.includes("suc khoe")) {
    return {
      opening: `Hôm nay ${narrator} chia sẻ về ${topic} tại ${sceneLocation.toLowerCase()} dưới góc nhìn dinh dưỡng và cách dùng hằng ngày.`,
      middle: `${topic} là lựa chọn phù hợp để bổ sung chất xơ và vitamin trong khẩu phần. ${narratorCap} sẽ hướng dẫn cách chọn trái tươi để giữ hương vị và giá trị dinh dưỡng tốt hơn.`,
      ending: `Bạn có thể bắt đầu từ lượng vừa phải mỗi ngày với ${topic}. Ghé ${sceneLocation.toLowerCase()} để ${narrator} tư vấn theo nhu cầu cụ thể của bạn.`,
    };
  }

  if (normalized.includes("giao duc")) {
    return {
      opening: `Trong nội dung giáo dục hôm nay, ${narrator} sẽ giải thích cách nhận biết ${topic} đạt chất lượng tại ${sceneLocation.toLowerCase()} dựa trên các dấu hiệu dễ quan sát.`,
      middle: `${narratorCap} đi theo nguyên tắc: nhìn màu vỏ để ước lượng độ chín, kiểm tra cuống để đánh giá độ tươi, và cảm nhận độ đàn hồi để tránh trái bị bở hoặc úng. Hiểu đúng nguyên lý giúp bạn chọn chính xác hơn thay vì chọn theo cảm tính.`,
      ending: `Khi nắm rõ các tiêu chí này, bạn có thể tự tin chọn ${topic} ngon và ổn định hơn mỗi lần mua. Nếu muốn học thêm theo từng loại trái, ghé ${sceneLocation.toLowerCase()} để ${narrator} chia sẻ tiếp nhé.`,
    };
  }

  if (
    normalized.includes("chia se meo") ||
    normalized.includes("meo chon") ||
    normalized.includes("meo")
  ) {
    return {
      opening: `Hôm nay ${narrator} chia sẻ mẹo chọn ${topic} nhanh - gọn - dễ nhớ ngay tại ${sceneLocation.toLowerCase()}, đi chợ bận mấy cũng áp dụng được.`,
      middle: `Checklist 10 giây: nhìn bề mặt không dập, cầm thử thấy chắc tay, ngửi nhẹ có mùi tự nhiên và ưu tiên trái cùng lô để độ chín đồng đều. ${narratorCap} làm mẫu trực tiếp để bạn dùng ngay lần mua tới.`,
      ending: `Bạn chỉ cần nhớ checklist này là đã giảm hẳn nguy cơ chọn nhầm ${topic}. Lưu lại video và ghé ${sceneLocation.toLowerCase()} nếu muốn ${narrator} tư vấn thêm mẹo theo mục đích sử dụng nhé.`,
    };
  }

  if (normalized.includes("huong dan")) {
    return {
      opening: `Trong video này, ${narrator} sẽ hướng dẫn bạn chọn ${topic} ngon tại ${sceneLocation.toLowerCase()} chỉ với vài dấu hiệu rất dễ nhận biết.`,
      middle: `Bước 1 kiểm tra vỏ và cuống, bước 2 thử độ chắc tay, bước 3 ngửi mùi hương tự nhiên. ${narratorCap} sẽ làm mẫu trực tiếp để bạn áp dụng ngay khi mua.`,
      ending: `Bạn cứ lưu lại 3 bước này, lần tới chọn ${topic} sẽ tự tin hơn nhiều. Cần hỗ trợ thêm, ghé ${sceneLocation.toLowerCase()} nhé.`,
    };
  }

  if (normalized.includes("so sanh")) {
    return {
      opening: `Hôm nay ${narrator} so sánh nhanh các nhóm ${topic} tại ${sceneLocation.toLowerCase()} để bạn chọn đúng theo nhu cầu dùng.`,
      middle: `${narratorCap} phân biệt theo độ chín, độ ngọt và mục đích sử dụng: ăn trực tiếp, làm sinh tố hay làm topping món tráng miệng.`,
      ending: `Khi đã nắm tiêu chí so sánh, bạn sẽ mua ${topic} chính xác hơn. Ghé ${sceneLocation.toLowerCase()} để ${narrator} tư vấn chi tiết tại quầy.`,
    };
  }

  if (normalized.includes("ban hang") || normalized.includes("livestream")) {
    return {
      opening: `Xin chào cả nhà, hôm nay ${narrator} livestream giới thiệu ${topic} mới về tại ${sceneLocation.toLowerCase()}, hàng tươi và tuyển chọn theo lô.`,
      middle: `${narratorCap} sẽ lên trái thực tế để bạn xem độ tươi, màu sắc và size. Nếu cần loại ăn ngọt hay loại làm nước ép, ${narrator} tư vấn theo nhu cầu luôn.`,
      ending: `Bạn quan tâm ${topic} thì để lại nhu cầu, ${narrator} chốt theo lô phù hợp. Hoặc ghé trực tiếp ${sceneLocation.toLowerCase()} để xem hàng tận mắt.`,
    };
  }

  if (normalized.includes("viral")) {
    return {
      opening: `Trend hôm nay tại ${sceneLocation.toLowerCase()}: ${topic} bản tươi ngon chuẩn quay cận cảnh, lên hình bắt mắt ngay từ khung đầu tiên.`,
      middle: `${narratorCap} bật mí combo nội dung dễ lên xu hướng: cảnh bóc/cắt cận tay, âm thanh giòn rõ và mẹo chọn quả đẹp để lên video thật "đã mắt".`,
      ending: `Nếu bạn muốn thử format viral với ${topic}, ghé ${sceneLocation.toLowerCase()} để ${narrator} gợi ý set quay phù hợp nhé!`,
    };
  }

  if (normalized.includes("phong cach doi thuong")) {
    return {
      opening: `Một ngày bình thường ở ${sceneLocation.toLowerCase()}, ${narrator} chọn vài phần ${topic} tươi để dùng cho bữa nhẹ trong gia đình.`,
      middle: `${narratorCap} ưu tiên trái dễ ăn, vị ổn định và tiện bảo quản. Cách chọn đơn giản nhưng giúp bữa phụ ngon và đỡ lãng phí hơn.`,
      ending: `Đó là cách ${narrator} chọn ${topic} theo kiểu đời thường, dễ áp dụng mỗi ngày. Bạn có thể ghé ${sceneLocation.toLowerCase()} để tham khảo thêm.`,
    };
  }

  if (normalized.includes("cam hung") || normalized.includes("tich cuc")) {
    return {
      opening: `Mỗi ngày tích cực bắt đầu từ lựa chọn tốt cho cơ thể. Hôm nay ${narrator} chọn ${topic} tại ${sceneLocation.toLowerCase()} để lan toả năng lượng lành mạnh.`,
      middle: `${narratorCap} tin rằng ăn ngon và chăm sóc bản thân có thể bắt đầu từ những điều nhỏ: chọn trái tươi, dùng đúng lúc và chia sẻ cùng người thân.`,
      ending: `Hy vọng video này truyền cảm hứng để bạn bắt đầu thói quen tốt với ${topic}. Khi cần, ghé ${sceneLocation.toLowerCase()} để ${narrator} hỗ trợ nhé!`,
    };
  }

  if (normalized.includes("gioi thieu")) {
    return {
      opening: `Xin chào cả nhà! Hôm nay ${narrator} muốn giới thiệu ${topic} tươi ngon vừa về tại ${sceneLocation.toLowerCase()}.`,
      middle: `${topic} có vị ngọt tự nhiên, mọng nước và phù hợp cho cả gia đình. ${narratorCap} sẽ gợi ý cách chọn quả ngon ngay tại quầy.`,
      ending: `Cảm ơn bạn đã xem! Nếu thích ${topic}, ghé ${sceneLocation.toLowerCase()} để ${narrator} tư vấn thêm nhé!`,
    };
  }

  return {
    opening: `Xin chào cả nhà! Hôm nay ${narrator} muốn giới thiệu ${topic} tươi ngon vừa về tại ${sceneLocation.toLowerCase()}.`,
    middle: `${topic} có vị ngọt tự nhiên, mọng nước và phù hợp cho cả gia đình. ${narratorCap} sẽ gợi ý cách chọn quả ngon ngay tại quầy.`,
    ending: `Cảm ơn bạn đã xem! Nếu thích ${topic}, ghé ${sceneLocation.toLowerCase()} để ${narrator} tư vấn thêm nhé!`,
  };
}

function normalizeToneKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function buildDefaultCharacterDescription(
  voiceType: "Nam" | "Nữ" | "Trung tính AI",
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
