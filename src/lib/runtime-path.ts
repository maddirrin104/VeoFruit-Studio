import os from "node:os";
import path from "node:path";

const APP_ROOT_ENV = "VEOFRUIT_APP_ROOT";
const RUNTIME_STORAGE_ROOT_ENV = "VEOFRUIT_RUNTIME_STORAGE_ROOT";
const FILES_API_PREFIX = "/api/files/";

function getDefaultRuntimeStorageRoot(): string {
  return path.join(os.homedir(), ".veofruit-studio", "runtime-media");
}

export function getAppRoot(): string {
  const configuredRoot = process.env[APP_ROOT_ENV]?.trim();
  return configuredRoot || process.cwd();
}

export function getRuntimeStorageRoot(): string {
  const configuredRoot = process.env[RUNTIME_STORAGE_ROOT_ENV]?.trim();
  return configuredRoot || getDefaultRuntimeStorageRoot();
}

export function getPublicPath(...segments: string[]): string {
  return path.join(getAppRoot(), "public", ...segments);
}

export function getRuntimeMediaPath(...segments: string[]): string {
  return path.join(getRuntimeStorageRoot(), ...segments);
}

export function buildFilesApiPath(...segments: string[]): string {
  const normalized = segments
    .flatMap((segment) => segment.split("/"))
    .map((segment) => segment.trim())
    .filter((segment) => Boolean(segment) && segment !== "." && segment !== "..")
    .map((segment) => encodeURIComponent(segment));

  return `${FILES_API_PREFIX}${normalized.join("/")}`;
}

export function resolvePublicPathFromRequestPath(requestPath: string): string | null {
  const normalizedPath = requestPath.trim();
  if (!normalizedPath) {
    return null;
  }

  const fromFilesApi = normalizedPath.startsWith(FILES_API_PREFIX)
    ? normalizedPath.slice(FILES_API_PREFIX.length)
    : normalizedPath.startsWith("/")
    ? normalizedPath.slice(1)
    : normalizedPath;

  if (!fromFilesApi) {
    return null;
  }

  const decoded = decodeURIComponent(fromFilesApi);
  const publicRoot = path.resolve(getPublicPath());
  const runtimeRoot = path.resolve(getRuntimeStorageRoot());
  // Check runtimeRoot first — uploaded/generated files are stored there, not in publicRoot.
  const candidateRoots = [runtimeRoot, publicRoot];

  for (const root of candidateRoots) {
    const candidate = path.resolve(root, decoded);
    if (candidate === root || candidate.startsWith(`${root}${path.sep}`)) {
      return candidate;
    }
  }

  return null;
}