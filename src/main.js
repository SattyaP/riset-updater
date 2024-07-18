const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const url = require("url");

let updateCheckInProgress = true;
let mainWindow;

const server = 'https://github.com/SattyaP/releaser';
const feed = `${server}/releases/download/${app.getVersion()}`;

autoUpdater.setFeedURL({
  provider: "github",
  url: feed,
});

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

  !app.isPackaged && require("electron-reloader")(module, {
    debug: true,
    watchRenderer: true,
    ignore: [
      "**/dist/**", 
      "**/build/**", 
    ],
  });

  // app.isPackaged && Menu.setApplicationMenu(null);

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("download-progress", (progress) => {
    mainWindow.webContents.send("update_progress", progress.percent);
  });

  autoUpdater.on("update-available", () => {
    updateCheckInProgress = false;
    mainWindow.webContents.send("update_available");
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update_downloaded");
  });

  autoUpdater.on("error", (error) => {
    updateCheckInProgress = false;
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
