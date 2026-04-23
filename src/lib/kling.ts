import crypto from "node:crypto";
import { getRuntimeSettings } from "@/lib/runtime-settings";

export class KlingGenerationError extends Error {
  code: "TASK_FAILED" | "TASK_TIMEOUT" | "API_ERROR" | "NO_API_KEY";
  retryable: boolean;

  constructor(
    message: string,
    code: "TASK_FAILED" | "TASK_TIMEOUT" | "API_ERROR" | "NO_API_KEY",
    retryable: boolean
  ) {
    super(message);
    this.name = "KlingGenerationError";
    this.code = code;
    this.retryable = retryable;
  }
}

export interface KlingTextToVideoRequest {
  prompt: string;
  negativePrompt?: string;
  duration: "5" | "10";
  aspectRatio: "9:16" | "16:9" | "1:1" | "4:5";
  mode?: "standard" | "pro";
  sound?: "on" | "off";
}

export interface KlingImageToVideoRequest {
  imageUrl: string;
  imageTailUrl?: string;
  prompt: string;
  negativePrompt?: string;
  duration: "5" | "10";
  aspectRatio: "9:16" | "16:9" | "1:1" | "4:5";
  mode?: "standard" | "pro";
  sound?: "on" | "off";
}

export interface KlingVideoResponse {
  taskId: string;
  videoUrl?: string;
  status: string;
  duration: number;
}

// Kling API requires JWT signed with HS256 using accessKeyId + accessKeySecret.
// We generate it inline using Node.js crypto — no extra dependency needed.
function generateKlingJWT(accessKeyId: string, secretKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iss: accessKeyId, exp: now + 1800, nbf: now - 5 })
  ).toString("base64url");
  const data = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", secretKey).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function mapAspectRatioToKlingRatio(
  aspectRatio?: string
): "9:16" | "16:9" | "1:1" | "4:5" {
  switch (aspectRatio) {
    case "16:9":
      return "16:9";
    case "1:1":
      return "1:1";
    case "4:5":
      return "4:5";
    case "9:16":
    default:
      return "9:16";
  }
}

function normalizeDurationForKling(durationSeconds?: number): "5" | "10" {
  if (!durationSeconds || durationSeconds <= 5) {
    return "5";
  }
  return "10";
}

async function getKlingJWT(): Promise<string> {
  const settings = await getRuntimeSettings();

  const accessKeyId = settings.klingAccessKeyId?.trim();
  const secretKey = settings.klingAccessKeySecret?.trim();

  if (!accessKeyId || !secretKey) {
    throw new KlingGenerationError(
      "Kling API chưa được cấu hình. Vui lòng nhập Kling Access Key ID và Secret Key trong Settings.",
      "NO_API_KEY",
      false
    );
  }

  return generateKlingJWT(accessKeyId, secretKey);
}

type KlingTaskResponse = {
  data?: {
    task_id?: string;
    task_status?: string;
    task_result?: { videos?: Array<{ url?: string }> };
  };
  message?: string;
  code?: number;
};

// Polls until the Kling task completes and returns the final video URL.
async function pollKlingTask(
  taskId: string,
  endpoint: "text2video" | "image2video",
  jwt: string,
  maxWaitMs = 600_000,
  intervalMs = 10_000
): Promise<string> {
  const url = `https://api-singapore.klingai.com/v1/videos/${endpoint}/${taskId}`;
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as KlingTaskResponse;
      throw new KlingGenerationError(
        error.message || `Kling poll error: ${response.status}`,
        "API_ERROR",
        true
      );
    }

    const data = (await response.json()) as KlingTaskResponse;
    const status = data.data?.task_status;

    console.log(`[Kling] Task ${taskId} status: ${status}`);

    if (status === "succeed") {
      const videoUrl = data.data?.task_result?.videos?.[0]?.url;
      if (!videoUrl) {
        throw new KlingGenerationError(
          "Kling task succeeded but returned no video URL",
          "TASK_FAILED",
          false
        );
      }
      return videoUrl;
    }

    if (status === "failed") {
      throw new KlingGenerationError(
        "Kling video generation task failed",
        "TASK_FAILED",
        false
      );
    }

    // status is "submitted" or "processing" — keep polling
  }

  throw new KlingGenerationError(
    `Kling video generation timed out after ${maxWaitMs / 60_000} minutes`,
    "TASK_TIMEOUT",
    true
  );
}

export async function generateTextToVideoWithKling(
  request: KlingTextToVideoRequest
): Promise<KlingVideoResponse> {
  const jwt = await getKlingJWT();

  console.log(`[Kling] Creating text-to-video task...`);
  console.log(`[Kling] Prompt: ${request.prompt.substring(0, 100)}...`);

  const response = await fetch(
    "https://api-singapore.klingai.com/v1/videos/text2video",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "kling-v2-6",
        prompt: request.prompt,
        negative_prompt: request.negativePrompt || "",
        duration: request.duration,
        mode: request.mode || "pro",
        sound: request.sound || "on",
        aspect_ratio: request.aspectRatio,
        callback_url: "",
        external_task_id: "",
      }),
    }
  );

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as KlingTaskResponse;
    throw new KlingGenerationError(
      error.message || `Kling API error: ${response.status}`,
      "API_ERROR",
      true
    );
  }

  const data = (await response.json()) as KlingTaskResponse;

  if (!data.data?.task_id) {
    throw new KlingGenerationError(
      "Invalid Kling API response — no task ID",
      "API_ERROR",
      false
    );
  }

  const taskId = data.data.task_id;
  console.log(`[Kling] ✅ Text-to-video task created: ${taskId} — polling for result...`);

  const videoUrl = await pollKlingTask(taskId, "text2video", jwt);
  console.log(`[Kling] ✅ Text-to-video completed: ${videoUrl.substring(0, 80)}...`);

  return {
    taskId,
    videoUrl,
    status: "completed",
    duration: parseInt(request.duration),
  };
}

export async function generateImageToVideoWithKling(
  request: KlingImageToVideoRequest
): Promise<KlingVideoResponse> {
  const jwt = await getKlingJWT();

  console.log(`[Kling] Creating image-to-video task...`);
  console.log(`[Kling] Image: ${request.imageUrl.substring(0, 80)}...`);
  console.log(`[Kling] Prompt: ${request.prompt.substring(0, 100)}...`);

  const response = await fetch(
    "https://api-singapore.klingai.com/v1/videos/image2video",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "kling-v2-6",
        image: request.imageUrl,
        image_tail: request.imageTailUrl || "",
        prompt: request.prompt,
        negative_prompt: request.negativePrompt || "",
        duration: request.duration,
        mode: request.mode || "pro",
        sound: request.sound || "off",
        aspect_ratio: request.aspectRatio,
        callback_url: "",
        external_task_id: "",
      }),
    }
  );

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as KlingTaskResponse;
    throw new KlingGenerationError(
      error.message || `Kling API error: ${response.status}`,
      "API_ERROR",
      true
    );
  }

  const data = (await response.json()) as KlingTaskResponse;

  if (!data.data?.task_id) {
    throw new KlingGenerationError(
      "Invalid Kling API response — no task ID",
      "API_ERROR",
      false
    );
  }

  const taskId = data.data.task_id;
  console.log(`[Kling] ✅ Image-to-video task created: ${taskId} — polling for result...`);

  const videoUrl = await pollKlingTask(taskId, "image2video", jwt);
  console.log(`[Kling] ✅ Image-to-video completed: ${videoUrl.substring(0, 80)}...`);

  return {
    taskId,
    videoUrl,
    status: "completed",
    duration: parseInt(request.duration),
  };
}

export function mapAspectRatioForKling(
  aspectRatio?: string
): "9:16" | "16:9" | "1:1" | "4:5" {
  return mapAspectRatioToKlingRatio(aspectRatio);
}

export function mapDurationForKling(durationSeconds?: number): "5" | "10" {
  return normalizeDurationForKling(durationSeconds);
}
