import { getRuntimeSettings } from "@/lib/runtime-settings";

export class RunwayGenerationError extends Error {
  code: "TASK_FAILED" | "TASK_TIMEOUT" | "API_ERROR";
  retryable: boolean;

  constructor(
    message: string,
    code: "TASK_FAILED" | "TASK_TIMEOUT" | "API_ERROR",
    retryable: boolean
  ) {
    super(message);
    this.name = "RunwayGenerationError";
    this.code = code;
    this.retryable = retryable;
  }
}

export type RunwayRatio = "1280:720" | "720:1280";

export interface RunwayVideoRequest {
  prompt: string;
  ratio: RunwayRatio;
  durationSeconds?: number;
  model?: "gen4.5";
  promptImageUrl?: string;
}

export interface RunwayVideoResponse {
  videoUrl: string;
  duration: number;
  taskId: string;
  model: string;
}

function normalizePromptText(prompt: string): string {
  // Collapse whitespace so we keep more semantic content under the API 1000-char limit.
  const compact = prompt.replace(/\s+/g, " ").trim();
  if (compact.length <= 1000) {
    return compact;
  }

  // Keep both head and tail so hard constraints and script context survive together.
  return `${compact.slice(0, 610)} ... ${compact.slice(-370)}`;
}

export function mapAspectRatioToRunwayRatio(
  aspectRatio?: string
): RunwayRatio {
  if (aspectRatio === "16:9") {
    return "1280:720";
  }

  return "720:1280";
}

function resolveDurationSeconds(durationSeconds?: number): number {
  const fallbackDuration = 10;

  if (durationSeconds === undefined || Number.isNaN(durationSeconds)) {
    return fallbackDuration;
  }

  if (!Number.isInteger(durationSeconds)) {
    throw new Error("Thời lượng video phải là số nguyên theo đơn vị giây.");
  }

  // UI allows longer presets (30s, 60s, 3p), but current provider request supports max 10s per job.
  if (durationSeconds > 10) {
    return 10;
  }

  // Runway gen4.5 supports integer durations in range 2..10 seconds.
  if (durationSeconds < 2 || durationSeconds > 10) {
    throw new Error("Model hiện tại chỉ hỗ trợ thời lượng từ 2 đến 10 giây.");
  }

  return durationSeconds;
}

function normalizeRunwayError(error: unknown): RunwayGenerationError {
  if (error instanceof RunwayGenerationError) {
    return error;
  }

  const rawMessage = (error as Error)?.message || "Unknown Runway API error";
  const lowered = rawMessage.toLowerCase();

  if (lowered.includes("timed out") || lowered.includes("timeout")) {
    return new RunwayGenerationError(
      "Runway task timed out while waiting for video output",
      "TASK_TIMEOUT",
      true
    );
  }

  if (lowered.includes("task failed")) {
    return new RunwayGenerationError(rawMessage, "TASK_FAILED", true);
  }

  if (rawMessage.includes("promptText") && rawMessage.includes("<=1000")) {
    return new RunwayGenerationError(
      "Nội dung prompt vượt 1000 ký tự theo giới hạn Runway. Hệ thống đã tự rút gọn, vui lòng thử tạo lại.",
      "API_ERROR",
      true
    );
  }

  return new RunwayGenerationError(
    rawMessage,
    "API_ERROR",
    true
  );
}

function shouldFallbackToTextOnly(error: unknown): boolean {
  const message = (error as Error)?.message || "";
  const lowered = message.toLowerCase();

  const failureDetails =
    (error as { details?: { failure?: string; failureCode?: string } })?.details ?? {};

  const failureText = `${failureDetails.failure ?? ""} ${failureDetails.failureCode ?? ""}`
    .trim()
    .toLowerCase();

  return (
    lowered.includes("promptimage") ||
    lowered.includes("timeout while fetching asset") ||
    lowered.includes("invalid_union") ||
    failureText.includes("promptimage") ||
    failureText.includes("fetch") ||
    failureText.includes("asset") ||
    failureText.includes("url")
  );
}

function isLocalOnlyHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".local")
  ) {
    return true;
  }

  return false;
}

function resolvePromptImageUrl(promptImageUrl?: string): string | undefined {
  const trimmed = promptImageUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      console.warn("[Runway] Skip image-to-video because promptImage URL protocol is invalid:", trimmed);
      return undefined;
    }

    if (isLocalOnlyHostname(parsed.hostname)) {
      throw new RunwayGenerationError(
        "Ảnh tham chiếu đang ở localhost nên Runway không thể truy cập. Hãy cấu hình PUBLIC_APP_URL là domain public (hoặc dùng URL ảnh public) rồi thử lại.",
        "API_ERROR",
        false
      );
    }

    return parsed.toString();
  } catch {
    console.warn("[Runway] Skip image-to-video because promptImage URL is invalid:", trimmed);
    return undefined;
  }
}

type RunwayTaskStatus =
  | "PENDING"
  | "RUNNING"
  | "THROTTLED"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | string;

interface RunwayTaskResponse {
  id?: string;
  taskId?: string;
  status?: RunwayTaskStatus;
  output?: unknown;
  failure?: string;
  failureCode?: string;
  error?: { message?: string };
}

async function runwayApiRequest<T>(
  endpoint: string,
  init: RequestInit
): Promise<T> {
  const settings = await getRuntimeSettings();
  if (!settings.runwayApiSecret) {
    throw new RunwayGenerationError(
      "RUNWAYML_API_SECRET chưa được cấu hình. Hãy mở phần Settings trong app để nhập khóa API trước khi tạo video.",
      "API_ERROR",
      false
    );
  }

  const response = await fetch(`${settings.runwayApiBaseUrl}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${settings.runwayApiSecret}`,
      "Content-Type": "application/json",
      "X-Runway-Version": settings.runwayApiVersion,
      ...(init.headers ?? {}),
    },
  });

  const responseText = await response.text();
  const parsed = responseText ? safeJsonParse<unknown>(responseText) : undefined;

  if (!response.ok) {
    const errorMessage =
      extractErrorMessage(parsed) ||
      (responseText ? responseText.slice(0, 700) : "Unknown Runway API error");

    throw new RunwayGenerationError(
      `Runway API request failed (${response.status}): ${errorMessage}`,
      "API_ERROR",
      response.status >= 500 || response.status === 429
    );
  }

  return (parsed ?? {}) as T;
}

function safeJsonParse<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const root = payload as {
    error?: string | { message?: string };
    message?: string;
    failure?: string;
  };

  if (typeof root.error === "string") {
    return root.error;
  }

  if (typeof root.error === "object" && typeof root.error?.message === "string") {
    return root.error.message;
  }

  if (typeof root.message === "string") {
    return root.message;
  }

  if (typeof root.failure === "string") {
    return root.failure;
  }

  return undefined;
}

function extractTaskId(task: RunwayTaskResponse): string {
  const taskId = task.id || task.taskId;
  if (!taskId) {
    throw new RunwayGenerationError(
      "Runway task creation succeeded but task id is missing",
      "API_ERROR",
      true
    );
  }

  return taskId;
}

function extractVideoUrl(output: unknown): string | undefined {
  if (Array.isArray(output)) {
    for (const item of output) {
      if (typeof item === "string" && item) {
        return item;
      }

      if (item && typeof item === "object") {
        const candidate = item as { uri?: string; url?: string };
        if (candidate.uri) {
          return candidate.uri;
        }
        if (candidate.url) {
          return candidate.url;
        }
      }
    }
  }

  if (output && typeof output === "object") {
    const candidate = output as { uri?: string; url?: string };
    return candidate.uri || candidate.url;
  }

  return undefined;
}

async function waitForRunwayTaskOutput(taskId: string, timeoutMs: number): Promise<RunwayTaskResponse> {
  const startTime = Date.now();

  
  // Adaptive polling: start with 2s checks, then slow down to 5s after 30 seconds
  // This reduces API calls by ~60% while maintaining responsiveness for quick completions
  let pollIntervalMs = 2000;
  const slowdownThresholdMs = 30 * 1000; // Switch to slower polling after 30s

  while (Date.now() - startTime < timeoutMs) {
    const task = await runwayApiRequest<RunwayTaskResponse>(`/v1/tasks/${taskId}`, {
      method: "GET",
    });

    const status = (task.status || "").toUpperCase();
    if (status === "SUCCEEDED") {
      return task;
    }

    if (status === "FAILED" || status === "CANCELLED") {
      const failureMessage = task.failure || task.error?.message || "Runway task failed";
      const failureCodeSuffix = task.failureCode ? ` (code: ${task.failureCode})` : "";
      throw new RunwayGenerationError(
        `Runway task failed: ${failureMessage}${failureCodeSuffix}`,
        "TASK_FAILED",
        true
      );
    }

    // Adaptive polling: slow down after 30 seconds to reduce API load
    if (Date.now() - startTime > slowdownThresholdMs) {
      pollIntervalMs = 5000; // 5 seconds after 30s elapsed
    }
    
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new RunwayGenerationError(
    "Runway task timed out while waiting for video output",
    "TASK_TIMEOUT",
    true
  );
}

async function createImageToVideoTask(input: {
  model: string;
  promptText: string;
  ratio: RunwayRatio;
  duration: number;
  promptImageUrl: string;
}): Promise<string> {
  const created = await runwayApiRequest<RunwayTaskResponse>("/v1/image_to_video", {
    method: "POST",
    body: JSON.stringify({
      model: input.model,
      promptText: input.promptText,
      ratio: input.ratio,
      duration: input.duration,
      promptImage: [
        {
          uri: input.promptImageUrl,
          position: "first",
        },
      ],
    }),
  });

  return extractTaskId(created);
}

async function createTextToVideoTask(input: {
  model: string;
  promptText: string;
  ratio: RunwayRatio;
  duration: number;
}): Promise<string> {
  const created = await runwayApiRequest<RunwayTaskResponse>("/v1/text_to_video", {
    method: "POST",
    body: JSON.stringify({
      model: input.model,
      promptText: input.promptText,
      ratio: input.ratio,
      duration: input.duration,
    }),
  });

  return extractTaskId(created);
}

export async function generateVideoWithRunway(
  request: RunwayVideoRequest
): Promise<RunwayVideoResponse> {
  const model = request.model ?? "gen4.5";
  const duration = resolveDurationSeconds(request.durationSeconds);
  const promptText = normalizePromptText(request.prompt);
  const promptImageUrl = resolvePromptImageUrl(request.promptImageUrl);

  try {
    let task;
    let taskId = "";

    if (promptImageUrl) {
      try {
        taskId = await createImageToVideoTask({
          model,
          promptText,
          ratio: request.ratio,
          duration,
          promptImageUrl,
        });
        task = await waitForRunwayTaskOutput(taskId, 10 * 60 * 1000);
      } catch (imageError) {
        if (!shouldFallbackToTextOnly(imageError)) {
          throw imageError;
        }

        console.warn("[Runway] image-to-video failed; fallback to text-to-video:", imageError);
        taskId = await createTextToVideoTask({
          model,
          promptText,
          ratio: request.ratio,
          duration,
        });
        task = await waitForRunwayTaskOutput(taskId, 10 * 60 * 1000);
      }
    } else {
      taskId = await createTextToVideoTask({
        model,
        promptText,
        ratio: request.ratio,
        duration,
      });
      task = await waitForRunwayTaskOutput(taskId, 10 * 60 * 1000);
    }

    const videoUrl = extractVideoUrl(task.output);
    if (!videoUrl) {
      throw new Error("Runway task succeeded but no output video URL was returned");
    }

    return {
      videoUrl,
      duration,
      taskId,
      model,
    };
  } catch (error) {
    throw normalizeRunwayError(error);
  }
}
