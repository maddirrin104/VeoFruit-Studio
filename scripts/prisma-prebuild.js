const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");
const PRISMA_GEN_DIR = path.join(PROJECT_ROOT, "src", "generated", "prisma");

function unlockPrismaEngine() {
  const engineFile = path.join(PRISMA_GEN_DIR, "query_engine-windows.dll.node");

  if (fs.existsSync(engineFile)) {
    try {
      fs.renameSync(engineFile, `${engineFile}.old`);
    } catch {
      try {
        fs.rmSync(engineFile, { force: true });
      } catch {
        // If another process is actively holding the DLL, Prisma generate will still fail.
      }
    }
  }

  try {
    for (const fileName of fs.readdirSync(PRISMA_GEN_DIR)) {
      if (fileName.includes(".tmp")) {
        try {
          fs.rmSync(path.join(PRISMA_GEN_DIR, fileName), { force: true });
        } catch {
          // Ignore stale temp files that cannot be removed.
        }
      }
    }
  } catch {
    // Ignore if the Prisma output directory does not exist yet.
  }
}

unlockPrismaEngine();
