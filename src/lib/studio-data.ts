import type { OptionItem, SceneItem } from "@/types/studio";

export const resolutionOptions: OptionItem[] = [
  { label: "720p", subLabel: "Fast render", active: false },
  { label: "1080p", subLabel: "High quality", active: true },
];

export const aspectRatioOptions: OptionItem[] = [
  { label: "9:16 (TikTok/Reels)", active: true },
  { label: "16:9 (YouTube)", active: false },
];

export const durationOptions: OptionItem[] = [
  { label: "15s", active: false },
  { label: "30s", active: true },
  { label: "60s", active: false },
];

export const toneOptions: OptionItem[] = [
  { label: "Emotional", active: false },
  { label: "Sales", active: false },
  { label: "Viral", active: false },
  { label: "Educational", active: false },
];

export const voiceGenderOptions: OptionItem[] = [
  { label: "Male", active: false },
  { label: "Female", active: true },
  { label: "AI Neutral", active: false },
];

export const styleOptions: OptionItem[] = [
  { label: "Cinematic", active: false },
  { label: "Anime", active: false },
  { label: "Digital Art", active: false },
  { label: "Realistic", active: false },
  { label: "Fantasy", active: false },
  { label: "Dreamy", active: true },
];

export const sceneTimeline: SceneItem[] = [
  { icon: "🎬", label: "Scene 1", active: true },
  { icon: "🎭", label: "Scene 2" },
  { icon: "🎨", label: "Scene 3" },
  { icon: "✨", label: "Scene 4" },
];