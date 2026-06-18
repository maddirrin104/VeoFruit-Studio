import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { getAppRoot, getPublicPath } from "@/lib/runtime-path";

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

export interface PlayableAudioNormalizationResult {
  buffer: Buffer;
  durationSeconds?: number;
}

function normalizeRootAliasPath(inputPath: string): string {
  if (!inputPath) {
    return inputPath;
  }

  // Next server runtime may return paths like /ROOT/node_modules/... from bundled modules.
  if (/^[\\/]+ROOT[\\/]/i.test(inputPath)) {
    return path.join(getAppRoot(), inputPath.replace(/^[\\/]+ROOT[\\/]?/i, ""));
  }

  return inputPath;
}

function normalizeAsarUnpackedPath(inputPath: string): string {
  if (!inputPath) {
    return inputPath;
  }

  return inputPath.replace(/\.asar([\\/])/i, ".asar.unpacked$1");
}

async function canAccessFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Electron intercepts fs.access() for paths inside .asar archives and returns true,
// but the OS cannot spawn binaries from inside an asar archive (only .asar.unpacked works).
function isInsideAsar(filePath: string): boolean {
  return /\.asar[\\/]/i.test(filePath) && !/\.asar\.unpacked[\\/]/i.test(filePath);
}

async function resolveFfmpegBinaryPath(): Promise<string> {
  const candidates: string[] = [];

  if (ffmpegPath) {
    const rootAliasPath = normalizeRootAliasPath(ffmpegPath);
    // Prioritize .asar.unpacked variants — these are the actual files on disk.
    candidates.push(normalizeAsarUnpackedPath(ffmpegPath));
    candidates.push(normalizeAsarUnpackedPath(rootAliasPath));
    candidates.push(ffmpegPath);
    candidates.push(rootAliasPath);
  }

  const platformBinary = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const localNodeModulesPath = path.join(getAppRoot(), "node_modules", "ffmpeg-static", platformBinary);
  candidates.push(normalizeAsarUnpackedPath(localNodeModulesPath));
  candidates.push(localNodeModulesPath);

  for (const candidate of candidates) {
    if (!candidate || isInsideAsar(candidate)) {
      continue;
    }

    if (await canAccessFile(candidate)) {
      return candidate;
    }
  }

  // Final fallback to system PATH if ffmpeg is installed globally.
  return "ffmpeg";
}

function buildTempPath(extension: string): string {
  return path.join(os.tmpdir(), `veofruit-${randomUUID()}.${extension}`);
}

async function runFfmpeg(args: string[]): Promise<string> {
  const binary = await resolveFfmpegBinaryPath();
  console.info(`[ffmpeg] binary=${binary} args=${args.slice(0, 4).join(" ")}...`);

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

export async function getAudioDurationSecondsFromBuffer(
  inputBuffer: Buffer,
  inputExtension: "mp3" | "wav" = "mp3"
): Promise<number | undefined> {
  const inputPath = buildTempPath(inputExtension);

  try {
    await fs.writeFile(inputPath, inputBuffer);
    return await readAudioDurationSeconds(inputPath);
  } finally {
    await Promise.allSettled([fs.unlink(inputPath)]);
  }
}

export async function transcodeAudioBufferToMp3(
  inputBuffer: Buffer,
  inputExtension: "mp3" | "wav" = "mp3"
): Promise<PlayableAudioNormalizationResult> {
  const inputPath = buildTempPath(inputExtension);
  const outputPath = buildTempPath("mp3");

  try {
    await fs.writeFile(inputPath, inputBuffer);
    await runFfmpeg([
      "-y",
      "-i",
      inputPath,
      "-vn",
      "-c:a",
      "libmp3lame",
      "-q:a",
      "3",
      outputPath,
    ]);

    const outputBuffer = await fs.readFile(outputPath);
    const durationSeconds = await readAudioDurationSeconds(outputPath);

    return {
      buffer: outputBuffer,
      durationSeconds,
    };
  } finally {
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);
  }
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
    return path.isAbsolute(fromEnv) ? fromEnv : path.join(getAppRoot(), fromEnv);
  }

  return getPublicPath("bg-music", "default.mp3");
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

export async function padOrTrimAudioToSeconds(
  inputBuffer: Buffer,
  targetSeconds: number,
  inputExtension: "mp3" | "wav" = "mp3"
): Promise<Buffer> {
  const inputPath = buildTempPath(inputExtension);
  const outputPath = buildTempPath("mp3");

  try {
    await fs.writeFile(inputPath, inputBuffer);
    await runFfmpeg([
      "-y",
      "-i", inputPath,
      "-af", "apad",
      "-t", String(targetSeconds),
      "-c:a", "libmp3lame",
      "-q:a", "3",
      outputPath,
    ]);
    return await fs.readFile(outputPath);
  } finally {
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);
  }
}

export async function generateSilenceBuffer(durationSeconds: number): Promise<Buffer> {
  const outputPath = buildTempPath("mp3");

  try {
    await runFfmpeg([
      "-y",
      "-f", "lavfi",
      "-i", "anullsrc=r=44100:cl=mono",
      "-t", String(durationSeconds),
      "-c:a", "libmp3lame",
      "-q:a", "3",
      outputPath,
    ]);
    return await fs.readFile(outputPath);
  } finally {
    await Promise.allSettled([fs.unlink(outputPath)]);
  }
}

export async function concatenateAudioBuffers(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 0) throw new Error("No audio buffers to concatenate");
  if (buffers.length === 1) return buffers[0];

  const inputPaths: string[] = [];
  const outputPath = buildTempPath("mp3");

  try {
    for (const buffer of buffers) {
      const p = buildTempPath("mp3");
      await fs.writeFile(p, buffer);
      inputPaths.push(p);
    }

    const inputArgs = inputPaths.flatMap((p) => ["-i", p]);
    const filterInputs = inputPaths.map((_, i) => `[${i}:a]`).join("");
    const filterComplex = `${filterInputs}concat=n=${inputPaths.length}:v=0:a=1[out]`;

    await runFfmpeg([
      "-y",
      ...inputArgs,
      "-filter_complex", filterComplex,
      "-map", "[out]",
      "-c:a", "libmp3lame",
      "-q:a", "3",
      outputPath,
    ]);

    return await fs.readFile(outputPath);
  } finally {
    await Promise.allSettled([
      ...inputPaths.map((p) => fs.unlink(p)),
      fs.unlink(outputPath),
    ]);
  }
}

export async function muxAudioIntoVideoFile(
  videoFilePath: string,
  audioFilePath: string
): Promise<void> {
  // Validate files exist
  try {
    await fs.access(videoFilePath);
  } catch {
    throw new Error(`Video file not found: ${videoFilePath}`);
  }

  try {
    await fs.access(audioFilePath);
  } catch {
    throw new Error(`Audio file not found: ${audioFilePath}`);
  }

  const tempOutput = buildTempPath("mp4");
  try {
    await runFfmpeg([
      "-y",
      "-i", videoFilePath,
      "-i", audioFilePath,
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-c:v", "copy",
      "-c:a", "aac",
      "-af", "apad",
      "-shortest",
      tempOutput,
    ]);
    await fs.copyFile(tempOutput, videoFilePath);
  } finally {
    await Promise.allSettled([fs.unlink(tempOutput)]);
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