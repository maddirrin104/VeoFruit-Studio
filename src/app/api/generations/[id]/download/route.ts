import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import ffmpegPath from "ffmpeg-static";
import { prisma } from "@/lib/prisma";

type GenerationDownloadRecord = {
  id: string;
  status: string | null;
  outputUrl: string | null;
  voiceSettings: unknown;
};

function extractAudioUrl(voiceSettings: unknown): string | null {
  if (!voiceSettings || typeof voiceSettings !== "object") {
    return null;
  }

  const settings = voiceSettings as Record<string, unknown>;
  return typeof settings.audioUrl === "string" ? settings.audioUrl : null;
}

async function downloadToFile(url: string, filePath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
  }

  const data = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, data);
}

async function materializeAudioInput(audioUrl: string, audioInputPath: string): Promise<void> {
  if (audioUrl.startsWith("/")) {
    const localPath = path.join(process.cwd(), "public", audioUrl.replace(/^\//, ""));
    await fs.copyFile(localPath, audioInputPath);
    return;
  }

  await downloadToFile(audioUrl, audioInputPath);
}

function normalizeRootAliasPath(inputPath: string): string {
  if (!inputPath) {
    return inputPath;
  }

  // Next server runtime may return paths like /ROOT/node_modules/... from bundled modules.
  if (/^[\\/]+ROOT[\\/]/i.test(inputPath)) {
    return path.join(process.cwd(), inputPath.replace(/^[\\/]+ROOT[\\/]?/i, ""));
  }

  return inputPath;
}

async function canAccessFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveFfmpegBinary(): Promise<string> {
  const candidates: string[] = [];

  if (ffmpegPath) {
    candidates.push(ffmpegPath);
    candidates.push(normalizeRootAliasPath(ffmpegPath));
  }

  const platformBinary = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  candidates.push(path.join(process.cwd(), "node_modules", "ffmpeg-static", platformBinary));

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (await canAccessFile(candidate)) {
      return candidate;
    }
  }

  // Final fallback to system PATH if ffmpeg is installed globally.
  return "ffmpeg";
}

async function muxVideoWithAudio(
  videoInputPath: string,
  audioInputPath: string,
  outputPath: string
): Promise<void> {
  const ffmpegBinary = await resolveFfmpegBinary();

  await new Promise<void>((resolve, reject) => {
    const args = [
      "-y",
      "-i",
      videoInputPath,
      "-i",
      audioInputPath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-shortest",
      outputPath,
    ];

    const ffmpeg = spawn(ffmpegBinary, args, { windowsHide: true });
    let stderr = "";

    ffmpeg.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", (error: Error) => {
      reject(error);
    });

    ffmpeg.on("close", (code: number | null) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code}. ${stderr}`));
    });
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let tempDir: string | null = null;

  try {
    const { id: generationId } = await context.params;

    const generation = (await prisma.videoGeneration.findUnique({
      where: { id: generationId },
    })) as GenerationDownloadRecord | null;

    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    if (generation.status !== "completed" || !generation.outputUrl) {
      return NextResponse.json(
        { error: "Video is not ready for download" },
        { status: 400 }
      );
    }

    const audioUrl = extractAudioUrl(generation.voiceSettings);
    if (!audioUrl) {
      return NextResponse.json(
        { error: "Voice-over audio is not available for this generation" },
        { status: 400 }
      );
    }

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "veofruit-mux-"));
    const videoInputPath = path.join(tempDir, "video-input.mp4");
    const audioInputPath = path.join(tempDir, "audio-input.mp3");
    const outputPath = path.join(tempDir, "video-with-audio.mp4");

    await downloadToFile(generation.outputUrl, videoInputPath);
    await materializeAudioInput(audioUrl, audioInputPath);
    await muxVideoWithAudio(videoInputPath, audioInputPath, outputPath);

    const mergedVideo = await fs.readFile(outputPath);
    const fileName = `veofruit-generation-${generation.id}-with-audio.mp4`;

    return new NextResponse(mergedVideo, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/generations/[id]/download error:", error);
    return NextResponse.json(
      { error: "Failed to download video with audio" },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
