const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')  // 指定 preload.js 的路径
    }
  });

  const urlLocation = isDev ? 'http://localhost:3000' : '';
  mainWindow.loadURL(urlLocation);
  mainWindow.webContents.openDevTools();

  // 开启 remote
  require('@electron/remote/main').initialize();
  require("@electron/remote/main").enable(mainWindow.webContents);

  // 监听持久化文件数据的请求
  ipcMain.on('electron-store-get-data', (event, key) => {
    mainWindow.webContents.send('electron-store-get-data', key);
  });
});