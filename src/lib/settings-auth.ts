import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

const SETTINGS_DIR = path.join(os.homedir(), ".veofruit-studio");
const MACHINE_ID_FILE = path.join(SETTINGS_DIR, "machine-id");
const SESSION_TOKEN_FILE = path.join(SETTINGS_DIR, "session-token");
const AUTH_FILE = path.join(SETTINGS_DIR, "auth.json");

interface StoredAuth {
  passwordHash: string;
  passwordSalt: string;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
}

async function getMachineId(): Promise<string> {
  try {
    const text = await fs.readFile(MACHINE_ID_FILE, "utf-8");
    const trimmed = text.trim();
    if (trimmed.length >= 32) return trimmed;
  } catch {
    // Will generate new
  }

  const id = crypto.randomUUID();
  await ensureDir();
  await fs.writeFile(MACHINE_ID_FILE, id, "utf-8");
  return id;
}

function pbkdf2Hash(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 50_000, 64, "sha512").toString("hex");
}

function computeSessionToken(machineId: string, passwordHash: string): string {
  return crypto.createHmac("sha256", machineId).update(passwordHash).digest("hex");
}

function timingSafeHexEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function readStoredAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await fs.readFile(AUTH_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed != null &&
      typeof parsed === "object" &&
      typeof (parsed as StoredAuth).passwordHash === "string" &&
      typeof (parsed as StoredAuth).passwordSalt === "string"
    ) {
      return parsed as StoredAuth;
    }
  } catch {
    // File missing or malformed
  }
  return null;
}

export async function writeStoredAuth(data: StoredAuth): Promise<void> {
  await ensureDir();
  await fs.writeFile(AUTH_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export function hashNewPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString("hex");
  return { hash: pbkdf2Hash(password, salt), salt };
}

export function checkPasswordAgainstHash(password: string, auth: StoredAuth): boolean {
  try {
    const computed = pbkdf2Hash(password, auth.passwordSalt);
    return timingSafeHexEqual(computed, auth.passwordHash);
  } catch {
    return false;
  }
}

export async function isSessionValid(passwordHash: string): Promise<boolean> {
  try {
    const [machineId, storedToken] = await Promise.all([
      getMachineId(),
      fs.readFile(SESSION_TOKEN_FILE, "utf-8").then((t) => t.trim()),
    ]);

    if (!storedToken || storedToken.length < 16) return false;

    const expected = computeSessionToken(machineId, passwordHash);
    return timingSafeHexEqual(storedToken, expected);
  } catch {
    return false;
  }
}

export async function persistSession(passwordHash: string): Promise<void> {
  const machineId = await getMachineId();
  const token = computeSessionToken(machineId, passwordHash);
  await ensureDir();
  await fs.writeFile(SESSION_TOKEN_FILE, token, "utf-8");
}

export async function revokeSession(): Promise<void> {
  try {
    await fs.unlink(SESSION_TOKEN_FILE);
  } catch {
    // ENOENT is fine
  }
}
