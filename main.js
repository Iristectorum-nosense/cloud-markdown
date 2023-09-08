const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { join } = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const OSSManager = require('./OSSManager');

let mainWindow;

app.on('ready', () => {
  app.name = 'YunMarkDown';  // 应用程序名称

  Store.initRenderer();  // 解决 warning 白屏 WebContents #1 called ipcRenderer.sendSync() with 'electron-store-get-data' channel without listeners.

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, 'preload.js')  // 指定 preload.js 的路径
    },
    show: false
  });

  mainWindow.setMinimumSize(1000, 600);  // 最小窗口大小
  const urlLocation = isDev ? 'http://localhost:3000' : '';
  mainWindow.loadURL(urlLocation);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.openDevTools();

  // 开启 remote
  require('@electron/remote/main').initialize();
  require("@electron/remote/main").enable(mainWindow.webContents);

  // 创建 store 
  const store = new Store({ name: 'Files Data' });
  if (store.get('settings') === undefined) {
    store.set('settings', {
      '存储位置': `${app.getPath('documents')}\\${app.getName()}`,
      'AccessKey': '',
      'SecretKey': '',
      'Bucket': '',
      'AutoSync': false
    });
  }

  ipcMain.on('set-store', (_, key, value) => {
    store.set(key, value);
  });

  ipcMain.on('get-store', (event, key) => {
    let value = store.get(key);
    event.returnValue = value;
  });

  // 设置主菜单
  const appMenuTemplate = require('./appMenuTemplate');
  let menu = Menu.buildFromTemplate(appMenuTemplate);
  Menu.setApplicationMenu(menu);

  /* 监听云同步修改设置 */
  ipcMain.on('save-yun-config', (_, isConfig) => {
    // 修改 AutoSync 设置
    let ossMenu = (process.platform === 'darwin' ? menu.items[3] : menu.items[2]);

    // 三项均需修改
    const changeItems = (flag) => {
      [0, 1, 2].forEach(index => {
        ossMenu.submenu.items[index].enabled = flag;
      })
    }
    changeItems(isConfig);
  });

  // 实例化云同步对象
  const createManager = () => {
    const settings = store.get('settings');
    return new OSSManager(settings['AccessKey'], settings['SecretKey'], settings['Bucket']);
  }

  /* 监听自动云同步 */
  ipcMain.on('auto-sync-upload', async (_, data) => {
    const manager = createManager();
    try {
      await manager.remoteFileUpload(data.fileName, data.path);
      mainWindow.webContents.send('upload-timestamp');  // 传递给渲染进程，提示文件同步时间
    } catch (err) {
      throw new Error(err);
    }
  });

  /* 关闭时卸载监听 */
  mainWindow.on('close', () => {
    // 向渲染进程发送清理消息
    mainWindow.webContents.send('clean-listeners');

    ipcMain.removeAllListeners();
    mainWindow = null;
  });
});