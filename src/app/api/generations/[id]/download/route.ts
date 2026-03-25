import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await context.params;

    const generation = (await prisma.videoGeneration.findUnique({
      where: { id: generationId },
    })) as {
      id: string;
      status: string | null;
      outputUrl: string | null;
    } | null;

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

    const upstream = await fetch(generation.outputUrl);

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Failed to fetch generated video" },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "video/mp4";
    const extension = contentType.includes("webm") ? "webm" : "mp4";
    const fileName = `veofruit-generation-${generation.id}.${extension}`;

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/generations/[id]/download error:", error);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 }
    );
  }
}
