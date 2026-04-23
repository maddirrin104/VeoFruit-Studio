import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPublicPath, getRuntimeStorageRoot } from "@/lib/runtime-path";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function resolveSafePublicPath(parts: string[]): Promise<string | null> {
  const normalized = parts
    .flatMap((item) => item.split("/"))
    .map((item) => decodeURIComponent(item).trim())
    .filter((item) => Boolean(item));

  if (normalized.length === 0) {
    return null;
  }

  if (normalized.some((item) => item === "." || item === ".." || item.includes("\\"))) {
    return null;
  }

  const roots = [path.resolve(getPublicPath()), path.resolve(getRuntimeStorageRoot())];

  for (const root of roots) {
    const candidate = path.resolve(root, ...normalized);
    if (candidate === root || candidate.startsWith(`${root}${path.sep}`)) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // Try the next storage root.
      }
    }
  }

  return null;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXTENSION[ext] || "application/octet-stream";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ assetPath: string[] }> }
) {
  try {
    const { assetPath } = await context.params;
    const filePath = await resolveSafePublicPath(assetPath || []);
    if (!filePath) {
      console.warn(`[Files API] Invalid asset path:`, assetPath?.join("/"));
      return NextResponse.json({ error: "Invalid asset path" }, { status: 400 });
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      console.warn(`[Files API] Asset not found: ${filePath}`);
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const contentType = getMimeType(filePath);
    const isMedia = contentType.startsWith("audio/") || contentType.startsWith("video/");

    console.log(`[Files API] Served asset: ${path.basename(filePath)} (${(fileBuffer.byteLength / 1024).toFixed(2)}KB, ${contentType})`);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.byteLength),
        "Cache-Control": isMedia ? "no-store" : "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("GET /api/files/[...assetPath] error:", error);
    return NextResponse.json({ error: "Failed to load asset" }, { status: 500 });
  }
}