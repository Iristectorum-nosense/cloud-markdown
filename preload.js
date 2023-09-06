const { contextBridge, ipcRenderer } = require('electron');
const { join, basename, extname, dirname } = require('path');
const { app, dialog, Menu, getCurrentWindow } = require('@electron/remote');
const { promises, accessSync, constants, mkdirSync } = require('fs');

// 注册 electron-store 相关的方法
contextBridge.exposeInMainWorld('electronAPI', {
  path: {
    join,
    basename,
    extname,
    dirname
  },
  remote: {
    app,
    dialog
  },
  fs: {
    promises,
    accessSync,
    constants,
    mkdirSync
  }
});

// 注册 remote.menu 相关的方法
contextBridge.exposeInMainWorld('remoteMenuAPI', {
  createCtxMenu: (menuTemplate) => {
    const menu = Menu.buildFromTemplate(menuTemplate);

    const popupMenu = () => {
      menu.popup({ window: getCurrentWindow() });
    }

    return popupMenu;
  }
});

// 注册 ipcRenderer 针对主菜单的相关方法
contextBridge.exposeInMainWorld('ipcAppMenuAPI', {
  ipcMenuAction: (actionType, callback) => {
    const on = () => {
      ipcRenderer.on(actionType, callback);
    }

    const remove = () => {
      ipcRenderer.removeListener(actionType, callback);
    }

    return { on, remove };
  }
})


const Store = require('electron-store');
const fileStore = new Store({ 'name': 'Files Data' });

const getFilesFromStore = () => {
  return fileStore.get('files') || [];
}

// 注册 electron-store 相关的方法
contextBridge.exposeInMainWorld('electronStoreAPI', {
  saveFilesToStore: (files) => {
    const filesStoreArr = files.map(({ id, title, path, createTime }) => ({ id, title, path, createTime }));
    fileStore.set('files', filesStoreArr);
  },
  getFilesFromStore: getFilesFromStore
});

// 监听获取文件数据的请求
ipcRenderer.on('electron-store-get-data', (event, key) => {
  if (key === 'files') {
    const files = getFilesFromStore();
    // 将文件数据发送回渲染进程
    event.reply('electron-store-get-data-response', files);
  }
});

// 主进程关闭时卸载监听
ipcRenderer.on('clean-listeners', () => {
  ipcRenderer.removeAllListeners('electron-store-get-data');
});