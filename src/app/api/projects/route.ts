import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CreateProjectRequest } from "@/types/api";
import { Prisma } from "@/generated/prisma";

const DEMO_USER_EMAIL = "demo@veofruit.local";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

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
    message: "Failed to create project",
    status: 500,
  };
}

export async function GET() {
  try {
    const projects = await prisma.videoProject.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    const mapped = mapServerErrorToMessage(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
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

  try {
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
        characterDescription: body.characterDescription?.trim() || null,
        script: body.script?.trim() || null,
        contentTone: body.contentTone?.trim() || null,
        videoGenre: body.videoGenre?.trim() || null,
        numberOfScenes: body.numberOfScenes ?? null,
        status: "draft",
        videoConfig: body.videoConfig ? (body.videoConfig as Prisma.InputJsonValue) : Prisma.JsonNull,
        imageConfig: body.imageConfig ? (body.imageConfig as Prisma.InputJsonValue) : Prisma.JsonNull,
        audioConfig: body.audioConfig ? (body.audioConfig as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    const mapped = mapServerErrorToMessage(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
