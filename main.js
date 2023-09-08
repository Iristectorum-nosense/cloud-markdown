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

  /* 监听文件重命名 */
  ipcMain.on('auto-sync-rename', async (_, data) => {
    const manager = createManager();

    try {
      // 检查文件是否存在
      await manager.fileExists(data.oldName);

      try {
        await manager.remoteFileRename(data.oldName, data.newName);
        mainWindow.webContents.send('upload-timestamp');  // 传递给渲染进程，提示文件同步时间
      } catch (err) {
        throw new Error(err);
      }
    } catch (error) {
      mainWindow.webContents.send('message', '云空间不存在该文件');
    }
  });

  /* 监听文件删除 */
  ipcMain.on('auto-sync-delete', async (_, data) => {
    const manager = createManager();

    try {
      // 检查文件是否存在
      await manager.fileExists(data.fileName);

      try {
        await manager.remoteFileDelete(data.fileName);
      } catch (err) {
        throw new Error(err);
      }
    } catch (error) {
      mainWindow.webContents.send('message', '云空间不存在该文件');
    }
  });

  /* 监听文件全部上传 */
  ipcMain.on('upload-all-files', async () => {
    mainWindow.webContents.send('loading', true);

    const files = store.get('files') || [];

    try {
      if (files.length) {
        const manager = createManager();

        // 批量上传 Promise 数组
        const uploadPromises = files.map(file => {
          return manager.remoteFileUpload(`${file.title}.md`, file.path);
        });

        await Promise.all(uploadPromises);
        mainWindow.webContents.send('upload-timestamp', 'all');
        mainWindow.webContents.send('message', '上传成功');
      }
    } catch (error) {
      mainWindow.webContents.send('message', '上传失败，请稍后重试');
      throw new Error(err);
    } finally {
      mainWindow.webContents.send('loading', false);
    }
  });

  /* 监听文件全部下载 */
  ipcMain.on('download-all-files', async () => {
    mainWindow.webContents.send('loading', true);

    const files = store.get('files') || [];

    try {
      if (files.length) {
        const manager = createManager();

        // 过滤云空间存在的文档列表
        const existPromises = files.map(file => {
          return manager.fileExists(`${file.title}.md`);
        })

        // 所有 Promises 的结果
        const existResults = await Promise.allSettled(existPromises);

        const filterFiles = files.filter((_, fileIndex) => {
          return existResults.some((promise, promiseIndex) => {
            return promise.status === 'fulfilled' && promiseIndex === fileIndex;
          });
        });

        // 批量下载 Promise 数组
        const downLoadPromise = filterFiles.map(file => {
          return manager.remoteFileDownload(`${file.title}.md`, file.path);
        });

        await Promise.all(downLoadPromise);
        mainWindow.webContents.send('message', '下载成功，部分文件未保存在云空间内');
        mainWindow.webContents.send('download-content', filterFiles);
      }
    } catch (error) {
      mainWindow.webContents.send('message', '下载失败，请稍后重试');
      throw new Error(err);
    } finally {
      mainWindow.webContents.send('loading', false);
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