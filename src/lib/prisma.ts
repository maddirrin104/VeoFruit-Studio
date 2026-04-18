import { readFileSync } from "node:fs";
import { PrismaClient } from "@/generated/prisma";
import { getRuntimeSettingsFilePath } from "@/lib/runtime-settings";

if (!process.env.DATABASE_URL) {
  try {
    const raw = readFileSync(getRuntimeSettingsFilePath(), "utf-8");
    const parsed = JSON.parse(raw) as { databaseUrl?: string };
    const databaseUrl = parsed.databaseUrl?.trim();
    if (databaseUrl) {
      process.env.DATABASE_URL = databaseUrl;
    }
  } catch {
    // Ignore when runtime settings file does not exist yet.
  }
}

declare global {
  var __prisma: PrismaClient | undefined;
}

let prismaInitError: Error | null = null;

function createPrismaClientSafely(): PrismaClient {
  try {
    return new PrismaClient();
  } catch (error) {
    prismaInitError =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : "Failed to initialize PrismaClient");
    throw prismaInitError;
  }
}

function getOrCreatePrismaClient(): PrismaClient {
  if (globalThis.__prisma) {
    return globalThis.__prisma;
  }

  const client = createPrismaClientSafely();
  if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    try {
      const client = getOrCreatePrismaClient();
      return Reflect.get(client as unknown as object, prop, receiver);
    } catch (error) {
      const rootError =
        error instanceof Error
          ? error
          : prismaInitError || new Error("Failed to initialize Prisma client");
      throw rootError;
    }
  },
});

