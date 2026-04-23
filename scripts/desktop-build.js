// Build Electron app to a short temp path on D: (avoids Windows Defender/Indexer lock
// caused by spaces in the project path), then copies the installer to dist-electron/.
const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BUILD_TEMP = "D:\\vf-build";
const PROJECT_ROOT = path.join(__dirname, "..");
const DIST_ELECTRON = path.join(PROJECT_ROOT, "dist-electron");
const PRISMA_GEN_DIR = path.join(PROJECT_ROOT, "src", "generated", "prisma");

function addDefenderExclusion(p) {
  try {
    execFileSync("powershell", [
      "-NoProfile", "-NonInteractive", "-Command",
      `Add-MpPreference -ExclusionPath '${p}' -ErrorAction SilentlyContinue`,
    ], { stdio: "pipe" });
  } catch {
    // Not critical if this fails (e.g. no admin rights)
  }
}

function rmrf(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch { /* ignore */ }
}

// Remove leftover temp files from previous failed generate runs.
function cleanupPrismaTempFiles() {
  try {
    for (const f of fs.readdirSync(PRISMA_GEN_DIR)) {
      if (f.includes(".tmp")) {
        try { fs.rmSync(path.join(PRISMA_GEN_DIR, f), { force: true }); } catch { /* ignore */ }
      }
    }
  } catch {
    // Ignore if dir doesn't exist yet.
  }
}

cleanupPrismaTempFiles();

// Prepare temp output dir
rmrf(BUILD_TEMP);
fs.mkdirSync(BUILD_TEMP, { recursive: true });
addDefenderExclusion(BUILD_TEMP);

try {
  execSync(
    `npx electron-builder --win --x64 --publish never --config.directories.output="${BUILD_TEMP}"`,
    { stdio: "inherit", cwd: PROJECT_ROOT }
  );

  // Copy installer .exe to dist-electron/
  fs.mkdirSync(DIST_ELECTRON, { recursive: true });
  const installers = fs.readdirSync(BUILD_TEMP).filter(
    (f) => f.endsWith(".exe") && !f.toLowerCase().includes("uninstall")
  );

  if (installers.length === 0) {
    throw new Error("No installer .exe found in build output.");
  }

  for (const name of installers) {
    const src = path.join(BUILD_TEMP, name);
    const dest = path.join(DIST_ELECTRON, name);
    fs.copyFileSync(src, dest);
    console.log(`\n✅ Installer saved: dist-electron/${name}`);
  }
} finally {
  // Always clean up temp dir
  rmrf(BUILD_TEMP);
}
