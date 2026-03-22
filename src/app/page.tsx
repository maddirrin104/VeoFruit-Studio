"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AiOptimizationSection } from "@/components/sections/AiOptimizationSection";
import { ContentEditorSection } from "@/components/sections/ContentEditorSection";
import { PreviewPanel } from "@/components/sections/PreviewPanel";
import { StudioHeader } from "@/components/sections/StudioHeader";
import { VideoConfigSection } from "@/components/sections/VideoConfigSection";
import { DraftSection } from "@/components/sections/DraftSection";
import {
  createGeneration,
  createProject,
  generateScript,
  getGeneration,
  updateProject,
} from "@/services/studio-api";

type GenerationState = "idle" | "pending" | "processing" | "completed" | "failed";

const DEFAULT_FORM = {
  title: "Dự án video trái cây",
  storyTopic: "",
  characterDescription: "",
  script: "",
  contentTone: "Giới thiệu",
  videoGenre: "Giới thiệu trái cây",
  numberOfScenes: 3,
  resolution: "720p" as "720p" | "1080p",
  aiModel: "Veo 3.1 Fast",
  aspectRatio: "9:16" as "9:16" | "1:1" | "16:9" | "4:5",
  durationSeconds: 15,
  emotionStyle: "Vật tươi",
  visualStyle: "Cinematic",
  motionIntensity: 50,
  transitionEnabled: true,
  subjectConsistent: true,
  voiceType: "Nam" as "Nam" | "Nữ" | "Trung tính AI",
  language: "Tiếng Việt",
  readSpeed: 50,
  bgMusicEnabled: false,
};

export default function HomePage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState("Chưa lưu");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          voiceGender: form.voiceType,
          language: form.language,
          readSpeed: form.readSpeed,
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
      setErrorMessage("Vui lòng nhập chủ đề trái cây trước khi AI tạo kịch bản.");
      return;
    }

    setIsGeneratingScript(true);
    setErrorMessage(null);

    try {
      const result = await generateScript({
        topic: form.storyTopic,
        characterDescription: form.characterDescription,
        contentTone: form.contentTone,
        numberOfScenes: form.numberOfScenes,
      });

      updateForm({ script: result.script });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsGeneratingScript(false);
    }
  }, [form.characterDescription, form.contentTone, form.numberOfScenes, form.storyTopic, updateForm]);

  const handleGenerateVideo = useCallback(async () => {
    setIsGeneratingVideo(true);
    setErrorMessage(null);

    try {
      const pid = await ensureProject();

      if (!form.storyTopic.trim()) {
        throw new Error("Vui lòng nhập chủ đề trước khi tạo video.");
      }

      if (!form.script.trim()) {
        throw new Error("Vui lòng nhập hoặc tạo kịch bản trước khi tạo video.");
      }

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
        contentTone: form.contentTone,
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
          voiceGender: form.voiceType,
          language: form.language,
          readSpeed: form.readSpeed,
          bgMusicEnabled: form.bgMusicEnabled,
        },
      });

      setGenerationId(generation.id);
      setGenerationStatus(generation.status as GenerationState);
      setVideoUrl(undefined);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setIsGeneratingVideo(false);
    }
  }, [ensureProject, form]);

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

        if (status === "failed") {
          setErrorMessage(
            statusData.errorMessage ||
              "Tạo video thất bại. Vui lòng kiểm tra quota API và thử lại."
          );
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

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setGenerationId(null);
    setGenerationStatus("idle");
    setVideoUrl(undefined);
    setErrorMessage(null);
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
                script={form.script}
                contentTone={form.contentTone}
                videoGenre={form.videoGenre}
                numberOfScenes={form.numberOfScenes}
                isGeneratingScript={isGeneratingScript}
                onStoryTopicChange={(value) => updateForm({ storyTopic: value })}
                onCharacterDescriptionChange={(value) => updateForm({ characterDescription: value })}
                onScriptChange={(value) => updateForm({ script: value })}
                onContentToneChange={(value) => updateForm({ contentTone: value })}
                onVideoGenreChange={(value) => updateForm({ videoGenre: value })}
                onNumberOfScenesChange={(value) => updateForm({ numberOfScenes: value })}
                onGenerateScript={handleGenerateScript}
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
                voiceType={form.voiceType}
                language={form.language}
                readSpeed={form.readSpeed}
                bgMusicEnabled={form.bgMusicEnabled}
                isGeneratingVideo={isGeneratingVideo}
                onEmotionStyleChange={(value) => updateForm({ emotionStyle: value })}
                onVisualStyleChange={(value) => updateForm({ visualStyle: value })}
                onMotionIntensityChange={(value) => updateForm({ motionIntensity: value })}
                onTransitionEnabledChange={(value) => updateForm({ transitionEnabled: value })}
                onSubjectConsistentChange={(value) => updateForm({ subjectConsistent: value })}
                onVoiceTypeChange={(value) => updateForm({ voiceType: value })}
                onLanguageChange={(value) => updateForm({ language: value })}
                onReadSpeedChange={(value) => updateForm({ readSpeed: value })}
                onBgMusicEnabledChange={(value) => updateForm({ bgMusicEnabled: value })}
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
          </div>

          <div className="reveal-up [animation-delay:170ms]">
            <PreviewPanel
              aiModel={form.aiModel}
              resolution={form.resolution}
              aspectRatio={form.aspectRatio}
              durationSeconds={form.durationSeconds}
              voiceType={form.voiceType}
              visualStyle={form.visualStyle}
              generationStatus={previewStatus}
              videoUrl={videoUrl}
            />
          </div>
        </div>
      </div>
    </main>
  );
}