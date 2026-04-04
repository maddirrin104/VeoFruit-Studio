import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function getPublicOrigin(request: Request): string {
  const configuredPublicBase = process.env.PUBLIC_APP_URL?.trim();
  if (configuredPublicBase) {
    try {
      const parsed = new URL(configuredPublicBase);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      console.warn("PUBLIC_APP_URL is invalid. Falling back to request origin.");
    }
  }

  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return url.origin;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File upload is required" }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 10MB or smaller" },
        { status: 400 }
      );
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported image format. Please use JPG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
    const outputPath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(outputPath, buffer);

    const url = `/uploads/${fileName}`;
    const absoluteUrl = `${getPublicOrigin(request)}${url}`;

    return NextResponse.json({
      data: {
        url,
        absoluteUrl,
        fileName,
      },
    });
  } catch (error) {
    console.error("POST /api/uploads/image error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
