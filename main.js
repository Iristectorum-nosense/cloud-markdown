const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { join } = require('path');
const isDev = require('electron-is-dev');
const appMenuTemplate = require('./appMenuTemplate');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, 'preload.js')  // 指定 preload.js 的路径
    },
    show: false
  });

  const urlLocation = isDev ? 'http://localhost:3000' : '';
  mainWindow.loadURL(urlLocation);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.openDevTools();

  // 设置主菜单
  const menu = Menu.buildFromTemplate(appMenuTemplate);
  Menu.setApplicationMenu(menu);

  // 开启 remote
  require('@electron/remote/main').initialize();
  require("@electron/remote/main").enable(mainWindow.webContents);

  // 监听持久化文件数据的请求
  ipcMain.on('electron-store-get-data', (_, key) => {
    mainWindow.webContents.send('electron-store-get-data', key);
  });

  // 关闭时卸载监听
  mainWindow.on('close', () => {
    // 向渲染进程发送清理消息
    mainWindow.webContents.send('clean-listeners');

    ipcMain.removeAllListeners();
    mainWindow = null;
  });
});