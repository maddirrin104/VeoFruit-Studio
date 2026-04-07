export type VoiceGender = "Nam" | "Nữ";

export const VOICE_DEFINITIONS = [
  {
    id: "banmai",
    label: "Ban Mai (Nữ miền Bắc)",
    gender: "Nữ" as VoiceGender,
    defaultProviderVoice: "banmai",
  },
  {
    id: "thuminh",
    label: "Thu Minh (Nữ miền Bắc)",
    gender: "Nữ" as VoiceGender,
    defaultProviderVoice: "thuminh",
  },
  {
    id: "myan",
    label: "Mỹ An (Nữ miền Trung)",
    gender: "Nữ" as VoiceGender,
    defaultProviderVoice: "myan",
  },
  {
    id: "linhsan",
    label: "Linh San (Nữ miền Nam)",
    gender: "Nữ" as VoiceGender,
    defaultProviderVoice: "linhsan",
  },
  {
    id: "lannhi",
    label: "Lan Nhi (Nữ miền Nam)",
    gender: "Nữ" as VoiceGender,
    defaultProviderVoice: "lannhi",
  },
  {
    id: "ngoclam",
    label: "Ngọc Lam (Nữ miền Trung)",
    gender: "Nữ" as VoiceGender,
    defaultProviderVoice: "ngoclam",
  },
  {
    id: "leminh",
    label: "Lê Minh (Nam miền Bắc)",
    gender: "Nam" as VoiceGender,
    defaultProviderVoice: "leminh",
  },
  {
    id: "minhquang",
    label: "Minh Quang (Nam miền Nam)",
    gender: "Nam" as VoiceGender,
    defaultProviderVoice: "minhquang",
  },
  {
    id: "giahuy",
    label: "Gia Huy (Nam miền Trung)",
    gender: "Nam" as VoiceGender,
    defaultProviderVoice: "giahuy",
  },
] as const;

export type VoiceType = (typeof VOICE_DEFINITIONS)[number]["id"];

const VOICE_BY_ID: Record<VoiceType, (typeof VOICE_DEFINITIONS)[number]> =
  VOICE_DEFINITIONS.reduce(
    (acc, voice) => {
      acc[voice.id] = voice;
      return acc;
    },
    {} as Record<VoiceType, (typeof VOICE_DEFINITIONS)[number]>
  );

export function getVoiceGenderFromVoiceType(voiceType: VoiceType): VoiceGender {
  return VOICE_BY_ID[voiceType]?.gender ?? "Nữ";
}

export function getVoiceLabel(voiceType: VoiceType): string {
  return VOICE_BY_ID[voiceType]?.label ?? voiceType;
}

export function getDefaultVoiceByGender(gender: VoiceGender): VoiceType {
  return gender === "Nam" ? "leminh" : "banmai";
}

export function getVoiceProviderCode(voiceType: VoiceType): string {
  return VOICE_BY_ID[voiceType]?.defaultProviderVoice ?? "banmai";
}

export function getVoiceEnvVarName(voiceType: VoiceType): string {
  return `FPT_AI_VOICE_${voiceType.toUpperCase()}`;
}
