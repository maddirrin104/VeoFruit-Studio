import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

export interface OptimizeVoiceOverOptions {
  inputBuffer: Buffer;
  targetDurationSeconds?: number;
  inputExtension?: "mp3" | "wav";
}

export interface OptimizeVoiceOverResult {
  buffer: Buffer;
  durationBeforeSeconds?: number;
  durationAfterSeconds?: number;
  speedFactorApplied?: number;
  trimmedSilence: boolean;
}

export interface MixBackgroundMusicOptions {
  voiceBuffer: Buffer;
  voiceDurationSeconds?: number;
  outputExtension?: "mp3" | "wav";
}

function resolveFfmpegBinaryPath(): string {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary path is not available");
  }

  return ffmpegPath;
}

function buildTempPath(extension: string): string {
  return path.join(os.tmpdir(), `veofruit-${randomUUID()}.${extension}`);
}

async function runFfmpeg(args: string[]): Promise<string> {
  const binary = resolveFfmpegBinaryPath();

  return new Promise((resolve, reject) => {
    const process = spawn(binary, args, {
      windowsHide: true,
    });

    let stderr = "";

    process.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    process.on("error", (error) => reject(error));

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stderr);
        return;
      }

      reject(new Error(`ffmpeg failed with code ${code}: ${stderr.slice(-800)}`));
    });
  });
}

function parseDurationFromFfmpegLog(log: string): number | undefined {
  const matched = log.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/i);
  if (!matched) {
    return undefined;
  }

  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);
  const seconds = Number(matched[3]);

  if ([hours, minutes, seconds].some((value) => Number.isNaN(value))) {
    return undefined;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

async function readAudioDurationSeconds(inputPath: string): Promise<number | undefined> {
  const log = await runFfmpeg(["-hide_banner", "-i", inputPath, "-f", "null", "-"]);
  return parseDurationFromFfmpegLog(log);
}

function buildAtempoChain(speedFactor: number): string {
  const factors: number[] = [];
  let remaining = speedFactor;

  while (remaining > 2) {
    factors.push(2);
    remaining /= 2;
  }

  while (remaining < 0.5) {
    factors.push(0.5);
    remaining /= 0.5;
  }

  factors.push(Number(remaining.toFixed(3)));
  return factors.map((factor) => `atempo=${factor}`).join(",");
}

function resolveBackgroundMusicPath(): string {
  const fromEnv = process.env.BACKGROUND_MUSIC_PATH?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.join(process.cwd(), fromEnv);
  }

  return path.join(process.cwd(), "public", "bg-music", "default.mp3");
}

export async function optimizeVoiceOverAudio(
  options: OptimizeVoiceOverOptions
): Promise<OptimizeVoiceOverResult> {
  const inputExtension = options.inputExtension ?? "mp3";
  const inputPath = buildTempPath(inputExtension);
  const trimmedPath = buildTempPath("mp3");
  const stretchedPath = buildTempPath("mp3");

  let resultBuffer = options.inputBuffer;

  try {
    await fs.writeFile(inputPath, options.inputBuffer);
    const durationBefore = await readAudioDurationSeconds(inputPath);

    await runFfmpeg([
      "-y",
      "-i",
      inputPath,
      "-af",
      "silenceremove=start_periods=1:start_silence=0.2:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.2:start_threshold=-45dB,areverse",
      "-c:a",
      "libmp3lame",
      "-q:a",
      "3",
      trimmedPath,
    ]);

    const durationAfterTrim = await readAudioDurationSeconds(trimmedPath);
    let durationAfter = durationAfterTrim;
    let speedFactorApplied: number | undefined;

    if (
      durationAfterTrim &&
      options.targetDurationSeconds &&
      options.targetDurationSeconds >= 2
    ) {
      const rawFactor = durationAfterTrim / options.targetDurationSeconds;
      const clampedFactor = Math.min(1.25, Math.max(0.85, rawFactor));
      const needsSpeedAdjust = Math.abs(durationAfterTrim - options.targetDurationSeconds) > 0.35;

      if (needsSpeedAdjust && Number.isFinite(clampedFactor)) {
        speedFactorApplied = Number(clampedFactor.toFixed(3));

        await runFfmpeg([
          "-y",
          "-i",
          trimmedPath,
          "-af",
          buildAtempoChain(clampedFactor),
          "-c:a",
          "libmp3lame",
          "-q:a",
          "3",
          stretchedPath,
        ]);

        durationAfter = await readAudioDurationSeconds(stretchedPath);
        resultBuffer = await fs.readFile(stretchedPath);
      } else {
        resultBuffer = await fs.readFile(trimmedPath);
      }
    } else {
      resultBuffer = await fs.readFile(trimmedPath);
    }

    return {
      buffer: resultBuffer,
      durationBeforeSeconds: durationBefore,
      durationAfterSeconds: durationAfter,
      speedFactorApplied,
      trimmedSilence: true,
    };
  } finally {
    await Promise.allSettled([
      fs.unlink(inputPath),
      fs.unlink(trimmedPath),
      fs.unlink(stretchedPath),
    ]);
  }
}

export async function mixBackgroundMusic(
  options: MixBackgroundMusicOptions
): Promise<{ buffer: Buffer; mixed: boolean; reason?: string }> {
  const musicPath = resolveBackgroundMusicPath();
  const outputExtension = options.outputExtension ?? "mp3";

  try {
    await fs.access(musicPath);
  } catch {
    return {
      buffer: options.voiceBuffer,
      mixed: false,
      reason: "Background music file is missing",
    };
  }

  const inputPath = buildTempPath("mp3");
  const outputPath = buildTempPath(outputExtension);
  const targetDuration =
    options.voiceDurationSeconds && options.voiceDurationSeconds > 1
      ? Number(options.voiceDurationSeconds.toFixed(2))
      : undefined;

  try {
    await fs.writeFile(inputPath, options.voiceBuffer);

    const filter = targetDuration
      ? `[1:a]volume=0.12,atrim=0:${targetDuration},asetpts=N/SR/TB[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[mix]`
      : "[1:a]volume=0.12[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[mix]";

    await runFfmpeg([
      "-y",
      "-i",
      inputPath,
      "-stream_loop",
      "-1",
      "-i",
      musicPath,
      "-filter_complex",
      filter,
      "-map",
      "[mix]",
      "-c:a",
      "libmp3lame",
      "-q:a",
      "3",
      outputPath,
    ]);

    return {
      buffer: await fs.readFile(outputPath),
      mixed: true,
    };
  } catch (error) {
    return {
      buffer: options.voiceBuffer,
      mixed: false,
      reason: (error as Error)?.message || "Failed to mix background music",
    };
  } finally {
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);
  }
}