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
    });

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

    // Parse multi-scene progress from thumbnailUrl: "progress:3/7"
    const progressMatch =
      typeof generation?.thumbnailUrl === "string" &&
      generation.thumbnailUrl.startsWith("progress:")
        ? generation.thumbnailUrl.slice("progress:".length).match(/^(\d+)\/(\d+)$/)
        : null;
    const progressCurrent = progressMatch ? parseInt(progressMatch[1], 10) : null;
    const progressTotal = progressMatch ? parseInt(progressMatch[2], 10) : null;
    const progressPercent =
      progressCurrent !== null && progressTotal !== null && progressTotal > 0
        ? Math.round((progressCurrent / progressTotal) * 100)
        : 0;

    const isRunwayProcessing =
      typeof generation?.thumbnailUrl === "string" &&
      generation.thumbnailUrl === "runway:processing";

    const progressMessage =
      progressCurrent !== null && progressTotal !== null
        ? `Đang tạo cảnh ${progressCurrent}/${progressTotal}...`
        : isRunwayProcessing
        ? "Runway đang tạo video, vui lòng chờ... (thường mất 2–5 phút)"
        : null;

    const voiceSettings =
      generation?.voiceSettings && typeof generation.voiceSettings === "object"
        ? (generation.voiceSettings as Record<string, unknown>)
        : null;

    const rawAudioUrl =
      voiceSettings && typeof voiceSettings.audioUrl === "string"
        ? voiceSettings.audioUrl
        : undefined;

    // Only expose the standalone audioUrl when mux failed or was skipped (external video URL).
    // If mux succeeded, the audio is already embedded in the video — returning audioUrl here
    // would cause PreviewPanel to play the MP3 in sync alongside the video's own audio track,
    // creating a doubled/echo effect that the user perceives as "no audio".
    const muxSucceeded =
      rawAudioUrl &&
      typeof generation.outputUrl === "string" &&
      generation.outputUrl.startsWith("/api/files/") &&
      !voiceSettings?.muxError;

    const audioUrl = muxSucceeded ? undefined : rawAudioUrl;

    const audioErrorMessage =
      voiceSettings?.status === "failed" && typeof voiceSettings?.error === "string"
        ? `[FPT AI TTS] ${voiceSettings.error}`
        : typeof voiceSettings?.muxError === "string"
        ? `[Audio Mux] Video đã tạo xong nhưng không thể ghép âm thanh vào file MP4. Lý do: ${voiceSettings.muxError}`
        : undefined;

    const voiceTypeApplied =
      voiceSettings && typeof voiceSettings.voiceGender === "string"
        ? voiceSettings.voiceGender
        : undefined;

    const voiceIdApplied =
      voiceSettings && typeof voiceSettings.voiceId === "string"
        ? voiceSettings.voiceId
        : undefined;

    const voiceConfigApplied =
      voiceSettings &&
      typeof voiceSettings.voiceConfig === "object" &&
      voiceSettings.voiceConfig !== null
        ? voiceSettings.voiceConfig
        : undefined;

    return NextResponse.json({
      data: {
        id: generation.id,
        projectId: generation.projectId,
        status: generation?.status || "pending",
        progress: progressPercent,
        progressMessage,
        videoUrl: generation?.outputUrl,
        audioUrl,
        voiceTypeApplied,
        voiceIdApplied,
        voiceConfigApplied,
        errorMessage: persistedError,
        audioErrorMessage,
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
