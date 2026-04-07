"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOptimizationSection } from "@/components/sections/AiOptimizationSection";
import { ContentEditorSection } from "@/components/sections/ContentEditorSection";
import { PreviewPanel } from "@/components/sections/PreviewPanel";
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
  generateVoicePreview,
  generateScript,
  getGeneration,
  uploadSampleImage,
  updateProject,
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

  if (characterType.includes("nông trại") || characterType.includes("Nông trại")) {
    return `Chủ nông trại tại ${sceneLocation}, am hiểu mùa vụ, chia sẻ chân thật quy trình chăm trái từ vườn đến tay khách, giọng nói gần gũi và đáng tin.`;
  }

  if (characterType.includes("Nhân viên siêu thị")) {
    return `Nhân viên quầy trái cây tại ${sceneLocation}, tác phong chỉn chu, hướng dẫn nhanh tiêu chí chọn trái tươi và gợi ý cách bảo quản tiện lợi sau khi mua.`;
  }

  if (characterType.includes("MC")) {
    return `MC tại ${sceneLocation}, giọng nói rõ ràng, chuyên nghiệp, truyền tải thông tin mạch lạc và dễ theo dõi.`;
  }

  if (characterType.includes("Nữ") || voiceGender === "Nữ") {
    return `Nữ tư vấn viên tại ${sceneLocation}, tác phong chuyên nghiệp, giao tiếp thân thiện, giới thiệu điểm nổi bật của từng loại trái cây.`;
  }

  if (characterType.includes("Nam") || voiceGender === "Nam") {
    return `Nam tư vấn viên tại ${sceneLocation}, phong thái điềm tĩnh, tư vấn rõ ràng, nhấn mạnh độ tươi, hương vị và cách bảo quản.`;
  }

  return `Nhân vật giới thiệu tại ${sceneLocation}, phong cách gần gũi, diễn đạt mạch lạc và tập trung vào thông tin hữu ích cho người mua.`;
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

export default function HomePage() {
  const [projectId, setProjectId] = useState<string | null>(null);
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
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | undefined>(undefined);
  const [isUploadingSampleImage, setIsUploadingSampleImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const sampleImageUploadTokenRef = useRef(0);

  const updateForm = useCallback((partial: Partial<typeof DEFAULT_FORM>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const ensureProject = useCallback(async (): Promise<string> => {
    if (projectId) {
      return projectId;
    }

    const created = await createProject({
      title: form.title,
      storyTopic: form.storyTopic,
      videoGenre: form.videoGenre,
      numberOfScenes: form.numberOfScenes,
    });

    setProjectId(created.id);
    return created.id;
  }, [form.numberOfScenes, form.storyTopic, form.title, form.videoGenre, projectId]);

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const pid = await ensureProject();

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

      const time = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastSavedLabel(`Lúc ${time}`);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }, [ensureProject, form]);

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
      });

      updateForm({ script: result.script });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [
    form.characterDescription,
    form.characterType,
    form.contentTone,
    form.numberOfScenes,
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
      });

      updateForm({ script: result.script });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [
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

      await updateProject(pid, {
        title: form.title,
        storyTopic: form.storyTopic,
        characterDescription: form.characterDescription,
        script: form.script,
        contentTone: form.contentTone,
        videoGenre: form.videoGenre,
        numberOfScenes: form.numberOfScenes,
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
          referenceImageUrl: effectiveReferenceImageUrl,
          referenceImageName: sampleImageName,
          referenceImageSource,
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
    isUploadingSampleImage,
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
          setErrorMessage(
            statusData.errorMessage ||
              "Tạo video thất bại. Vui lòng kiểm tra quota API và thử lại."
          );
          setSuccessMessage(null);
        }

        if (status === "completed") {
          setSuccessMessage("Tạo video thành công. Bạn có thể xem trước hoặc tải video ngay.");
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

  useEffect(() => {
    return () => {
      if (sampleImageUrl) {
        URL.revokeObjectURL(sampleImageUrl);
      }
    };
  }, [sampleImageUrl]);

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
    setIsUploadingSampleImage(false);
    setUploadedSampleImageUrl(undefined);
    setReferenceImageUrl(undefined);
    setSampleImageName(undefined);
    setSampleImageUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return undefined;
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  return (
    <main className="studio-bg relative isolate min-h-screen overflow-x-clip px-3 py-7 md:px-5 lg:px-6">
      <div className="pointer-events-none absolute left-[18%] top-8 h-28 w-28 rounded-full bg-[#c9ecd8]/70 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[28%] h-36 w-36 rounded-full bg-[#bde9d0]/60 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="reveal-up [animation-delay:80ms]">
          <StudioHeader />
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
                  onSaveDraft={handleSaveDraft}
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