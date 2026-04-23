const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");
const PRISMA_GEN_DIR = path.join(PROJECT_ROOT, "src", "generated", "prisma");
const ENGINE_FILE = path.join(PRISMA_GEN_DIR, "query_engine-windows.dll.node");
const ENGINE_OLD_FILE = `${ENGINE_FILE}.old`;

function ensureEngineFile() {
  if (fs.existsSync(ENGINE_FILE)) {
    return;
  }

  if (!fs.existsSync(ENGINE_OLD_FILE)) {
    return;
  }

  try {
    fs.copyFileSync(ENGINE_OLD_FILE, ENGINE_FILE);
    console.log("[prisma-postbuild] Restored query_engine-windows.dll.node from .old backup");
  } catch (error) {
    console.warn("[prisma-postbuild] Failed to restore query engine:", error);
  }
}

ensureEngineFile();
