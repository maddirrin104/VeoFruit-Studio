export interface CreateProjectRequest {
  title: string;
  storyTopic?: string;
  videoGenre?: string;
  numberOfScenes?: number;
}

export interface ProjectDto {
  id: string;
  userId: string;
  title: string;
  storyTopic: string | null;
  videoGenre: string | null;
  numberOfScenes: number | null;
  status: string | null;
  createdAt: string;
}
