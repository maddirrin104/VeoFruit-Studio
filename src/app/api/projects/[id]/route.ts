import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateProjectRequest } from "@/types/studio";
import { Prisma } from "@/generated/prisma";

function mapServerErrorToMessage(error: unknown): { message: string; status: number } {
  const message = (error as Error)?.message || "Unexpected server error";
  const normalized = message.toLowerCase();

  if (normalized.includes("environment variable not found: database_url")) {
    return {
      message:
        "DATABASE_URL chưa được cấu hình cho app desktop. Hãy vào Settings API, nhập DATABASE_URL rồi bấm Lưu Settings, sau đó mở lại app.",
      status: 400,
    };
  }

  if (
    normalized.includes("relation") &&
    (normalized.includes("does not exist") || normalized.includes("doesn't exist"))
  ) {
    return {
      message:
        "Database chưa có đủ bảng. Hãy chạy file database_setup.sql vào đúng database đang dùng trong DATABASE_URL.",
      status: 400,
    };
  }

  if (
    normalized.includes("econnrefused") ||
    normalized.includes("can't reach database server") ||
    normalized.includes("could not connect")
  ) {
    return {
      message:
        "Không kết nối được PostgreSQL. Hãy kiểm tra container/database đang chạy và DATABASE_URL trỏ đúng host:port.",
      status: 400,
    };
  }

  return {
    message: "Failed to update project",
    status: 500,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;

    const project = await prisma.videoProject.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...project,
        videoConfig: project.videoConfig,
        imageConfig: project.imageConfig,
        audioConfig: project.audioConfig,
      },
    });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const body = (await request.json()) as UpdateProjectRequest;

    // Verify project exists
    const existingProject = await prisma.videoProject.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: Prisma.VideoProjectUpdateInput = {
      title: body.title ?? existingProject?.title,
      storyTopic: body.storyTopic ?? existingProject?.storyTopic,
      characterDescription: body.characterDescription ?? existingProject?.characterDescription,
      script: body.script ?? existingProject?.script,
      contentTone: body.contentTone ?? existingProject?.contentTone,
      videoGenre: body.videoGenre ?? existingProject?.videoGenre,
      numberOfScenes: body.numberOfScenes ?? existingProject?.numberOfScenes,
      videoConfig: body.videoConfig
        ? (body.videoConfig as Prisma.InputJsonValue)
        : existingProject?.videoConfig ?? Prisma.JsonNull,
      imageConfig: body.imageConfig
        ? (body.imageConfig as Prisma.InputJsonValue)
        : existingProject?.imageConfig ?? Prisma.JsonNull,
      audioConfig: body.audioConfig
        ? (body.audioConfig as Prisma.InputJsonValue)
        : existingProject?.audioConfig ?? Prisma.JsonNull,
    };

    const updatedProject = await prisma.videoProject.update({
      where: { id: projectId },
      data: updateData,
    });

    return NextResponse.json(
      {
        data: {
          ...updatedProject,
          videoConfig: body.videoConfig ?? null,
          imageConfig: body.imageConfig ?? null,
          audioConfig: body.audioConfig ?? null,
        },
        message: "Project updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    const mapped = mapServerErrorToMessage(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;

    const project = await prisma.videoProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete all generations first
    await prisma.videoGeneration.deleteMany({
      where: { projectId },
    });

    // Delete project
    await prisma.videoProject.delete({
      where: { id: projectId },
    });

    return NextResponse.json(
      { data: { id: projectId, deleted: true }, message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
