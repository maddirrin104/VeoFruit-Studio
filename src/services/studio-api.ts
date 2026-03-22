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
  contentTone?: string;
  numberOfScenes?: number;
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

export async function getGeneration(generationId: string): Promise<GenerationRecord> {
  return http<GenerationRecord>(`/api/generations/${generationId}`);
}

export type { ProjectRecord, GenerationRecord, VideoConfigInput, ImageConfigInput, AudioConfigInput };
