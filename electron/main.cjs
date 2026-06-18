const { createServer } = require("http");
const net = require("net");
const fs = require("fs");
const path = require("path");
const Module = require("module");
const next = require("next");
const { app, BrowserWindow, dialog } = require("electron");

const HOSTNAME = "127.0.0.1";
const PACKAGED_SERVER_PORT = Number(process.env.VEOFRUIT_DESKTOP_PORT || "3200");

let mainWindow;
let server;
let serverUrl;

// ── Single-instance lock ──────────────────────────────────────────────────────
// Prevents a second copy of the app from opening; instead focuses the existing window.
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function patchPrismaHashedModuleAlias() {
  const originalResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
    const normalized = typeof request === "string" ? request : "";
    const aliasedRequest = /^@prisma\/client-[a-f0-9]+$/i.test(normalized)
      ? "@prisma/client"
      : request;

    return originalResolveFilename.call(this, aliasedRequest, parent, isMain, options);
  };
}

function getLogFilePath() {
  try {
    const dir = app.getPath("userData");
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, "main-process.log");
  } catch {
    return path.join(process.cwd(), "veofruit-main-process.log");
  }
}

function serializeError(error) {
  if (!error) {
    return "Unknown error";
  }

  if (error instanceof Error) {
    return error.stack || `${error.name}: ${error.message}`;
  }

  return String(error);
}

function logMain(event, payload) {
  const line = `[${new Date().toISOString()}] ${event} ${payload || ""}\n`;

  try {
    fs.appendFileSync(getLogFilePath(), line, "utf8");
  } catch {
    // If file logging fails, keep console logging as fallback.
  }

  console.log(line.trim());
}

async function showStartupError(error, title = "VeoFruit Studio - Startup Error") {
  const logPath = getLogFilePath();
  const message = serializeError(error);

  logMain("startup-error", message);

  if (!app.isReady()) {
    return;
  }

  await dialog.showMessageBox({
    type: "error",
    title,
    message: "App không thể khởi động.",
    detail: `${message}\n\nLog file: ${logPath}`,
  });
}

function ensureWindowsProcessEnv() {
  if (process.platform !== "win32") {
    return;
  }

  const winDir = process.env.windir || process.env.WINDIR || "C:\\Windows";
  const systemRoot = process.env.SystemRoot || process.env.SYSTEMROOT || winDir;
  const system32 = path.join(systemRoot, "System32");
  const cmdPath = path.join(system32, "cmd.exe");

  process.env.SystemRoot = systemRoot;
  process.env.SYSTEMROOT = systemRoot;

  if (!process.env.ComSpec && !process.env.COMSPEC) {
    process.env.ComSpec = cmdPath;
    process.env.COMSPEC = cmdPath;
  } else if (!process.env.ComSpec && process.env.COMSPEC) {
    process.env.ComSpec = process.env.COMSPEC;
  } else if (process.env.ComSpec && !process.env.COMSPEC) {
    process.env.COMSPEC = process.env.ComSpec;
  }

  if (!process.env.comspec) {
    process.env.comspec = process.env.ComSpec || process.env.COMSPEC || cmdPath;
  }

  const pathValue = process.env.PATH || process.env.Path || "";
  const hasSystem32 = pathValue
    .toLowerCase()
    .split(";")
    .some((segment) => segment.trim() === system32.toLowerCase());

  if (!hasSystem32) {
    process.env.PATH = pathValue ? `${system32};${pathValue}` : system32;
  }
}

function getProjectRoot() {
  return path.resolve(__dirname, "..");
}

function setupPrismaEnginePath() {
  if (!app.isPackaged) {
    return;
  }

  // In the packaged app, asarUnpack puts the native engine at app.asar.unpacked/
  // Prisma resolves the path using __dirname (which is inside app.asar), so it
  // can't find the DLL. Explicitly point Prisma to the real unpacked location.
  const enginePath = path.join(
    process.resourcesPath,
    "app.asar.unpacked",
    "src",
    "generated",
    "prisma",
    "query_engine-windows.dll.node"
  );

  if (fs.existsSync(enginePath)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
    console.log(`[prisma-engine] path=${enginePath}`);
  } else {
    console.warn(`[prisma-engine] WARNING: native engine not found at ${enginePath}`);
  }
}

// ── Find a free TCP port starting from `startPort` ───────────────────────────
function findFreePort(startPort) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", () => resolve(findFreePort(startPort + 1)));
    srv.listen(startPort, HOSTNAME, () => {
      srv.close(() => resolve(startPort));
    });
  });
}

// ── Resolve the app icon path ─────────────────────────────────────────────────
function getIconPath() {
  const isWin = process.platform === "win32";

  if (app.isPackaged) {
    // Windows: prefer .ico (embedded by electron-builder), fall back to .png
    if (isWin) {
      const packedIco = path.join(process.resourcesPath, "app-icon.ico");
      if (fs.existsSync(packedIco)) return packedIco;
    }
    const packed = path.join(process.resourcesPath, "app-icon.png");
    if (fs.existsSync(packed)) return packed;
  }

  // Dev mode: prefer .ico on Windows so taskbar shows the custom icon
  const publicDir = path.join(getProjectRoot(), "public");
  if (isWin) {
    const icoIcon = path.join(publicDir, "app-icon.ico");
    if (fs.existsSync(icoIcon)) return icoIcon;
  }
  const devIcon = path.join(publicDir, "app-icon.png");
  if (fs.existsSync(devIcon)) return devIcon;
  return undefined;
}

async function startNextServer() {
  if (serverUrl) {
    return serverUrl;
  }

  const projectRoot = getProjectRoot();
  process.env.VEOFRUIT_APP_ROOT = projectRoot;
  const nextApp = next({
    dev: !app.isPackaged,
    dir: projectRoot,
  });

  await nextApp.prepare();

  const handleRequest = nextApp.getRequestHandler();
  server = createServer((request, response) => {
    handleRequest(request, response);
  });

  // Find a free port to avoid conflicts on restart
  const port = app.isPackaged
    ? await findFreePort(PACKAGED_SERVER_PORT)
    : 0;

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, HOSTNAME, resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Không thể khởi tạo cổng cho Electron server.");
  }

  logMain("server", `listening=${HOSTNAME}:${address.port}`);

  serverUrl = `http://${HOSTNAME}:${address.port}`;
  return serverUrl;
}

async function createMainWindow() {
  const url = await startNextServer();
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: "#f4efe6",
    autoHideMenuBar: true,
    title: "VeoFruit Studio",
    ...(iconPath ? { icon: iconPath } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });

  await mainWindow.loadURL(url);
}

app.setAppUserModelId("com.veofruit.studio");

patchPrismaHashedModuleAlias();
ensureWindowsProcessEnv();
setupPrismaEnginePath();
logMain("boot", `platform=${process.platform} packaged=${app.isPackaged}`);
logMain(
  "env",
  `comspec=${process.env.comspec || ""} ComSpec=${process.env.ComSpec || ""} SystemRoot=${process.env.SystemRoot || ""}`
);

process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logMain("unhandledRejection", serializeError(error));

  if (app.isReady()) {
    showStartupError(error, "VeoFruit Studio - Runtime Error").catch(() => {
      // Ignore UI reporting errors.
    });
  }
});

process.on("uncaughtException", (error) => {
  logMain("uncaughtException", serializeError(error));

  if (app.isReady()) {
    showStartupError(error, "VeoFruit Studio - Runtime Error").catch(() => {
      // Ignore UI reporting errors.
    });
  }
});

app.whenReady().then(createMainWindow).catch((error) => {
  showStartupError(error).catch(() => {
    logMain("startup-error-dialog-failed", serializeError(error));
  });
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((error) => {
      showStartupError(error, "VeoFruit Studio - Reopen Failed").catch(() => {
        logMain("reopen-error-dialog-failed", serializeError(error));
      });
    });
  }
});

app.on("before-quit", () => {
  if (server) {
    server.close();
  }
});
