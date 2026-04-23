import { readFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@/generated/prisma/index.js";
import {
  getDefaultLocalDatabaseFilePath,
  getDefaultLocalDatabaseUrl,
  getRuntimeSettingsFilePath,
  normalizeDatabaseUrl,
} from "@/lib/runtime-settings";

function isDesktopRuntime(): boolean {
  return Boolean(process.env.VEOFRUIT_APP_ROOT?.trim());
}

if (isDesktopRuntime()) {
  try {
    const raw = readFileSync(getRuntimeSettingsFilePath(), "utf-8");
    const parsed = JSON.parse(raw) as { databaseUrl?: string };
    const databaseUrl = normalizeDatabaseUrl(parsed.databaseUrl);
    if (databaseUrl && databaseUrl.toLowerCase().startsWith("file:")) {
      process.env.DATABASE_URL = databaseUrl;
    } else {
      process.env.DATABASE_URL = getDefaultLocalDatabaseUrl();
    }
  } catch {
    process.env.DATABASE_URL = getDefaultLocalDatabaseUrl();
  }
} else {
  try {
    const raw = readFileSync(getRuntimeSettingsFilePath(), "utf-8");
    const parsed = JSON.parse(raw) as { databaseUrl?: string };
    const savedDatabaseUrl = normalizeDatabaseUrl(parsed.databaseUrl);
    const envDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
    const databaseUrlCandidate = savedDatabaseUrl || envDatabaseUrl;

    if (databaseUrlCandidate && databaseUrlCandidate.toLowerCase().startsWith("file:")) {
      process.env.DATABASE_URL = databaseUrlCandidate;
    } else {
      process.env.DATABASE_URL = getDefaultLocalDatabaseUrl();
    }
  } catch {
    const envDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
    if (envDatabaseUrl && envDatabaseUrl.toLowerCase().startsWith("file:")) {
      process.env.DATABASE_URL = envDatabaseUrl;
    } else {
      process.env.DATABASE_URL = getDefaultLocalDatabaseUrl();
    }
  }
}

declare global {
  var __prismaPromise: Promise<PrismaClient> | undefined;
}

function isSqliteDatabaseUrl(url: string): boolean {
  return url.trim().toLowerCase().startsWith("file:");
}

// SQLite DDL matching prisma/schema.prisma — executed via $executeRawUnsafe at runtime
// so we never need to spawn the Prisma CLI from inside the packaged Electron app.
const SQLITE_INIT_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
  `CREATE TABLE IF NOT EXISTS "video_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "story_topic" TEXT,
    "character_description" TEXT,
    "script" TEXT,
    "content_tone" TEXT,
    "video_genre" TEXT,
    "number_of_scenes" INTEGER,
    "status" TEXT,
    "video_config" TEXT,
    "image_config" TEXT,
    "audio_config" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "video_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "video_projects_user_id_idx" ON "video_projects"("user_id")`,
  `CREATE TABLE IF NOT EXISTS "video_generations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "generation_no" INTEGER NOT NULL,
    "ai_model" TEXT,
    "resolution" TEXT,
    "aspect_ratio" TEXT,
    "voice_settings" TEXT,
    "status" TEXT,
    "output_url" TEXT,
    "thumbnail_url" TEXT,
    "duration_seconds" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "video_generations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "video_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "video_generations_project_id_idx" ON "video_generations"("project_id")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "video_generations_project_id_generation_no_key" ON "video_generations"("project_id", "generation_no")`,
  `CREATE TABLE IF NOT EXISTS "video_scenes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generation_id" TEXT NOT NULL,
    "scene_order" INTEGER NOT NULL,
    "prompt_text" TEXT,
    "image_url" TEXT,
    "audio_url" TEXT,
    CONSTRAINT "video_scenes_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "video_generations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "video_scenes_generation_id_idx" ON "video_scenes"("generation_id")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "video_scenes_generation_id_scene_order_key" ON "video_scenes"("generation_id", "scene_order")`,
];

async function ensureSqliteSchema(client: PrismaClient): Promise<void> {
  for (const sql of SQLITE_INIT_STATEMENTS) {
    try {
      await client.$executeRawUnsafe(sql);
    } catch (err) {
      const msg = ((err as Error)?.message ?? "").toLowerCase();
      if (!msg.includes("already exists")) {
        throw err;
      }
    }
  }
}

async function createAndInitPrismaClient(): Promise<PrismaClient> {
  const databaseUrlCandidate = process.env.DATABASE_URL ?? getDefaultLocalDatabaseUrl();
  const databaseUrl =
    typeof databaseUrlCandidate === "string" && databaseUrlCandidate.trim().length > 0
      ? databaseUrlCandidate.trim()
      : getDefaultLocalDatabaseUrl();

  process.env.DATABASE_URL = databaseUrl;

  if (isSqliteDatabaseUrl(databaseUrl)) {
    const dbFilePath = getDefaultLocalDatabaseFilePath();
    mkdirSync(path.dirname(dbFilePath), { recursive: true });
  }

  const client = new PrismaClient();

  if (isSqliteDatabaseUrl(databaseUrl)) {
    await ensureSqliteSchema(client);
  }

  return client;
}

let _moduleClientPromise: Promise<PrismaClient> | null = null;

function getPrismaClientPromise(): Promise<PrismaClient> {
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__prismaPromise) {
      globalThis.__prismaPromise = createAndInitPrismaClient();
    }
    return globalThis.__prismaPromise;
  }

  if (!_moduleClientPromise) {
    _moduleClientPromise = createAndInitPrismaClient();
  }
  return _moduleClientPromise;
}

type AnyRecord = Record<string | symbol, unknown>;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const propKey = prop as string;

    // Direct client methods: $connect, $disconnect, $executeRaw, $executeRawUnsafe, etc.
    if (typeof propKey === "string" && propKey.startsWith("$")) {
      return (...args: unknown[]) =>
        getPrismaClientPromise().then((client) => {
          const method = (client as unknown as AnyRecord)[propKey];
          if (typeof method === "function") {
            return (method as (...a: unknown[]) => unknown).apply(client, args);
          }
        });
    }

    // Model delegates: user, videoProject, videoGeneration, videoScene
    return new Proxy({} as object, {
      get(_delegateTarget, methodProp: string | symbol) {
        return (...args: unknown[]) =>
          getPrismaClientPromise().then((client) => {
            const delegate = (client as unknown as AnyRecord)[propKey];
            if (delegate !== null && typeof delegate === "object") {
              const method = (delegate as AnyRecord)[methodProp];
              if (typeof method === "function") {
                return (method as (...a: unknown[]) => unknown).apply(delegate, args);
              }
            }
            throw new Error(
              `Prisma: ${propKey}.${String(methodProp)} is not a function`
            );
          });
      },
    });
  },
});
