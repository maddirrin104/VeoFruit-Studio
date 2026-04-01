import RunwayML, { TaskFailedError, TaskTimedOutError } from "@runwayml/sdk";

const apiKey = process.env.RUNWAYML_API_SECRET;

if (!apiKey) {
  throw new Error(
    "RUNWAYML_API_SECRET environment variable is required"
  );
}

const client = new RunwayML({ apiKey });

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

  return `${compact.slice(0, 997)}...`;
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
  if (error instanceof TaskFailedError) {
    const details = (error as TaskFailedError & { taskDetails?: { failure?: string; failureCode?: string } }).taskDetails;
    const failureMessage = details?.failure ?? "Runway task failed";
    const failureCode = details?.failureCode ? ` (code: ${details.failureCode})` : "";

    return new RunwayGenerationError(
      `Runway task failed: ${failureMessage}${failureCode}`,
      "TASK_FAILED",
      true
    );
  }

  if (error instanceof TaskTimedOutError) {
    return new RunwayGenerationError(
      "Runway task timed out while waiting for video output",
      "TASK_TIMEOUT",
      true
    );
  }

  const rawMessage = (error as Error)?.message || "Unknown Runway API error";

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

  return (
    lowered.includes("promptimage") ||
    lowered.includes("timeout while fetching asset") ||
    lowered.includes("invalid_union")
  );
}

export async function generateVideoWithRunway(
  request: RunwayVideoRequest
): Promise<RunwayVideoResponse> {
  const model = request.model ?? "gen4.5";
  const duration = resolveDurationSeconds(request.durationSeconds);
  const promptText = normalizePromptText(request.prompt);
  const promptImageUrl = request.promptImageUrl?.trim();

  try {
    let task;

    if (promptImageUrl) {
      try {
        task = await client.imageToVideo
          .create({
            model,
            promptText,
            promptImage: promptImageUrl,
            ratio: request.ratio,
            duration,
          })
          .waitForTaskOutput({ timeout: 10 * 60 * 1000 });
      } catch (imageError) {
        if (!shouldFallbackToTextOnly(imageError)) {
          throw imageError;
        }

        console.warn("[Runway] image-to-video failed; fallback to text-to-video:", imageError);
        task = await client.textToVideo
          .create({
            model,
            promptText,
            ratio: request.ratio,
            duration,
          })
          .waitForTaskOutput({ timeout: 10 * 60 * 1000 });
      }
    } else {
      task = await client.textToVideo
        .create({
          model,
          promptText,
          ratio: request.ratio,
          duration,
        })
        .waitForTaskOutput({ timeout: 10 * 60 * 1000 });
    }

    const videoUrl = task.output?.[0];
    if (!videoUrl) {
      throw new Error("Runway task succeeded but no output video URL was returned");
    }

    return {
      videoUrl,
      duration,
      taskId: task.id,
      model,
    };
  } catch (error) {
    throw normalizeRunwayError(error);
  }
}
