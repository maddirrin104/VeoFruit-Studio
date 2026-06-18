import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePublicPathFromRequestPath } from "@/lib/runtime-path";
import { getRuntimeSettings } from "@/lib/runtime-settings";

export class RunwayGenerationError extends Error {
  code: "TASK_FAILED" | "TASK_TIMEOUT" | "API_ERROR";
  retryable: boolean;
  details?: { failure?: string; failureCode?: string };

  constructor(
    message: string,
    code: "TASK_FAILED" | "TASK_TIMEOUT" | "API_ERROR",
    retryable: boolean,
    details?: { failure?: string; failureCode?: string }
  ) {
    super(message);
    this.name = "RunwayGenerationError";
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

// Both gen4.5 and gen4_turbo require pixel-dimension ratios (confirmed from API validation errors)
export type RunwayRatio =
  | "1280:720" | "720:1280"
  | "1104:832" | "832:1104"
  | "960:960"
  | "1584:672";

export type RunwayModel =
  | "gen4.5"       // text-to-video & image-to-video
  | "gen4_turbo";  // image-to-video only

export interface RunwayVideoRequest {
  prompt: string;
  ratio: RunwayRatio;
  durationSeconds?: number;
  model?: RunwayModel;
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
  aspectRatio?: string,
  _model?: string
): RunwayRatio {
  // Both gen4.5 and gen4_turbo require pixel-dimension ratios
  switch (aspectRatio) {
    case "16:9": return "1280:720";
    case "1:1":  return "960:960";
    case "4:5":  return "832:1104";
    case "9:16":
    default:     return "720:1280";
  }
}

// RunwayML API only accepts 5 or 10 as valid duration values.
// Any other integer causes "Validation of body failed" (400).
function resolveDurationSeconds(durationSeconds?: number, model?: string): number {
  // Models cap at 10s; no model-specific override needed — 5/10 snap handles all cases

  if (durationSeconds === undefined || Number.isNaN(durationSeconds)) {
    return 10;
  }

  // Clamp anything above 10 down to 10 (multi-clip handled at route level)
  const clamped = Math.min(durationSeconds, 10);

  // Snap to nearest valid value: 5 or 10
  return clamped <= 7 ? 5 : 10;
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
    lowered.includes("bad_output") ||
    lowered.includes("internal.bad") ||
    failureText.includes("promptimage") ||
    failureText.includes("fetch") ||
    failureText.includes("asset") ||
    failureText.includes("url") ||
    failureText.includes("bad_output") ||
    failureText.includes("internal")
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

function detectImageMimeType(filePathOrName: string): string {
  const ext = path.extname(filePathOrName).toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "image/jpeg";
  }
}

function isWindowsAbsolutePath(value: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(value);
}

async function uploadImageAsEphemeral(filePath: string): Promise<string> {
  const settings = await getRuntimeSettings();
  const buffer = await fs.readFile(filePath);
  const mimeType = detectImageMimeType(filePath);
  const filename = path.basename(filePath);

  const initRes = await fetch(`${settings.runwayApiBaseUrl}/v1/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.runwayApiSecret}`,
      "Content-Type": "application/json",
      "X-Runway-Version": settings.runwayApiVersion,
    },
    body: JSON.stringify({ filename, type: "ephemeral" }),
  });

  if (!initRes.ok) {
    throw new Error(`Runway upload init failed (${initRes.status})`);
  }

  const uploadInitBody = await initRes.json() as Record<string, unknown>;
  const runwayUri = (uploadInitBody.runwayUri || uploadInitBody.uri) as string | undefined;
  const uploadUrl = uploadInitBody.uploadUrl as string | undefined;
  const fields = (uploadInitBody.fields ?? {}) as Record<string, string>;

  if (!runwayUri || !uploadUrl) {
    throw new Error(`Runway upload init returned unexpected response: ${JSON.stringify(uploadInitBody).slice(0, 200)}`);
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  formData.append("file", new Blob([buffer], { type: mimeType }), filename);

  const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });
  if (!uploadRes.ok) {
    throw new Error(`Runway storage upload failed (${uploadRes.status})`);
  }

  console.log(`[Runway] ✅ Uploaded image as ephemeral asset: ${runwayUri} (${(buffer.length / 1024).toFixed(0)}KB)`);
  return runwayUri;
}

async function toImageDataUrl(filePath: string): Promise<string> {
  try {
    await fs.access(filePath);
  } catch {
    throw new RunwayGenerationError(
      `Ảnh không tìm thấy tại: ${filePath}`,
      "API_ERROR",
      false
    );
  }

  try {
    const stats = await fs.stat(filePath);
    const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

    if (stats.size > MAX_IMAGE_SIZE) {
      throw new RunwayGenerationError(
        `Ảnh quá lớn (${(stats.size / 1024 / 1024).toFixed(2)}MB). Tối đa ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        "API_ERROR",
        false
      );
    }

    const buffer = await fs.readFile(filePath);
    const mimeType = detectImageMimeType(filePath);
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    console.log(`[Runway] Converted image to data URL (fallback): ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(0)}KB)`);
    return dataUrl;
  } catch (error) {
    if (error instanceof RunwayGenerationError) throw error;
    throw new RunwayGenerationError(
      `Lỗi đọc ảnh từ ${path.basename(filePath)}: ${(error as Error)?.message || "Unknown error"}`,
      "API_ERROR",
      false
    );
  }
}

async function tryResolveLocalPromptImagePath(rawUrlOrPath: string): Promise<string | undefined> {
  const fromPublicPath = resolvePublicPathFromRequestPath(rawUrlOrPath);
  if (fromPublicPath) {
    console.log(`[Runway] Resolved /api/files path to local file: ${path.basename(fromPublicPath)}`);
    return fromPublicPath;
  }

  if (isWindowsAbsolutePath(rawUrlOrPath) || path.isAbsolute(rawUrlOrPath)) {
    console.log(`[Runway] Using absolute file path: ${path.basename(rawUrlOrPath)}`);
    return rawUrlOrPath;
  }

  return undefined;
}

async function resolvePromptImageUrl(promptImageUrl?: string): Promise<string | undefined> {
  const trimmed = promptImageUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  console.log(`[Runway] Resolving prompt image URL: ${trimmed.substring(0, 100)}...`);

  if (/^data:image\//i.test(trimmed)) {
    console.log(`[Runway] Image already in data URL format`);
    return trimmed;
  }

  const directLocalPath = await tryResolveLocalPromptImagePath(trimmed);
  if (directLocalPath) {
    try {
      return await toImageDataUrl(directLocalPath);
    } catch (error) {
      if (error instanceof RunwayGenerationError) throw error;
      throw new RunwayGenerationError(
        `Không thể chuẩn bị ảnh cho image-to-video: ${(error as Error)?.message || "Unknown error"}`,
        "API_ERROR",
        false
      );
    }
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol === "file:") {
      console.log(`[Runway] Resolving file:// URL to local path`);
      return await toImageDataUrl(fileURLToPath(parsed));
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      console.warn("[Runway] Skip image-to-video because promptImage protocol is invalid:", trimmed);
      return undefined;
    }

    if (isLocalOnlyHostname(parsed.hostname)) {
      console.log(`[Runway] Detected localhost URL, resolving local path from pathname`);
      const localPath = await tryResolveLocalPromptImagePath(parsed.pathname);
      if (!localPath) {
        throw new RunwayGenerationError(
          "Không thể ánh xạ URL ảnh local sang đường dẫn file trong thư mục dự án.",
          "API_ERROR",
          false
        );
      }
      return await toImageDataUrl(localPath);
    }

    console.log(`[Runway] Using public HTTPS URL for image`);
    return parsed.toString();
  } catch (error) {
    if (error instanceof RunwayGenerationError) {
      throw error;
    }

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
      // Force a new TCP connection per request to avoid ECONNRESET from stale keep-alive connections.
      // Runway's dev server closes idle connections after ~40s; native fetch's connection pool
      // tries to reuse them and gets "fetch failed".
      Connection: "close",
      ...(init.headers ?? {}),
    },
  });

  const responseText = await response.text();
  const parsed = responseText ? safeJsonParse<unknown>(responseText) : undefined;

  if (!response.ok) {
    const errorMessage =
      extractErrorMessage(parsed) ||
      (responseText ? responseText.slice(0, 700) : "Unknown Runway API error");

    if (response.status === 400) {
      console.error(`[Runway] 400 Validation error on ${endpoint}. Raw response:`, responseText?.slice(0, 500));
    }

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
  let pollIntervalMs = 2000;
  const slowdownThresholdMs = 30 * 1000;
  let lastProgressLogMs = 0;
  let consecutivePollFailures = 0;
  const maxConsecutivePollFailures = 4;

  while (Date.now() - startTime < timeoutMs) {
    let task: RunwayTaskResponse;
    try {
      task = await runwayApiRequest<RunwayTaskResponse>(`/v1/tasks/${taskId}`, {
        method: "GET",
      });
      consecutivePollFailures = 0;
    } catch (pollErr) {
      consecutivePollFailures++;
      if (consecutivePollFailures >= maxConsecutivePollFailures) {
        console.error(`[Runway] ❌ Poll failed ${consecutivePollFailures}x for task ${taskId}, giving up:`, (pollErr as Error)?.message);
        throw pollErr;
      }
      console.warn(`[Runway] ⚠️ Poll network error (${consecutivePollFailures}/${maxConsecutivePollFailures}), retrying in 5s:`, (pollErr as Error)?.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    const status = (task.status || "").toUpperCase();
    if (status === "SUCCEEDED") {
      return task;
    }

    if (status === "FAILED" || status === "CANCELLED") {
      const failureMessage = task.failure || task.error?.message || "Runway task failed";
      const failureCodeSuffix = task.failureCode ? ` (code: ${task.failureCode})` : "";
      console.error(`[Runway] ❌ Task ${taskId} ${status}: failure="${task.failure ?? ""}" failureCode="${task.failureCode ?? ""}"`);
      throw new RunwayGenerationError(
        `Runway task failed: ${failureMessage}${failureCodeSuffix}`,
        "TASK_FAILED",
        true,
        { failure: task.failure, failureCode: task.failureCode }
      );
    }

    const elapsedMs = Date.now() - startTime;

    if (elapsedMs - lastProgressLogMs >= 30_000) {
      lastProgressLogMs = elapsedMs;
      console.info(`[Runway] Still waiting for task ${taskId} (${Math.round(elapsedMs / 1000)}s elapsed, status=${task.status || "unknown"})...`);
    }

    if (elapsedMs > slowdownThresholdMs) {
      pollIntervalMs = 5000;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new RunwayGenerationError(
    `Runway task timed out after ${Math.round(timeoutMs / 1000)}s. The task may still be processing on Runway's servers.`,
    "TASK_TIMEOUT",
    false
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
  const duration = resolveDurationSeconds(request.durationSeconds, model);
  const promptText = normalizePromptText(request.prompt);
  const promptImageUrl = await resolvePromptImageUrl(request.promptImageUrl);

  try {
    let task;
    let taskId = "";

    if (promptImageUrl) {
      console.log(`[Runway] 🎬 Creating image-to-video task (${promptImageUrl.substring(0, 50)}...)`);
      try {
        taskId = await createImageToVideoTask({
          model,
          promptText,
          ratio: request.ratio,
          duration,
          promptImageUrl,
        });
        console.log(`[Runway] ✅ Image-to-video task created: ${taskId}`);
        task = await waitForRunwayTaskOutput(taskId, 10 * 60 * 1000);
      } catch (imageError) {
        const imageErrMsg = (imageError as Error)?.message || "Unknown error";
        const imageErrDetails = (imageError as RunwayGenerationError)?.details;
        console.error("[Runway] ❌ Image-to-video catch:", imageErrMsg, imageErrDetails ?? "");

        if (!shouldFallbackToTextOnly(imageError)) {
          throw imageError;
        }

        // gen4_turbo only supports image-to-video; don't fallback to text-to-video
        if (model === "gen4_turbo") {
          throw new Error(`Gen4 Turbo video generation failed: ${imageErrMsg}`);
        }

        console.warn("[Runway] ⚠️ image-to-video failed; fallback to text-to-video:", imageErrMsg);
        taskId = await createTextToVideoTask({
          model,
          promptText,
          ratio: request.ratio,
          duration,
        });
        task = await waitForRunwayTaskOutput(taskId, 10 * 60 * 1000);
      }
    } else {
      // gen4_turbo only supports image-to-video
      if (model === "gen4_turbo") {
        throw new Error("Gen4 Turbo only supports image-to-video. Please provide an image or switch to Gen 4.5 for text-to-video.");
      }

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
