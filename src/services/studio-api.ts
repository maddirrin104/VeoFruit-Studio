import type {
  AudioConfigInput,
  CreateGenerationRequest,
  CreateProjectRequest,
  ImageConfigInput,
  UpdateProjectRequest,
  VideoConfigInput,
} from "@/types/studio";

type ApiResponse<T> = {
  data: T;
  message?: string;
  error?: string;
};

type ProjectRecord = {
  id: string;
  userId: string;
  title: string;
  storyTopic: string | null;
  videoGenre: string | null;
  numberOfScenes: number | null;
  status: string | null;
  createdAt: string;
};

type GenerationRecord = {
  id: string;
  projectId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  videoUrl?: string;
  audioUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
};

async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(json.error || `Request failed: ${response.status}`);
  }

  return json.data;
}

export async function createProject(payload: CreateProjectRequest): Promise<ProjectRecord> {
  return http<ProjectRecord>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectRequest
): Promise<ProjectRecord> {
  return http<ProjectRecord>(`/api/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function generateScript(payload: {
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
}): Promise<{ script: string; estimatedDuration: string; sceneCount: number }> {
  return http<{ script: string; estimatedDuration: string; sceneCount: number }>(
    "/api/ai/generate-script",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createGeneration(
  payload: CreateGenerationRequest
): Promise<GenerationRecord> {
  return http<GenerationRecord>("/api/generations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadSampleImage(file: File): Promise<{
  url: string;
  absoluteUrl: string;
  fileName: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/image", {
    method: "POST",
    body: formData,
  });

  const json = (await response.json()) as ApiResponse<{
    url: string;
    absoluteUrl: string;
    fileName: string;
  }>;

  if (!response.ok || !json.data) {
    throw new Error(json.error || `Image upload failed: ${response.status}`);
  }

  return json.data;
}

export async function generateAudio(payload: {
  script?: string;
  storyTopic?: string;
  contentTone?: string;
  videoGenre?: string;
  sceneLocation?: string;
  durationSeconds?: number;
  audioConfig: AudioConfigInput;
}): Promise<{
  audioUrl: string;
  narrationText: string;
  narrationWords: number;
  estimatedDurationSeconds: number;
}> {
  return http<{
    audioUrl: string;
    narrationText: string;
    narrationWords: number;
    estimatedDurationSeconds: number;
  }>("/api/ai/generate-audio", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateVoicePreview(payload: {
  script?: string;
  storyTopic?: string;
  audioConfig: Pick<
    AudioConfigInput,
    "voiceGender" | "language" | "readSpeed" | "emotionIntensity" | "outputFormat"
  >;
}): Promise<{
  audioUrl: string;
  sampleText: string;
}> {
  return http<{
    audioUrl: string;
    sampleText: string;
  }>("/api/ai/preview-voice", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getGeneration(generationId: string): Promise<GenerationRecord> {
  return http<GenerationRecord>(`/api/generations/${generationId}`);
}

export type { ProjectRecord, GenerationRecord, VideoConfigInput, ImageConfigInput, AudioConfigInput };
