const { contextBridge, ipcRenderer } = require('electron');
const { join, basename, extname, dirname } = require('path');
const remote = require('@electron/remote');
const { promises, accessSync, constants } = require('fs');


// 注册 electron-store 相关的方法
contextBridge.exposeInMainWorld('electronAPI', {
  path: {
    join,
    basename,
    extname,
    dirname
  },
  remote,
  fs: {
    promises,
    accessSync,
    constants
  }
});


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