import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { createAppContext } from "./AppContext";
import { registerIpcHandlers } from "./ipc/handlers";

let mainWindow: BrowserWindow | null = null;
const context = createAppContext();

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererDevUrl = process.env.VITE_DEV_SERVER_URL;
  if (rendererDevUrl) {
    console.log(`[main] loading renderer from dev server: ${rendererDevUrl}`);
    win.loadURL(rendererDevUrl);
  } else {
    const filePath = path.resolve(process.cwd(), "dist/renderer/index.html");
    console.log(`[main] loading renderer from file: ${filePath}`);
    win.loadFile(filePath);
  }

  win.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return;
      console.error(
        `[renderer] did-fail-load code=${errorCode} description=${errorDescription} url=${validatedURL}`
      );
    }
  );

  win.webContents.on("render-process-gone", (_event, details) => {
    console.error(
      `[renderer] render-process-gone reason=${details.reason} exitCode=${details.exitCode}`
    );
  });

  win.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    console.log(`[renderer:console:${level}] ${sourceId}:${line} ${message}`);
  });

  win.webContents.on("preload-error", (_event, preloadPath, error) => {
    console.error(`[renderer] preload-error path=${preloadPath}`, error);
  });

  return win;
}

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  registerIpcHandlers(ipcMain, context, () => mainWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  context.database.close();
});
