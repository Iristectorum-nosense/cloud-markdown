const { contextBridge, ipcRenderer } = require('electron');
const { join, basename, extname, dirname } = require('path');
const { dialog, Menu, getCurrentWindow } = require('@electron/remote');
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
  /* 处理文件的全局快捷键 */
  ipcMenuAction: (actionType, callback) => {
    const on = () => {
      ipcRenderer.on(actionType, callback);
    }

    const remove = () => {
      ipcRenderer.removeListener(actionType, callback);
    }

    return { on, remove };
  },
  /* 处理保存云同步设置 */
  ipcYunConfig: (settings) => {
    const isConfig = ['AccessKey', 'SecretKey', 'Bucket'].every(item => !!settings[item]);
    ipcRenderer.send('save-yun-config', isConfig);
  },
  /* 自动云同步 */
  ipcAutoSync: (title, path) => {
    ipcRenderer.send('auto-sync-upload', {
      fileName: `${title}.md`,
      path: path
    });
  },
  /* 重命名云同步 */
  ipcRename: (oldTitle, newTitle) => {
    ipcRenderer.send('auto-sync-rename', {
      oldName: `${oldTitle}.md`,
      newName: `${newTitle}.md`
    });
  },
  /* 删除云同步 */
  ipcDelete: (title) => {
    ipcRenderer.send('auto-sync-delete', {
      fileName: `${title}.md`
    });
  }
});

// 注册 electron-store 相关的方法
contextBridge.exposeInMainWorld('electronStoreAPI', {
  /* 保存文件信息 */
  saveFilesToStore: (files) => {
    const filesStoreArr = files.map(({ id, title, path, cloudTime }) => ({ id, title, path, cloudTime }));
    ipcRenderer.send('set-store', 'files', filesStoreArr);
  },
  /* 获取文件信息 */
  getFilesFromStore: () => {
    const files = ipcRenderer.sendSync('get-store', 'files');
    return files || [];
  },
  /* 保存文件配置 */
  saveSettingsToStore: (settings) => {
    ipcRenderer.send('set-store', 'settings', settings);
  },
  /* 获取文件配置 */
  getSettingsFromStore: () => {
    const settings = ipcRenderer.sendSync('get-store', 'settings');
    return settings || {};
  }
});