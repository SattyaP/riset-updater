const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const url = require("url");

log.transports.file.resolvePath = () =>
  path.join(app.getPath("userData"), "logs", "main.log");
log.info("App starting...");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      // devTools: !app.isPackaged,
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  !app.isPackaged &&
    require("electron-reloader")(module, {
      debug: true,
      watchRenderer: true,
      ignore: ["**/dist/**", "**/build/**"],
    });

  app.isPackaged && Menu.setApplicationMenu(null);

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("download-progress", (progress) => {
    const speed = (progress.bytesPerSecond / 1024).toFixed(2);
    const percent = progress.percent.toFixed(2);
    const transferred = (progress.transferred / 1024 / 1024).toFixed(2);
    const total = (progress.total / 1024 / 1024).toFixed(2);

    log.info(`Download speed: ${speed} KB/s`);
    log.info(`Downloaded ${transferred} MB of ${total} MB (${percent}%)`);

    const progresst = {
      speed: speed,
      percent: percent,
      transferred: transferred,
      total: total,
    }

    mainWindow.webContents.send(
      "update_progress",
      progresst
    );
  });

  autoUpdater.on("update-available", () => {
    log.info("Update available.");
    mainWindow.webContents.send("update_available");
  });

  autoUpdater.on("update-downloaded", () => {
    log.info("Update downloaded.");
    mainWindow.webContents.send("update_downloaded");
  });

  autoUpdater.on("error", (error) => {
    log.error("Error in auto-updater. " + error);
    mainWindow.webContents.send("update_error", error);
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("app_version", async () => {
  return app.getVersion();
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});
