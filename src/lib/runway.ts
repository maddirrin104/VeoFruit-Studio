import RunwayML, { TaskFailedError, TaskTimedOutError } from "@runwayml/sdk";

const apiKey = process.env.RUNWAY_API_KEY;

if (!apiKey) {
  throw new Error(
    "or RUNWAY_API_KEY environment variable is required"
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

function normalizeDurationSeconds(durationSeconds?: number): number {
  const fallbackDuration = 5;

  if (!durationSeconds || Number.isNaN(durationSeconds)) {
    return fallbackDuration;
  }

  // Runway gen4.5 text-to-video supports only 2-10 seconds.
  return Math.min(10, Math.max(2, Math.round(durationSeconds)));
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

export async function generateVideoWithRunway(
  request: RunwayVideoRequest
): Promise<RunwayVideoResponse> {
  const model = request.model ?? "gen4.5";
  const duration = normalizeDurationSeconds(request.durationSeconds);
  const promptText = normalizePromptText(request.prompt);

  try {
    const task = await client.textToVideo
      .create({
        model,
        promptText,
        ratio: request.ratio,
        duration,
      })
      .waitForTaskOutput({ timeout: 10 * 60 * 1000 });

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
