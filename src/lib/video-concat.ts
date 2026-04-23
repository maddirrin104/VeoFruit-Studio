import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { getRuntimeMediaPath } from "@/lib/runtime-path";

// ffmpeg-static is declared as a module that exports a string path or null
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegStaticPath: string | null = require("ffmpeg-static") as string | null;

const TEMP_DIR = getRuntimeMediaPath("concat-temp");

function getFfmpegPath(): string {
  if (!ffmpegStaticPath) {
    throw new Error(
      "ffmpeg-static binary not found. Không thể ghép video — vui lòng kiểm tra cài đặt ffmpeg-static."
    );
  }
  return ffmpegStaticPath;
}

export async function concatenateVideoFiles(
  videoPaths: string[],
  outputPath: string
): Promise<void> {
  if (videoPaths.length === 0) {
    throw new Error("No video files to concatenate");
  }

  if (videoPaths.length === 1) {
    await fs.copyFile(videoPaths[0], outputPath);
    return;
  }

  const ffmpegPath = getFfmpegPath();
  await fs.mkdir(TEMP_DIR, { recursive: true });

  const listPath = path.join(TEMP_DIR, `list-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
  // Use forward slashes and escape single quotes in paths for the concat demuxer
  const listContent = videoPaths
    .map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
    .join("\n");

  await fs.writeFile(listPath, listContent, "utf-8");

  try {
    await spawnFfmpeg(ffmpegPath, [
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-y",
      outputPath,
    ]);
    console.log(`[VideoConcat] ✅ Concatenated ${videoPaths.length} clips → ${path.basename(outputPath)}`);
  } finally {
    await fs.unlink(listPath).catch(() => {});
  }
}

function spawnFfmpeg(ffmpegBin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegBin, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stderrOutput = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      stderrOutput += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `ffmpeg exited with code ${code}.\nLast output:\n${stderrOutput.slice(-800)}`
          )
        );
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to start ffmpeg: ${err.message}`));
    });
  });
}
