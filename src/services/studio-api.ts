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

export type ProjectRecord = {
  id: string;
  userId: string;
  title: string;
  storyTopic: string | null;
  characterDescription?: string | null;
  script?: string | null;
  contentTone?: string | null;
  videoGenre: string | null;
  numberOfScenes: number | null;
  status: string | null;
  videoConfig?: Record<string, unknown> | null;
  imageConfig?: Record<string, unknown> | null;
  audioConfig?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type GenerationRecord = {
  id: string;
  projectId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  progressMessage?: string | null;
  videoUrl?: string;
  audioUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
};

export type RuntimeSettingsRecord = {
  databaseUrl?: string;
  googleApiKey?: string;
  runwayApiSecret?: string;
  runwayApiBaseUrl: string;
  runwayApiVersion: string;
  fptApiKey?: string;
  fptTtsUrl: string;
  fptAudioWaitTimeoutMs: number;
  fptTtsJobRetries: number;
  klingAccessKeyId?: string;
  klingAccessKeySecret?: string;
  publicAppUrl?: string;
};

type SettingsPayload = {
  settings: RuntimeSettingsRecord;
  storagePath: string;
};

function toSafeErrorMessage(status: number, fallbackText: string): string {
  const trimmed = fallbackText.trim();
  if (!trimmed) {
    return `Request failed with status ${status}`;
  }

  // Keep the message short and avoid dumping full HTML pages into the UI.
  return trimmed.length > 240 ? `${trimmed.slice(0, 240)}...` : trimmed;
}

async function parseApiJson<T>(response: Response): Promise<ApiResponse<T> | null> {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!raw.trim()) {
    return null;
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    if (response.ok) {
      throw new Error(
        `Server returned non-JSON response (${response.status}). Please check server logs.`
      );
    }

    throw new Error(toSafeErrorMessage(response.status, raw));
  }

  try {
    return JSON.parse(raw) as ApiResponse<T>;
  } catch {
    throw new Error(
      `Server returned invalid JSON (${response.status}). Please check server logs.`
    );
  }
}

async function http<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = await parseApiJson<T>(response);
  if (!response.ok) {
    throw new Error(json?.error || json?.message || `Request failed: ${response.status}`);
  }

  if (!json || typeof json !== "object" || !("data" in json)) {
    throw new Error(`Server response missing 'data' field (${response.status}).`);
  }

  return json.data;
}

export async function createProject(payload: CreateProjectRequest): Promise<ProjectRecord> {
  return http<ProjectRecord>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProjects(): Promise<ProjectRecord[]> {
  return http<ProjectRecord[]>("/api/projects", {
    method: "GET",
  });
}

export async function getProject(projectId: string): Promise<ProjectRecord> {
  return http<ProjectRecord>(`/api/projects/${projectId}`, {
    method: "GET",
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

export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const json = await parseApiJson<{ message?: string; error?: string }>(response);
    throw new Error(json?.error || json?.message || `Request failed: ${response.status}`);
  }
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
  brandBackgroundImageUrl?: string;
  brandBackgroundImageName?: string;
  brandBackgroundImageSource?: "upload" | "url";
}): Promise<{
  script: string;
  estimatedDuration: string;
  sceneCount: number;
  warning?: string;
  source?: "gemini" | "fallback";
}> {
  return http<{
    script: string;
    estimatedDuration: string;
    sceneCount: number;
    warning?: string;
    source?: "gemini" | "fallback";
  }>(
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

  const json = await parseApiJson<{
    url: string;
    absoluteUrl: string;
    fileName: string;
  }>(response);

  if (!response.ok || !json?.data) {
    throw new Error(
      json?.error || json?.message || `Image upload failed: ${response.status}`
    );
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

export async function getRuntimeSettings(): Promise<SettingsPayload> {
  return http<SettingsPayload>("/api/settings", {
    method: "GET",
  });
}

export async function saveRuntimeSettings(payload: Partial<RuntimeSettingsRecord>): Promise<SettingsPayload> {
  return http<SettingsPayload>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify({ settings: payload }),
  });
}

export type { GenerationRecord, VideoConfigInput, ImageConfigInput, AudioConfigInput };
