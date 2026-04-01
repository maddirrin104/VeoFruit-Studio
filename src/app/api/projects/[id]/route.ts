import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateProjectRequest } from "@/types/studio";
import { Prisma } from "@prisma/client";

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
        videoConfig: null,
        imageConfig: null,
        audioConfig: null,
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
      videoGenre: body.videoGenre ?? existingProject?.videoGenre,
      numberOfScenes: body.numberOfScenes ?? existingProject?.numberOfScenes,
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
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
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
      { message: "Project deleted successfully" },
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
