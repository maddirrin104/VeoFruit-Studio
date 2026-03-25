import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await context.params;

    const generation = await prisma.videoGeneration.findUnique({
      where: { id: generationId },
    }) as any;

    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    // Calculate estimated time remaining based on progress
    const createdAt = new Date(generation?.createdAt);
    const elapsedSeconds = (Date.now() - createdAt.getTime()) / 1000;
    const estimatedTotalSeconds = Math.max(180, 30);
    const estimatedRemaining = Math.max(
      estimatedTotalSeconds - elapsedSeconds,
      0
    );

    const persistedError =
      typeof generation?.thumbnailUrl === "string" &&
      generation.thumbnailUrl.startsWith("error:")
        ? generation.thumbnailUrl.slice("error:".length)
        : null;

    const voiceSettings =
      generation?.voiceSettings && typeof generation.voiceSettings === "object"
        ? (generation.voiceSettings as Record<string, unknown>)
        : null;

    const audioUrl =
      voiceSettings && typeof voiceSettings.audioUrl === "string"
        ? voiceSettings.audioUrl
        : undefined;

    return NextResponse.json({
      data: {
        id: generation.id,
        projectId: generation.projectId,
        status: generation?.status || "pending",
        progress: 0,
        videoUrl: generation?.outputUrl,
        audioUrl,
        errorMessage: persistedError,
        estimatedTimeRemaining: `${Math.ceil(estimatedRemaining)}s`,
        createdAt: generation.createdAt,
        updatedAt: generation.createdAt,
      },
    });
  } catch (error) {
    console.error("GET /api/generations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch generation status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await context.params;

    const generation = await prisma.videoGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    // Only allow delete if not processing
    if (generation.status === "processing") {
      return NextResponse.json(
        { error: "Cannot delete generation while processing" },
        { status: 400 }
      );
    }

    await prisma.videoGeneration.delete({
      where: { id: generationId },
    });

    return NextResponse.json({
      message: "Generation deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/generations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete generation" },
      { status: 500 }
    );
  }
}
