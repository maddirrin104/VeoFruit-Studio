export interface CreateProjectRequest {
  title: string;
  storyTopic?: string;
  characterDescription?: string;
  script?: string;
  contentTone?: string;
  videoGenre?: string;
  numberOfScenes?: number;
  videoConfig?: Record<string, unknown>;
  imageConfig?: Record<string, unknown>;
  audioConfig?: Record<string, unknown>;
}

export interface ProjectDto {
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
  createdAt: string;
  updatedAt?: string;
  videoConfig?: Record<string, unknown> | null;
  imageConfig?: Record<string, unknown> | null;
  audioConfig?: Record<string, unknown> | null;
}
