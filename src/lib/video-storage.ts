import { promises as fs } from "node:fs";
import path from "node:path";
import { buildFilesApiPath, getPublicPath } from "@/lib/runtime-path";

const VIDEO_OUTPUT_DIR = getPublicPath("uploads", "videos");

/**
 * Download video from URL and save it locally
 * @param videoUrl - URL of the video to download
 * @param generationId - Generation ID to use as filename
 * @returns Local URL path for the saved video
 */
export async function downloadAndSaveVideo(
  videoUrl: string,
  generationId: string
): Promise<string> {
  try {
    // Ensure videos directory exists
    await fs.mkdir(VIDEO_OUTPUT_DIR, { recursive: true });

    // Determine file extension from URL
    const urlObj = new URL(videoUrl);
    const pathname = urlObj.pathname;
    let extension = "mp4"; // default

    // Try to get extension from URL path
    const pathExtension = pathname.split(".").pop()?.toLowerCase().split("?")[0];
    if (pathExtension && ["mp4", "mov", "webm", "avi", "mkv"].includes(pathExtension)) {
      extension = pathExtension;
    }

    const fileName = `${generationId}.${extension}`;
    const filePath = path.join(VIDEO_OUTPUT_DIR, fileName);

    // Download video from URL
    console.log(`[VideoStorage] Downloading video from ${videoUrl}...`);
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download video: ${response.status} ${response.statusText}`
      );
    }

    // Convert response to buffer and save
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));

    const localUrl = buildFilesApiPath("uploads", "videos", fileName);
    console.log(
      `[VideoStorage] ✅ Video saved successfully at ${localUrl} (${buffer.byteLength} bytes)`
    );

    return localUrl;
  } catch (error) {
    console.error(`[VideoStorage] ❌ Failed to save video:`, error);
    throw new Error(
      `Video storage failed: ${(error as Error)?.message || "Unknown error"}`
    );
  }
}

/**
 * Delete a saved video file
 * @param generationId - Generation ID of the video to delete
 */
export async function deleteVideoFile(generationId: string): Promise<void> {
  try {
    // Try common video formats
    const extensions = ["mp4", "mov", "webm", "avi", "mkv"];

    for (const ext of extensions) {
      const filePath = path.join(VIDEO_OUTPUT_DIR, `${generationId}.${ext}`);
      try {
        await fs.unlink(filePath);
        console.log(`[VideoStorage] Deleted video file: ${filePath}`);
        return;
      } catch {
        // File doesn't exist with this extension, try next one
      }
    }

    console.warn(`[VideoStorage] No video file found for generation ${generationId}`);
  } catch (error) {
    console.error(`[VideoStorage] Failed to delete video:`, error);
  }
}

/**
 * Get the full file path for a stored video
 * @param generationId - Generation ID
 * @param extension - File extension (defaults to mp4)
 */
export function getVideoFilePath(
  generationId: string,
  extension: string = "mp4"
): string {
  return path.join(VIDEO_OUTPUT_DIR, `${generationId}.${extension}`);
}
