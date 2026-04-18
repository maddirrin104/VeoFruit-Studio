import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export interface RuntimeSettingsInput {
  databaseUrl?: string;
  googleApiKey?: string;
  runwayApiSecret?: string;
  runwayApiBaseUrl?: string;
  runwayApiVersion?: string;
  fptApiKey?: string;
  fptTtsUrl?: string;
  fptAudioWaitTimeoutMs?: number;
  fptTtsJobRetries?: number;
  publicAppUrl?: string;
}

export interface RuntimeSettingsResolved {
  databaseUrl?: string;
  googleApiKey?: string;
  runwayApiSecret?: string;
  runwayApiBaseUrl: string;
  runwayApiVersion: string;
  fptApiKey?: string;
  fptTtsUrl: string;
  fptAudioWaitTimeoutMs: number;
  fptTtsJobRetries: number;
  publicAppUrl?: string;
}

const SETTINGS_FILE_NAME = "runtime-settings.json";
const SETTINGS_DIR = path.join(os.homedir(), ".veofruit-studio");

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeInt(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  const rounded = Math.round(numeric);
  if (rounded < min) {
    return min;
  }

  if (rounded > max) {
    return max;
  }

  return rounded;
}

function getSettingsFilePath(): string {
  const override = normalizeOptionalString(process.env.VEOFRUIT_SETTINGS_PATH);
  if (override) {
    return override;
  }

  return path.join(SETTINGS_DIR, SETTINGS_FILE_NAME);
}

function sanitizeSettings(input: unknown): RuntimeSettingsInput {
  const payload = (input && typeof input === "object" ? input : {}) as RuntimeSettingsInput;

  const fptAudioWaitTimeoutMs = normalizeInt(payload.fptAudioWaitTimeoutMs, 45000, 5000, 180000);
  const fptTtsJobRetries = normalizeInt(payload.fptTtsJobRetries, 2, 1, 8);

  return {
    databaseUrl: normalizeOptionalString(payload.databaseUrl),
    googleApiKey: normalizeOptionalString(payload.googleApiKey),
    runwayApiSecret: normalizeOptionalString(payload.runwayApiSecret),
    runwayApiBaseUrl:
      normalizeOptionalString(payload.runwayApiBaseUrl) || "https://api.dev.runwayml.com",
    runwayApiVersion: normalizeOptionalString(payload.runwayApiVersion) || "2024-11-06",
    fptApiKey: normalizeOptionalString(payload.fptApiKey),
    fptTtsUrl: normalizeOptionalString(payload.fptTtsUrl) || "https://api.fpt.ai/hmi/tts/v5",
    fptAudioWaitTimeoutMs,
    fptTtsJobRetries,
    publicAppUrl: normalizeOptionalString(payload.publicAppUrl),
  };
}

async function readSettingsFile(): Promise<RuntimeSettingsInput> {
  const filePath = getSettingsFilePath();

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeSettings(parsed);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "ENOENT") {
      return {};
    }

    console.warn("[Settings] Failed to read runtime settings, falling back to environment variables.", error);
    return {};
  }
}

function mergeWithEnvironment(stored: RuntimeSettingsInput): RuntimeSettingsResolved {
  const fromEnv = {
    databaseUrl: normalizeOptionalString(process.env.DATABASE_URL),
    googleApiKey: normalizeOptionalString(process.env.GOOGLE_API_KEY),
    runwayApiSecret: normalizeOptionalString(process.env.RUNWAYML_API_SECRET),
    runwayApiBaseUrl: normalizeOptionalString(process.env.RUNWAY_API_BASE_URL),
    runwayApiVersion: normalizeOptionalString(process.env.RUNWAY_API_VERSION),
    fptApiKey: normalizeOptionalString(process.env.FPT_AI_API_KEY),
    fptTtsUrl: normalizeOptionalString(process.env.FPT_AI_TTS_URL),
    fptAudioWaitTimeoutMs: normalizeInt(process.env.FPT_AUDIO_WAIT_TIMEOUT_MS, 45000, 5000, 180000),
    fptTtsJobRetries: normalizeInt(process.env.FPT_TTS_JOB_RETRIES, 2, 1, 8),
    publicAppUrl: normalizeOptionalString(process.env.PUBLIC_APP_URL),
  };

  return sanitizeSettings({
    ...fromEnv,
    ...stored,
  }) as RuntimeSettingsResolved;
}

export async function getRuntimeSettings(): Promise<RuntimeSettingsResolved> {
  const stored = await readSettingsFile();
  return mergeWithEnvironment(stored);
}

export async function saveRuntimeSettings(partial: RuntimeSettingsInput): Promise<RuntimeSettingsResolved> {
  const currentStored = await readSettingsFile();
  const mergedStored = sanitizeSettings({
    ...currentStored,
    ...partial,
  });

  const filePath = getSettingsFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(mergedStored, null, 2)}\n`, "utf-8");

  return mergeWithEnvironment(mergedStored);
}

export function getRuntimeSettingsFilePath(): string {
  return getSettingsFilePath();
}
