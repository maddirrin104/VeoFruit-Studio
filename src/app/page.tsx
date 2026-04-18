"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOptimizationSection } from "@/components/sections/AiOptimizationSection";
import { ContentEditorSection } from "@/components/sections/ContentEditorSection";
import { PreviewPanel } from "@/components/sections/PreviewPanel";
import { RuntimeSettingsSection } from "@/components/sections/RuntimeSettingsSection";
import { StudioHeader } from "@/components/sections/StudioHeader";
import { VideoConfigSection } from "@/components/sections/VideoConfigSection";
import { DraftSection } from "@/components/sections/DraftSection";
import {
  getDefaultVoiceByGender,
  getVoiceGenderFromVoiceType,
  getVoiceLabel,
  type VoiceType,
} from "@/lib/voice-options";
import {
  createGeneration,
  createProject,
  getRuntimeSettings as fetchRuntimeSettings,
  generateVoicePreview,
  generateScript,
  getGeneration,
  saveRuntimeSettings,
  uploadSampleImage,
  updateProject,
  deleteProject,
  getProject,
  getProjects,
  type ProjectRecord,
  type RuntimeSettingsRecord,
} from "@/services/studio-api";

type GenerationState = "idle" | "pending" | "processing" | "completed" | "failed";

const CHARACTER_TYPES = [
  "Nữ tư vấn viên cửa hàng trái cây",
  "Nam tư vấn viên cửa hàng trái cây",
  "Chủ nông trại trái cây",
  "Chủ shop trái cây thân thiện",
  "Nhân viên siêu thị quầy trái cây",
  "Đầu bếp chia sẻ công thức trái cây",
  "Food reviewer trải nghiệm trái cây",
  "Mẹ bỉm chia sẻ bữa phụ cho bé",
  "MC giới thiệu sản phẩm tại quầy",
  "Nhân vật 3D hoạt hình",
  "Sinh viên làm vlog ẩm thực",
  "Khác (Tùy chọn)",
] as const;

const SCENE_LOCATIONS = [
  "Cửa hàng trái cây",
  "Quầy trái cây trong trung tâm thương mại",
  "Sạp trái cây ngoài chợ",
  "Nông trại trái cây",
  "Bếp gia đình",
] as const;

const CONTENT_TONES = [
  "Giới thiệu",
  "Hướng dẫn",
  "So sánh",
  "Lợi ích sức khỏe",
  "Viral",
  "Review",
  "Giáo dục",
  "Kể chuyện",
  "Hài hước",
  "Bán hàng nhẹ nhàng",
  "Livestream",
  "Khuyến mãi",
  "Chia sẻ mẹo chọn trái cây",
  "Phong cách đời thường",
  "Cảm hứng tích cực",
] as const;

const VIDEO_GENRES = [
  "Giới thiệu trái cây",
  "Giới thiệu trong cửa hàng",
  "Kể chuyện thương hiệu",
  "Quảng cáo theo mùa",
  "Review sản phẩm",
  "So sánh và tư vấn chọn mua",
  "Talkshow bán hàng",
  "Minigame tương tác",
  "Livestream demo",
  "Nấu ăn cùng trái cây",
  "Bí quyết bảo quản trái cây",
] as const;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeWebImageUrl(url?: string): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) {
    return undefined;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}

function buildDefaultCharacterDescription(
  voiceGender: "Nam" | "Nữ",
  characterType: string,
  sceneLocation: string
) {
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
    if (characterType.includes("Nữ") || voiceGender === "Nữ") {
      return `Nữ tư vấn viên cửa hàng trái cây tại ${sceneLocation}, tác phong chuyên nghiệp, giao tiếp thân thiện, am hiểu sản phẩm từng loại trái, tư vấn hợp lý về chất lượng, độ chín, giá cả và cách bảo quản.`;
    }
    return `Nam tư vấn viên cửa hàng trái cây tại ${sceneLocation}, phong thái điềm tĩnh, tư vấn rõ ràng, không khuyên nhưỡng, nhấn mạnh độ tươi, hương vị, upsize giá trị và cách bảo quản đúng cách.`;
  }

  if (characterType.includes("Nữ") || voiceGender === "Nữ") {
    return `Nữ tư vấn viên tại ${sceneLocation}, tác phong chuyên nghiệp, giao tiếp thân thiện, giới thiệu điểm nổi bật của từng loại trái cây, tư vấn chân thành.`;
  }

  if (characterType.includes("Nam") || voiceGender === "Nam") {
    return `Nam tư vấn viên tại ${sceneLocation}, phong thái điềm tĩnh, tư vấn rõ ràng, nhấn mạnh độ tươi, hương vị, chất lượng và cách bảo quản.`;
  }

  return `Nhân vật giới thiệu tại ${sceneLocation}, phong cách gần gũi, diễn đạt mạch lạc và tập trung vào thông tin hữu ích cho người mua.`;
}

function valueOrEmptyText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function valueOrDefaultNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function valueOrDefaultBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function getStringConfig(config: Record<string, unknown> | null | undefined, key: string): string {
  return valueOrEmptyText(config?.[key]);
}

function getNumberConfig(
  config: Record<string, unknown> | null | undefined,
  key: string,
  fallback: number
): number {
  return valueOrDefaultNumber(config?.[key], fallback);
}

function getBooleanConfig(
  config: Record<string, unknown> | null | undefined,
  key: string,
  fallback: boolean
): boolean {
  return valueOrDefaultBoolean(config?.[key], fallback);
}

function mapProjectToForm(project: ProjectRecord): typeof DEFAULT_FORM {
  const videoConfig = (project.videoConfig ?? null) as Record<string, unknown> | null;
  const imageConfig = (project.imageConfig ?? null) as Record<string, unknown> | null;
  const audioConfig = (project.audioConfig ?? null) as Record<string, unknown> | null;

  return {
    ...DEFAULT_FORM,
    title: project.title || DEFAULT_FORM.title,
    storyTopic: project.storyTopic || "",
    characterDescription: project.characterDescription || DEFAULT_FORM.characterDescription,
    script: project.script || "",
    contentTone: project.contentTone || DEFAULT_FORM.contentTone,
    videoGenre: project.videoGenre || DEFAULT_FORM.videoGenre,
    numberOfScenes: project.numberOfScenes || DEFAULT_FORM.numberOfScenes,
    resolution:
      (getStringConfig(videoConfig, "resolution") as typeof DEFAULT_FORM.resolution) ||
      DEFAULT_FORM.resolution,
    aiModel: getStringConfig(videoConfig, "aiModel") || DEFAULT_FORM.aiModel,
    aspectRatio:
      (getStringConfig(videoConfig, "aspectRatio") as typeof DEFAULT_FORM.aspectRatio) ||
      DEFAULT_FORM.aspectRatio,
    durationSeconds: getNumberConfig(videoConfig, "durationSeconds", DEFAULT_FORM.durationSeconds),
    emotionStyle: getStringConfig(imageConfig, "emotionStyle") || DEFAULT_FORM.emotionStyle,
    visualStyle: getStringConfig(imageConfig, "visualStyle") || DEFAULT_FORM.visualStyle,
    motionIntensity: getNumberConfig(imageConfig, "motionIntensity", DEFAULT_FORM.motionIntensity),
    transitionEnabled: getBooleanConfig(imageConfig, "transitionEnabled", DEFAULT_FORM.transitionEnabled),
    subjectConsistent: getBooleanConfig(imageConfig, "subjectConsistent", DEFAULT_FORM.subjectConsistent),
    narrationMode:
      (getStringConfig(audioConfig, "narrationMode") as typeof DEFAULT_FORM.narrationMode) ||
      DEFAULT_FORM.narrationMode,
    voiceType: (getStringConfig(audioConfig, "voiceGender") as VoiceType) || DEFAULT_FORM.voiceType,
    language: getStringConfig(audioConfig, "language") || DEFAULT_FORM.language,
    readSpeed: getNumberConfig(audioConfig, "readSpeed", DEFAULT_FORM.readSpeed),
    emotionIntensity: getNumberConfig(audioConfig, "emotionIntensity", DEFAULT_FORM.emotionIntensity),
    outputFormat:
      (getStringConfig(audioConfig, "outputFormat") as typeof DEFAULT_FORM.outputFormat) ||
      DEFAULT_FORM.outputFormat,
    bgMusicEnabled: getBooleanConfig(audioConfig, "bgMusicEnabled", DEFAULT_FORM.bgMusicEnabled),
  };
}

const DEFAULT_FORM = {
  title: "Dự án video trái cây",
  storyTopic: "",
  characterType: "Nữ tư vấn viên cửa hàng trái cây",
  sceneLocation: "Cửa hàng trái cây",
  characterDescription:
    "Nữ tư vấn viên tại cửa hàng trái cây, tác phong chuyên nghiệp, giao tiếp thân thiện, giới thiệu điểm nổi bật của từng loại trái cây.",
  script: "",
  contentTone: "Giới thiệu",
  videoGenre: "Giới thiệu trong cửa hàng",
  numberOfScenes: 3,
  resolution: "720p" as "720p" | "1080p",
  aiModel: "Veo 3.1 Fast",
  aspectRatio: "9:16" as "9:16" | "1:1" | "16:9" | "4:5",
  durationSeconds: 10,
  emotionStyle: "Vật tươi",
  visualStyle: "Cinematic",
  motionIntensity: 50,
  transitionEnabled: true,
  subjectConsistent: true,
  narrationMode: "separate_voiceover" as "script_read_along" | "separate_voiceover",
  voiceType: "banmai" as VoiceType,
  language: "Tiếng Việt",
  readSpeed: 50,
  emotionIntensity: 50,
  outputFormat: "mp3" as "mp3" | "wav",
  bgMusicEnabled: false,
};

const DEFAULT_RUNTIME_SETTINGS: RuntimeSettingsRecord = {
  databaseUrl: "",
  googleApiKey: "",
  runwayApiSecret: "",
  runwayApiBaseUrl: "https://api.dev.runwayml.com",
  runwayApiVersion: "2024-11-06",
  fptApiKey: "",
  fptTtsUrl: "https://api.fpt.ai/hmi/tts/v5",
  fptAudioWaitTimeoutMs: 45000,
  fptTtsJobRetries: 2,
  publicAppUrl: "",
};

function getCanvasSizeForAspectRatio(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case "16:9":
      return { width: 1920, height: 1080 };
    case "1:1":
      return { width: 1400, height: 1400 };
    case "4:5":
      return { width: 1350, height: 1688 };
    case "9:16":
    default:
      return { width: 1080, height: 1920 };
  }
}

async function loadImageSource(source: string): Promise<ImageBitmap | HTMLImageElement> {
  try {
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    if (typeof createImageBitmap === "function") {
      return await createImageBitmap(blob);
    }
  } catch {
    // Fall back to HTMLImageElement for cases like blob URLs or browser-specific fetch issues.
  }

  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Không thể tải ảnh: ${source}`));
    image.src = source;
  });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = x + (width - drawWidth) / 2;
  const offsetY = y + (height - drawHeight) / 2;
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function drawContainImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = x + (width - drawWidth) / 2;
  const offsetY = y + (height - drawHeight) / 2;
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

async function buildCompositeReferenceImageFile(
  productImageUrl: string,
  brandImageUrl: string,
  aspectRatio: string
): Promise<File> {
  let productImage: HTMLImageElement | ImageBitmap;
  let brandImage: HTMLImageElement | ImageBitmap;

  try {
    [productImage, brandImage] = await Promise.all([
      loadImageSource(productImageUrl),
      loadImageSource(brandImageUrl),
    ]);
  } catch (error) {
    const message = (error as Error)?.message || "Không thể tải ảnh để ghép composite.";
    throw new Error(`Không thể tải ảnh để ghép composite. ${message}`);
  }

  const { width, height } = getCanvasSizeForAspectRatio(aspectRatio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Trình duyệt không hỗ trợ tạo composite ảnh.");
  }

  drawCoverImage(context, brandImage, 0, 0, width, height);

  const overlayWidth = Math.round(width * 0.42);
  const overlayHeight = Math.round(height * 0.28);
  const overlayX = Math.round(width * 0.08);
  const overlayY = Math.round(height * 0.62);
  const radius = Math.round(Math.min(width, height) * 0.03);

  context.save();
  context.shadowColor = "rgba(0, 0, 0, 0.24)";
  context.shadowBlur = 26;
  context.shadowOffsetY = 12;
  context.fillStyle = "rgba(255, 255, 255, 0.92)";
  context.beginPath();
  context.moveTo(overlayX + radius, overlayY);
  context.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, radius);
  context.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, radius);
  context.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, radius);
  context.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, radius);
  context.closePath();
  context.fill();
  context.restore();

  const padding = Math.round(Math.min(width, height) * 0.02);
  drawContainImage(
    context,
    productImage,
    overlayX + padding,
    overlayY + padding,
    overlayWidth - padding * 2,
    overlayHeight - padding * 2
  );

  return await new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Không thể tạo file composite ảnh."));
        return;
      }

      resolve(new File([blob], `brand-product-composite-${Date.now()}.png`, { type: "image/png" }));
    }, "image/png");
  });
}

export default function HomePage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ProjectRecord[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState("Chưa lưu");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [previewVoiceUrl, setPreviewVoiceUrl] = useState<string | undefined>(undefined);
  const [sampleImageUrl, setSampleImageUrl] = useState<string | undefined>(undefined);
  const [sampleImageName, setSampleImageName] = useState<string | undefined>(undefined);
  const [uploadedSampleImageUrl, setUploadedSampleImageUrl] = useState<string | undefined>(
    undefined
  );
  const [brandImageUrl, setBrandImageUrl] = useState<string | undefined>(undefined);
  const [brandImageName, setBrandImageName] = useState<string | undefined>(undefined);
  const [uploadedBrandImageUrl, setUploadedBrandImageUrl] = useState<string | undefined>(
    undefined
  );
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | undefined>(undefined);
  const [isUploadingSampleImage, setIsUploadingSampleImage] = useState(false);
  const [isUploadingBrandImage, setIsUploadingBrandImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generationResultModal, setGenerationResultModal] = useState<
    { status: "completed" | "failed"; message: string } | null
  >(null);
  const [runtimeSettings, setRuntimeSettings] = useState<RuntimeSettingsRecord>(
    DEFAULT_RUNTIME_SETTINGS
  );
  const [settingsStoragePath, setSettingsStoragePath] = useState<string | undefined>(undefined);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const sampleImageUploadTokenRef = useRef(0);
  const brandImageUploadTokenRef = useRef(0);

  const updateForm = useCallback((partial: Partial<typeof DEFAULT_FORM>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateRuntimeSettings = useCallback((partial: Partial<RuntimeSettingsRecord>) => {
    setRuntimeSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const refreshDrafts = useCallback(async (preferredProjectId?: string | null) => {
    const items = await getProjects();
    setDrafts(items);

    if (preferredProjectId) {
      setProjectId(preferredProjectId);
      return;
    }

    if (!projectId && items[0]) {
      setProjectId(items[0].id);
    }
  }, [projectId]);

  const handleSaveRuntimeSettings = useCallback(async () => {
    setIsSavingSettings(true);
    setErrorMessage(null);

    try {
      const result = await saveRuntimeSettings(runtimeSettings);
      setRuntimeSettings(result.settings);
      setSettingsStoragePath(result.storagePath);
      setSuccessMessage("Đã lưu Settings API thành công. Các API mới sẽ dùng cấu hình này ngay.");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSavingSettings(false);
    }
  }, [runtimeSettings]);

  const ensureProject = useCallback(async (): Promise<string> => {
    if (projectId) {
      return projectId;
    }

    const created = await createProject({
      title: form.title,
      storyTopic: form.storyTopic,
      characterDescription: form.characterDescription,
      script: form.script,
      contentTone: form.contentTone,
      videoGenre: form.videoGenre,
      numberOfScenes: form.numberOfScenes,
      videoConfig: {
        resolution: form.resolution,
        aiModel: form.aiModel,
        aspectRatio: form.aspectRatio,
        durationSeconds: form.durationSeconds,
      },
      imageConfig: {
        emotionStyle: form.emotionStyle,
        visualStyle: form.visualStyle,
        motionIntensity: form.motionIntensity,
        transitionEnabled: form.transitionEnabled,
        subjectConsistent: form.subjectConsistent,
      },
      audioConfig: {
        narrationMode: form.narrationMode,
        voiceGender: form.voiceType,
        language: form.language,
        readSpeed: form.readSpeed,
        emotionIntensity: form.emotionIntensity,
        outputFormat: form.outputFormat,
        bgMusicEnabled: form.bgMusicEnabled,
      },
    });

    setProjectId(created.id);
    return created.id;
  }, [
    form.aiModel,
    form.aspectRatio,
    form.bgMusicEnabled,
    form.characterDescription,
    form.contentTone,
    form.durationSeconds,
    form.emotionIntensity,
    form.emotionStyle,
    form.language,
    form.motionIntensity,
    form.narrationMode,
    form.numberOfScenes,
    form.outputFormat,
    form.readSpeed,
    form.resolution,
    form.script,
    form.storyTopic,
    form.subjectConsistent,
    form.title,
    form.transitionEnabled,
    form.videoGenre,
    form.visualStyle,
    form.voiceType,
    projectId,
  ]);

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const created = await createProject({
        title: form.title,
        storyTopic: form.storyTopic,
        characterDescription: form.characterDescription,
        script: form.script,
        contentTone: form.contentTone,
        videoGenre: form.videoGenre,
        numberOfScenes: form.numberOfScenes,
        videoConfig: {
          resolution: form.resolution,
          aiModel: form.aiModel,
          aspectRatio: form.aspectRatio,
          durationSeconds: form.durationSeconds,
        },
        imageConfig: {
          emotionStyle: form.emotionStyle,
          visualStyle: form.visualStyle,
          motionIntensity: form.motionIntensity,
          transitionEnabled: form.transitionEnabled,
          subjectConsistent: form.subjectConsistent,
        },
        audioConfig: {
          narrationMode: form.narrationMode,
          voiceGender: form.voiceType,
          language: form.language,
          readSpeed: form.readSpeed,
          emotionIntensity: form.emotionIntensity,
          outputFormat: form.outputFormat,
          bgMusicEnabled: form.bgMusicEnabled,
        },
      });

      await refreshDrafts(created.id);

      const time = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastSavedLabel(`Đã lưu nháp: ${created.title} · lúc ${time}`);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }, [form, refreshDrafts]);

  const handleGenerateScript = useCallback(async () => {
    if (!form.storyTopic.trim()) {
      setErrorMessage("Vui lòng chọn trái cây trước khi AI tạo kịch bản.");
      return;
    }

    setIsGeneratingScript(true);
    setErrorMessage(null);

    try {
      const effectiveReferenceImageUrl = uploadedSampleImageUrl ?? referenceImageUrl;
      const effectiveReferenceImageSource = uploadedSampleImageUrl
        ? "upload"
        : referenceImageUrl
        ? "url"
        : undefined;
      const effectiveBrandBackgroundImageUrl = uploadedBrandImageUrl;
      const effectiveBrandBackgroundImageSource = uploadedBrandImageUrl ? "upload" : undefined;

      const result = await generateScript({
        topic: form.storyTopic,
        characterDescription: form.characterDescription,
        characterType: form.characterType,
        sceneLocation: form.sceneLocation,
        voiceType: getVoiceGenderFromVoiceType(form.voiceType),
        videoGenre: form.videoGenre,
        contentTone: form.contentTone,
        numberOfScenes: form.numberOfScenes,
        referenceImageUrl: effectiveReferenceImageUrl,
        referenceImageName: sampleImageName,
        referenceImageSource: effectiveReferenceImageSource,
        brandBackgroundImageUrl: effectiveBrandBackgroundImageUrl,
        brandBackgroundImageName: brandImageName,
        brandBackgroundImageSource: effectiveBrandBackgroundImageSource,
      });

      updateForm({ script: result.script });
      if (result.warning) {
        setSuccessMessage(result.warning);
      } else if (result.source === "gemini") {
        setSuccessMessage("Đã tạo kịch bản bằng Gemini thành công.");
      } else {
        setSuccessMessage("Đã tạo kịch bản dự phòng do Gemini tạm thời chưa phản hồi ổn định.");
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSuccessMessage(null);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [
    form.characterDescription,
    form.characterType,
    form.contentTone,
    form.numberOfScenes,
    brandImageName,
    uploadedBrandImageUrl,
    referenceImageUrl,
    sampleImageName,
    uploadedSampleImageUrl,
    form.sceneLocation,
    form.storyTopic,
    form.videoGenre,
    form.voiceType,
    updateForm,
  ]);

  const handleRandomizeScript = useCallback(async () => {
    if (!form.storyTopic.trim()) {
      setErrorMessage("Vui lòng chọn trái cây trước khi random kịch bản.");
      return;
    }

    const randomCharacterType = pickRandom(CHARACTER_TYPES);
    const randomSceneLocation = pickRandom(SCENE_LOCATIONS);
    const randomContentTone = pickRandom(CONTENT_TONES);
    const randomGenre = pickRandom(VIDEO_GENRES);
    const randomScenes = pickRandom([3, 4, 5, 6] as const);

    const nextVoiceGender =
      randomCharacterType.includes("Nữ")
        ? "Nữ"
        : randomCharacterType.includes("Nam")
        ? "Nam"
        : getVoiceGenderFromVoiceType(form.voiceType);

    const nextVoiceType = getDefaultVoiceByGender(nextVoiceGender);

    const randomCharacterDescription = buildDefaultCharacterDescription(
      nextVoiceGender,
      randomCharacterType,
      randomSceneLocation
    );

    updateForm({
      characterType: randomCharacterType,
      sceneLocation: randomSceneLocation,
      contentTone: randomContentTone,
      videoGenre: randomGenre,
      numberOfScenes: randomScenes,
      voiceType: nextVoiceType,
      characterDescription: randomCharacterDescription,
    });

    setIsGeneratingScript(true);
    setErrorMessage(null);

    try {
      const effectiveReferenceImageUrl = uploadedSampleImageUrl ?? referenceImageUrl;
      const effectiveReferenceImageSource = uploadedSampleImageUrl
        ? "upload"
        : referenceImageUrl
        ? "url"
        : undefined;
      const effectiveBrandBackgroundImageUrl = uploadedBrandImageUrl;
      const effectiveBrandBackgroundImageSource = uploadedBrandImageUrl ? "upload" : undefined;

      const result = await generateScript({
        topic: form.storyTopic,
        characterDescription: randomCharacterDescription,
        characterType: randomCharacterType,
        sceneLocation: randomSceneLocation,
        voiceType: nextVoiceGender,
        videoGenre: randomGenre,
        contentTone: randomContentTone,
        numberOfScenes: randomScenes,
        referenceImageUrl: effectiveReferenceImageUrl,
        referenceImageName: sampleImageName,
        referenceImageSource: effectiveReferenceImageSource,
        brandBackgroundImageUrl: effectiveBrandBackgroundImageUrl,
        brandBackgroundImageName: brandImageName,
        brandBackgroundImageSource: effectiveBrandBackgroundImageSource,
      });

      updateForm({ script: result.script });
      if (result.warning) {
        setSuccessMessage(result.warning);
      } else if (result.source === "gemini") {
        setSuccessMessage("Đã random và tạo kịch bản bằng Gemini thành công.");
      } else {
        setSuccessMessage("Đã random kịch bản dự phòng do Gemini tạm thời chưa phản hồi ổn định.");
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSuccessMessage(null);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [
    brandImageName,
    uploadedBrandImageUrl,
    form.storyTopic,
    form.voiceType,
    referenceImageUrl,
    sampleImageName,
    updateForm,
    uploadedSampleImageUrl,
  ]);

  const handleGenerateVideo = useCallback(async () => {
    setIsGeneratingVideo(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setGenerationResultModal(null);

    try {
      const pid = await ensureProject();

      if (!form.storyTopic.trim()) {
        throw new Error("Vui lòng nhập chủ đề trước khi tạo video.");
      }

      if (!form.script.trim()) {
        throw new Error("Vui lòng nhập hoặc tạo kịch bản trước khi tạo video.");
      }

      if (isUploadingSampleImage) {
        throw new Error("Ảnh mẫu đang được tải lên. Vui lòng đợi trong giây lát.");
      }

      const hasManualReferenceUrl = Boolean(referenceImageUrl?.trim());
      const webReferenceImageUrl = normalizeWebImageUrl(referenceImageUrl);
      if (hasManualReferenceUrl && !webReferenceImageUrl) {
        throw new Error("URL ảnh phải bắt đầu bằng http:// hoặc https://.");
      }

      const uploadedWebImageUrl = normalizeWebImageUrl(uploadedSampleImageUrl);
      const effectiveReferenceImageUrl = webReferenceImageUrl ?? uploadedWebImageUrl;
      const referenceImageSource = webReferenceImageUrl
        ? "url"
        : uploadedWebImageUrl
        ? "upload"
        : undefined;

      let compositeReferenceImageUrl = effectiveReferenceImageUrl;
      let compositeReferenceImageName = sampleImageName;
      if (sampleImageUrl && brandImageUrl) {
        try {
          // Use local preview sources to avoid ngrok/CORS fetch issues during browser-side compositing.
          const compositeFile = await buildCompositeReferenceImageFile(
            sampleImageUrl,
            brandImageUrl,
            form.aspectRatio
          );
          const compositeUpload = await uploadSampleImage(compositeFile);
          compositeReferenceImageUrl = compositeUpload.absoluteUrl;
          compositeReferenceImageName = compositeUpload.fileName;
        } catch (compositeError) {
          console.warn("[Composite] Failed to build composite reference image. Falling back to product image.", compositeError);
        }
      }

      await updateProject(pid, {
        title: form.title,
        storyTopic: form.storyTopic,
        characterDescription: form.characterDescription,
        script: form.script,
        contentTone: form.contentTone,
        videoGenre: form.videoGenre,
        numberOfScenes: form.numberOfScenes,
        videoConfig: {
          resolution: form.resolution,
          aiModel: form.aiModel,
          aspectRatio: form.aspectRatio,
          durationSeconds: form.durationSeconds,
        },
        imageConfig: {
          emotionStyle: form.emotionStyle,
          visualStyle: form.visualStyle,
          motionIntensity: form.motionIntensity,
          transitionEnabled: form.transitionEnabled,
          subjectConsistent: form.subjectConsistent,
        },
        audioConfig: {
          narrationMode: form.narrationMode,
          voiceGender: form.voiceType,
          language: form.language,
          readSpeed: form.readSpeed,
          emotionIntensity: form.emotionIntensity,
          outputFormat: form.outputFormat,
          bgMusicEnabled: form.bgMusicEnabled,
        },
      });

      const generation = await createGeneration({
        projectId: pid,
        storyTopic: form.storyTopic,
        script: form.script,
        characterDescription: form.characterDescription,
        characterType: form.characterType,
        contentTone: form.contentTone,
        videoGenre: form.videoGenre,
        sceneLocation: form.sceneLocation,
        numberOfScenes: form.numberOfScenes,
        videoConfig: {
          resolution: form.resolution,
          aiModel: form.aiModel,
          aspectRatio: form.aspectRatio,
          durationSeconds: form.durationSeconds,
        },
        imageConfig: {
          emotionStyle: form.emotionStyle,
          visualStyle: form.visualStyle,
          motionIntensity: form.motionIntensity,
          transitionEnabled: form.transitionEnabled,
          subjectConsistent: form.subjectConsistent,
          referenceImageUrl: compositeReferenceImageUrl,
          referenceImageName: compositeReferenceImageName,
          referenceImageSource,
          productReferenceImageUrl: uploadedSampleImageUrl,
          productReferenceImageName: sampleImageName,
          productReferenceImageSource: uploadedSampleImageUrl ? "upload" : undefined,
          brandBackgroundImageUrl: uploadedBrandImageUrl,
          brandBackgroundImageName: brandImageName,
          brandBackgroundImageSource: uploadedBrandImageUrl ? "upload" : undefined,
        },
        audioConfig: {
          narrationMode: form.narrationMode,
          voiceGender: form.voiceType,
          language: form.language,
          readSpeed: form.readSpeed,
          emotionIntensity: form.emotionIntensity,
          outputFormat: form.outputFormat,
          bgMusicEnabled: form.bgMusicEnabled,
        },
      });

      setGenerationId(generation.id);
      setGenerationStatus(generation.status as GenerationState);
      setVideoUrl(undefined);
      setAudioUrl(undefined);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setSuccessMessage(null);
      setIsGeneratingVideo(false);
    }
  }, [
    ensureProject,
    form,
    brandImageName,
    brandImageUrl,
    uploadedBrandImageUrl,
    isUploadingSampleImage,
    sampleImageUrl,
    sampleImageName,
    referenceImageUrl,
    uploadedSampleImageUrl,
  ]);

  const handlePreviewVoice = useCallback(async (voiceToPreview?: VoiceType) => {
    setIsPreviewingVoice(true);
    setErrorMessage(null);

    try {
      const effectiveVoiceType = voiceToPreview ?? form.voiceType;
      if (voiceToPreview && voiceToPreview !== form.voiceType) {
        updateForm({ voiceType: voiceToPreview });
      }

      const result = await generateVoicePreview({
        script: form.script,
        storyTopic: form.storyTopic,
        audioConfig: {
          voiceGender: effectiveVoiceType,
          language: form.language,
          readSpeed: form.readSpeed,
          emotionIntensity: form.emotionIntensity,
          outputFormat: form.outputFormat,
        },
      });

      setPreviewVoiceUrl(result.audioUrl);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsPreviewingVoice(false);
    }
  }, [
    form.emotionIntensity,
    form.language,
    form.outputFormat,
    form.readSpeed,
    form.script,
    form.storyTopic,
    form.voiceType,
    updateForm,
  ]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchRuntimeSettings();
        if (cancelled) {
          return;
        }

        setRuntimeSettings(data.settings);
        setSettingsStoragePath(data.storagePath);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage((error as Error).message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSettings(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await refreshDrafts();
      } catch (error) {
        if (!cancelled) {
          setErrorMessage((error as Error).message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshDrafts]);

  useEffect(() => {
    if (!generationId) {
      return;
    }

    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const statusData = await getGeneration(generationId);
        if (cancelled) {
          return;
        }

        const status = statusData.status as GenerationState;
        setGenerationStatus(status);
        setVideoUrl(statusData.videoUrl);
        setAudioUrl(statusData.audioUrl);

        if (status === "failed") {
          const failedMessage =
            statusData.errorMessage ||
            "Tạo video thất bại. Vui lòng kiểm tra quota API và thử lại.";
          setErrorMessage(failedMessage);
          setSuccessMessage(null);
          setGenerationResultModal({
            status: "failed",
            message: failedMessage,
          });
        }

        if (status === "completed") {
          const completedMessage =
            "Tạo video thành công. Bạn có thể xem trước hoặc tải video ngay.";
          setSuccessMessage(completedMessage);
          setGenerationResultModal({
            status: "completed",
            message: completedMessage,
          });
        }

        if (status === "completed" || status === "failed") {
          setIsGeneratingVideo(false);
          clearInterval(timer);
        }
      } catch {
        if (!cancelled) {
          setGenerationStatus("failed");
          setIsGeneratingVideo(false);
        }
        clearInterval(timer);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [generationId]);

  const previewStatus = useMemo<GenerationState>(() => generationStatus, [generationStatus]);

  const handleLoadDraft = useCallback(async (draftId: string) => {
    try {
      const draft = await getProject(draftId);
      setForm(mapProjectToForm(draft));
      setProjectId(draft.id);
      setGenerationId(null);
      setGenerationStatus("idle");
      setVideoUrl(undefined);
      setAudioUrl(undefined);
      setPreviewVoiceUrl(undefined);
      setSuccessMessage(`Đã nạp nháp: ${draft.title}`);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, []);

  const handleRenameDraft = useCallback(async (draftId: string) => {
    const targetDraft = drafts.find((draft) => draft.id === draftId);
    const nextTitle = window.prompt("Nhập tên mới cho nháp:", targetDraft?.title ?? form.title);

    if (!nextTitle) {
      return;
    }

    try {
      const renamed = await updateProject(draftId, {
        title: nextTitle,
      });

      await refreshDrafts(projectId);

      if (projectId === draftId) {
        setForm((prev) => ({ ...prev, title: renamed.title }));
      }

      setSuccessMessage(`Đã đổi tên nháp thành “${renamed.title}”.`);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, [drafts, form.title, projectId, refreshDrafts]);

  const handleDeleteDraft = useCallback(async (draftId: string) => {
    const targetDraft = drafts.find((draft) => draft.id === draftId);
    const confirmed = window.confirm(
      `Xóa nháp “${targetDraft?.title ?? "không tên"}”? Hành động này không thể hoàn tác.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(draftId);
      const remaining = drafts.filter((draft) => draft.id !== draftId);
      setDrafts(remaining);

      if (projectId === draftId) {
        const nextDraft = remaining[0];
        if (nextDraft) {
          const reloaded = await getProject(nextDraft.id);
          setForm(mapProjectToForm(reloaded));
          setProjectId(reloaded.id);
        } else {
          setProjectId(null);
        }
      }

      setSuccessMessage("Đã xóa nháp thành công.");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }, [drafts, projectId]);
  const handleSampleImageChange = useCallback(async (file: File | null) => {
    setSampleImageName(file?.name);
    setErrorMessage(null);

    setSampleImageUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return file ? URL.createObjectURL(file) : undefined;
    });

    if (!file) {
      sampleImageUploadTokenRef.current += 1;
      setUploadedSampleImageUrl(undefined);
      setIsUploadingSampleImage(false);
      return;
    }

    const uploadToken = sampleImageUploadTokenRef.current + 1;
    sampleImageUploadTokenRef.current = uploadToken;
    setIsUploadingSampleImage(true);

    try {
      const uploadResult = await uploadSampleImage(file);
      if (sampleImageUploadTokenRef.current !== uploadToken) {
        return;
      }

      setUploadedSampleImageUrl(uploadResult.absoluteUrl);
    } catch (error) {
      if (sampleImageUploadTokenRef.current !== uploadToken) {
        return;
      }

      setUploadedSampleImageUrl(undefined);
      setErrorMessage((error as Error).message);
    } finally {
      if (sampleImageUploadTokenRef.current === uploadToken) {
        setIsUploadingSampleImage(false);
      }
    }
  }, []);

  const handleBrandImageChange = useCallback(async (file: File | null) => {
    setBrandImageName(file?.name);
    setErrorMessage(null);

    setBrandImageUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return file ? URL.createObjectURL(file) : undefined;
    });

    if (!file) {
      brandImageUploadTokenRef.current += 1;
      setUploadedBrandImageUrl(undefined);
      setIsUploadingBrandImage(false);
      return;
    }

    const uploadToken = brandImageUploadTokenRef.current + 1;
    brandImageUploadTokenRef.current = uploadToken;
    setIsUploadingBrandImage(true);

    try {
      const uploadResult = await uploadSampleImage(file);
      if (brandImageUploadTokenRef.current !== uploadToken) {
        return;
      }

      setUploadedBrandImageUrl(uploadResult.absoluteUrl);
    } catch (error) {
      if (brandImageUploadTokenRef.current !== uploadToken) {
        return;
      }

      setUploadedBrandImageUrl(undefined);
      setErrorMessage((error as Error).message);
    } finally {
      if (brandImageUploadTokenRef.current === uploadToken) {
        setIsUploadingBrandImage(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (sampleImageUrl) {
        URL.revokeObjectURL(sampleImageUrl);
      }
    };
  }, [sampleImageUrl]);

  useEffect(() => {
    return () => {
      if (brandImageUrl) {
        URL.revokeObjectURL(brandImageUrl);
      }
    };
  }, [brandImageUrl]);

  const handleReferenceImageUrlChange = useCallback((url: string) => {
    setReferenceImageUrl(url.trim() || undefined);
  }, []);

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setGenerationId(null);
    setGenerationStatus("idle");
    setVideoUrl(undefined);
    setAudioUrl(undefined);
    setPreviewVoiceUrl(undefined);
    sampleImageUploadTokenRef.current += 1;
    brandImageUploadTokenRef.current += 1;
    setIsUploadingSampleImage(false);
    setIsUploadingBrandImage(false);
    setUploadedSampleImageUrl(undefined);
    setUploadedBrandImageUrl(undefined);
    setReferenceImageUrl(undefined);
    setSampleImageName(undefined);
    setBrandImageName(undefined);
    setSampleImageUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return undefined;
    });
    setBrandImageUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return undefined;
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setGenerationResultModal(null);
  }, []);

  return (
    <main className="studio-bg relative isolate min-h-screen overflow-x-clip px-3 py-7 md:px-5 lg:px-6">
      <div className="pointer-events-none absolute left-[18%] top-8 h-28 w-28 rounded-full bg-[#c9ecd8]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[28%] h-36 w-36 rounded-full bg-[#bde9d0]/60 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="reveal-up [animation-delay:80ms]">
          <StudioHeader />
        </div>

        <div className="mb-5 reveal-up [animation-delay:120ms]">
          <RuntimeSettingsSection
            settings={runtimeSettings}
            storagePath={settingsStoragePath}
            isLoading={isLoadingSettings}
            isSaving={isSavingSettings}
            onChange={updateRuntimeSettings}
            onSave={handleSaveRuntimeSettings}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="reveal-up [animation-delay:140ms]">
              <ContentEditorSection
                storyTopic={form.storyTopic}
                characterDescription={form.characterDescription}
                characterType={form.characterType}
                sceneLocation={form.sceneLocation}
                script={form.script}
                contentTone={form.contentTone}
                videoGenre={form.videoGenre}
                numberOfScenes={form.numberOfScenes}
                isGeneratingScript={isGeneratingScript}
                onStoryTopicChange={(value) => updateForm({ storyTopic: value })}
                onCharacterDescriptionChange={(value) => updateForm({ characterDescription: value })}
                onCharacterTypeChange={(value) => {
                  const voiceGender = getVoiceGenderFromVoiceType(form.voiceType);
                  updateForm({
                    characterType: value,
                    characterDescription: buildDefaultCharacterDescription(
                      value.includes("Nữ")
                        ? "Nữ"
                        : value.includes("Nam")
                        ? "Nam"
                        : voiceGender,
                      value,
                      form.sceneLocation
                    ),
                  });
                }}
                onSceneLocationChange={(value) => {
                  const voiceGender = getVoiceGenderFromVoiceType(form.voiceType);
                  updateForm({
                    sceneLocation: value,
                    characterDescription: buildDefaultCharacterDescription(
                      form.characterType.includes("Nữ")
                        ? "Nữ"
                        : form.characterType.includes("Nam")
                        ? "Nam"
                        : voiceGender,
                      form.characterType,
                      value
                    ),
                  });
                }}
                onScriptChange={(value) => updateForm({ script: value })}
                onContentToneChange={(value) => updateForm({ contentTone: value })}
                onVideoGenreChange={(value) => updateForm({ videoGenre: value })}
                onNumberOfScenesChange={(value) => updateForm({ numberOfScenes: value })}
                onGenerateScript={handleGenerateScript}
                onRandomizeScript={handleRandomizeScript}
              />
            </div>
            <div className="reveal-up [animation-delay:190ms]">
              <VideoConfigSection
                resolution={form.resolution}
                aiModel={form.aiModel}
                aspectRatio={form.aspectRatio}
                durationSeconds={form.durationSeconds}
                onResolutionChange={(value) => updateForm({ resolution: value })}
                onAspectRatioChange={(value) => updateForm({ aspectRatio: value })}
                onDurationSecondsChange={(value) => updateForm({ durationSeconds: value })}
              />
            </div>
            <div className="reveal-up [animation-delay:240ms]">
              <AiOptimizationSection
                emotionStyle={form.emotionStyle}
                visualStyle={form.visualStyle}
                motionIntensity={form.motionIntensity}
                transitionEnabled={form.transitionEnabled}
                subjectConsistent={form.subjectConsistent}
                narrationMode={form.narrationMode}
                voiceType={form.voiceType}
                language={form.language}
                readSpeed={form.readSpeed}
                emotionIntensity={form.emotionIntensity}
                outputFormat={form.outputFormat}
                bgMusicEnabled={form.bgMusicEnabled}
                isPreviewingVoice={isPreviewingVoice}
                previewVoiceUrl={previewVoiceUrl}
                isGeneratingVideo={isGeneratingVideo}
                onEmotionStyleChange={(value) => updateForm({ emotionStyle: value })}
                onVisualStyleChange={(value) => updateForm({ visualStyle: value })}
                onMotionIntensityChange={(value) => updateForm({ motionIntensity: value })}
                onTransitionEnabledChange={(value) => updateForm({ transitionEnabled: value })}
                onSubjectConsistentChange={(value) => updateForm({ subjectConsistent: value })}
                onNarrationModeChange={(value) => updateForm({ narrationMode: value })}
                onVoiceTypeChange={(value) =>
                  updateForm({
                    voiceType: value,
                    ...(form.characterDescription.trim()
                      ? {}
                      : {
                          characterDescription: buildDefaultCharacterDescription(
                            getVoiceGenderFromVoiceType(value),
                            form.characterType,
                            form.sceneLocation
                          ),
                        }),
                  })
                }
                onLanguageChange={(value) => updateForm({ language: value })}
                onReadSpeedChange={(value) => updateForm({ readSpeed: value })}
                onEmotionIntensityChange={(value) => updateForm({ emotionIntensity: value })}
                onOutputFormatChange={(value) => updateForm({ outputFormat: value })}
                onBgMusicEnabledChange={(value) => updateForm({ bgMusicEnabled: value })}
                onPreviewVoice={handlePreviewVoice}
                onReset={handleReset}
                onGenerateVideo={handleGenerateVideo}
              />
            </div>
              <div className="reveal-up [animation-delay:280ms]">
                <DraftSection
                  isSaving={isSaving}
                  lastSavedLabel={lastSavedLabel}
                  drafts={drafts}
                  currentDraftId={projectId}
                  onSaveDraft={handleSaveDraft}
                  onLoadDraft={handleLoadDraft}
                  onRenameDraft={handleRenameDraft}
                  onDeleteDraft={handleDeleteDraft}
                />
              </div>
              {errorMessage ? (
                <p className="rounded-xl border border-[#f2bfbf] bg-[#fff1f1] px-4 py-3 text-sm text-[#b12b2b]">
                  {errorMessage}
                </p>
              ) : null}
              {successMessage && !errorMessage ? (
                <div className="flex items-start gap-2 rounded-xl border border-[#9fdab9] bg-[#eff9f3] px-4 py-3 text-sm text-[#1b6e48]">
                  <span className="mt-0.5 inline-block h-2.5 w-2.5 rounded-full bg-[#10b862]" />
                  <div className="flex-1">{successMessage}</div>
                  <button
                    type="button"
                    onClick={() => setSuccessMessage(null)}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-[#2a7a55] transition hover:bg-[#dff2e7]"
                  >
                    Đóng
                  </button>
                </div>
              ) : null}

              {generationResultModal ? (
                <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#0f2a1d]/28 px-4 backdrop-blur-[1px]">
                  <div className="w-full max-w-md rounded-2xl border border-[#b9e6ce] bg-[#f3fbf7] p-5 shadow-[0_20px_50px_rgba(27,79,55,0.26)] md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#3f7a5f]">
                      Kết quả tạo video
                    </p>
                    <h3
                      className={`mt-1 text-xl font-bold md:text-2xl ${
                        generationResultModal.status === "completed"
                          ? "text-[#0f8f4e]"
                          : "text-[#b12b2b]"
                      }`}
                    >
                      {generationResultModal.status === "completed"
                        ? "Tạo video thành công"
                        : "Tạo video thất bại"}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#365f4c] md:text-base">
                      {generationResultModal.message}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                      {generationResultModal.status === "completed" && videoUrl ? (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#9fdab9] bg-white px-4 text-sm font-semibold text-[#1f734d] transition hover:border-[#73c99d]"
                        >
                          Mở video
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => setGenerationResultModal(null)}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0db461] px-4 text-sm font-semibold text-white transition hover:bg-[#0aa757]"
                      >
                        Đã hiểu
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
          </div>

          <div className="reveal-up [animation-delay:170ms]">
            <PreviewPanel
              aiModel={form.aiModel}
              resolution={form.resolution}
              aspectRatio={form.aspectRatio}
              durationSeconds={form.durationSeconds}
              voiceType={getVoiceLabel(form.voiceType)}
              visualStyle={form.visualStyle}
              sampleImageUrl={sampleImageUrl}
              sampleImageName={sampleImageName}
              onSampleImageChange={handleSampleImageChange}
              isSampleImageUploading={isUploadingSampleImage}
              sampleImageReady={Boolean(uploadedSampleImageUrl)}
              brandImageUrl={brandImageUrl}
              brandImageName={brandImageName}
              onBrandImageChange={handleBrandImageChange}
              isBrandImageUploading={isUploadingBrandImage}
              brandImageReady={Boolean(uploadedBrandImageUrl)}
              referenceImageUrl={referenceImageUrl}
              onReferenceImageUrlChange={handleReferenceImageUrlChange}
              generationStatus={previewStatus}
              videoUrl={videoUrl}
              audioUrl={audioUrl}
              generationId={generationId ?? undefined}
            />
          </div>
        </div>
      </div>
    </main>
  );
}