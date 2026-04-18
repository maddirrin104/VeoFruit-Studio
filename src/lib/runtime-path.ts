import path from "node:path";

const APP_ROOT_ENV = "VEOFRUIT_APP_ROOT";
const FILES_API_PREFIX = "/api/files/";

export function getAppRoot(): string {
  const configuredRoot = process.env[APP_ROOT_ENV]?.trim();
  return configuredRoot || process.cwd();
}

export function getPublicPath(...segments: string[]): string {
  return path.join(getAppRoot(), "public", ...segments);
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
  const candidate = path.resolve(getPublicPath(), decoded);
  const publicRoot = path.resolve(getPublicPath());

  if (candidate === publicRoot || candidate.startsWith(`${publicRoot}${path.sep}`)) {
    return candidate;
  }

  return null;
}