import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CreateProjectRequest } from "@/types/api";

const DEMO_USER_EMAIL = "demo@veofruit.local";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const projects = await prisma.videoProject.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ data: projects });
}

export async function POST(request: Request) {
  let body: CreateProjectRequest;

  try {
    body = (await request.json()) as CreateProjectRequest;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const title = body.title?.trim();
  if (!title) {
    return badRequest("Field 'title' is required");
  }

  if (body.numberOfScenes !== undefined && body.numberOfScenes < 1) {
    return badRequest("Field 'numberOfScenes' must be >= 1");
  }

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      fullName: "Demo User",
      passwordHash: "demo-password-hash",
    },
  });

  const project = await prisma.videoProject.create({
    data: {
      userId: user.id,
      title,
      storyTopic: body.storyTopic?.trim() || null,
      videoGenre: body.videoGenre?.trim() || null,
      numberOfScenes: body.numberOfScenes ?? null,
      status: "draft",
    },
  });

  return NextResponse.json({ data: project }, { status: 201 });
}
