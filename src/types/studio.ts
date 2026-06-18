import type { VoiceType } from "@/lib/voice-options";

export type WorkflowMode =
  | "runway-manual"    // Mode 1: RunwayML + paste script manually + FPT voice
  | "runway-ai-script" // Mode 2: RunwayML + AI-generated script + FPT voice
  | "veo3-direct"      // Mode 3: Google Veo3 directly + AI script + FPT voice
  | "kling-ai-script"; // Mode 4: Kling AI + AI-generated script + FPT voice

export interface OptionItem {
  label: string;
  subLabel?: string;
  active?: boolean;
}

export interface SceneItem {
  icon: string;
  label: string;
  active?: boolean;
}

// API Types
export interface VideoConfigInput {
  resolution: "720p" | "1080p";
  aiModel: string;
  aiProvider: "runway" | "kling";
  aspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
  durationSeconds: number;
}

export type ImageAngle = "eye_level" | "diagonal" | "close_up" | "top_down";

export interface ImageConfigInput {
  emotionStyle: string;
  visualStyle: string;
  motionIntensity: number;
  transitionEnabled: boolean;
  subjectConsistent: boolean;
  referenceImageUrl?: string;
  referenceImageName?: string;
  referenceImageSource?: "upload" | "url";
  productReferenceImageUrl?: string;
  productReferenceImageName?: string;
  productReferenceImageSource?: "upload" | "url";
  brandBackgroundImageUrl?: string;
  brandBackgroundImageName?: string;
  brandBackgroundImageSource?: "upload" | "url";
  imageAngle?: ImageAngle;
}

export interface AudioConfigInput {
  audioEnabled: boolean;
  narrationMode: "script_read_along" | "separate_voiceover";
  voiceGender: VoiceType;
  language: string;
  readSpeed: number;
  emotionIntensity: number;
  outputFormat: "mp3" | "wav";
  bgMusicEnabled: boolean;
}

export interface CreateProjectRequest {
  title: string;
  storyTopic?: string;
  characterDescription?: string;
  script?: string;
  contentTone?: string;
  videoGenre?: string;
  numberOfScenes?: number;
  videoConfig?: Partial<VideoConfigInput>;
  imageConfig?: Partial<ImageConfigInput>;
  audioConfig?: Partial<AudioConfigInput>;
}

export type UpdateProjectRequest = CreateProjectRequest;

export interface CreateGenerationRequest {
  projectId: string;
  workflowMode?: WorkflowMode;
  storyTopic?: string;
  script?: string;
  characterDescription?: string;
  characterType?: string;
  contentTone?: string;
  videoGenre?: string;
  sceneLocation?: string;
  numberOfScenes?: number;
  videoConfig: VideoConfigInput;
  imageConfig: ImageConfigInput;
  audioConfig: AudioConfigInput;
}

export interface GenerationStatus {
  id: string;
  projectId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  audioUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDto {
  id: string;
  userId: string;
  title: string;
  storyTopic?: string;
  characterDescription?: string;
  script?: string;
  contentTone?: string;
  videoGenre?: string;
  numberOfScenes?: number;
  status?: string;
  videoConfig?: Partial<VideoConfigInput> | null;
  imageConfig?: Partial<ImageConfigInput> | null;
  audioConfig?: Partial<AudioConfigInput> | null;
  createdAt: string;
  updatedAt: string;
}