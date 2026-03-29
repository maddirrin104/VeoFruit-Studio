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
  aspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
  durationSeconds: number;
}

export interface ImageConfigInput {
  emotionStyle: string;
  visualStyle: string;
  motionIntensity: number;
  transitionEnabled: boolean;
  subjectConsistent: boolean;
  referenceImageUrl?: string;
  referenceImageName?: string;
}

export interface AudioConfigInput {
  narrationMode: "script_read_along" | "separate_voiceover";
  voiceGender: "Nam" | "Nữ" | "Trung tính AI";
  language: string;
  readSpeed: number;
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
}

export interface UpdateProjectRequest extends CreateProjectRequest {
  videoConfig?: Partial<VideoConfigInput>;
  imageConfig?: Partial<ImageConfigInput>;
  audioConfig?: Partial<AudioConfigInput>;
}

export interface CreateGenerationRequest {
  projectId: string;
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
  createdAt: string;
  updatedAt: string;
}