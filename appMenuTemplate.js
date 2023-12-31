const { app, shell, ipcMain } = require('electron');

// 定义 store
const Store = require('electron-store');
const settingsStore = new Store({ name: 'Files Data' });
const settings = settingsStore.get('settings');

let AutoSync = settings['AutoSync'];
let IsConfig = ['AccessKey', 'SecretKey', 'Bucket'].every(item => !!settings[item]);


let menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建',
        accelerator: 'CmdOrCtrl+N',
        click: (_, browserWindow) => {
          browserWindow.webContents.send('create-new-file');
        }
      },
      {
        label: '保存',
        accelerator: 'CmdOrCtrl+S',
        click: (_, browserWindow) => {
          browserWindow.webContents.send('save-edit-file');
        }
      },
      {
        label: '搜索',
        accelerator: 'CmdOrCtrl+F',
        click: (_, browserWindow) => {
          browserWindow.webContents.send('search-file');
        }
      },
      {
        label: '导入',
        accelerator: 'CmdOrCtrl+O',
        click: (_, browserWindow) => {
          browserWindow.webContents.send('import-file');
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: '云同步',
    submenu: [
      {
        label: '自动同步',
        type: 'checkbox',
        enabled: IsConfig,
        checked: AutoSync,
        click: (item) => {
          settingsStore.set('settings', {
            ...settings,
            ['AutoSync']: item.checked
          });
        }
      },
      {
        label: '全部同步至云空间',
        enabled: IsConfig,
        click: () => {
          ipcMain.emit('upload-all-files');
        }
      },
      {
        label: '全部下载至本地',
        enabled: IsConfig,
        click: () => {
          ipcMain.emit('download-all-files');
        }
      }
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新当前页面',
        accelerator: 'CmdOrCtrl+R',
        click: (_, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: '切换全屏幕',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F';
          }
          else {
            return 'F11';
          }
        })(),
        click: (_, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      },
      {
        label: '切换开发者工具',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I';
          }
          else {
            return 'Ctrl+Shift+I';
          }
        })(),
        click: (_, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      },
    ]
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [
      {
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '学习更多',
        click: () => {
          shell.openExternal('http://electron.atom.io')
        }
      },
    ]
  },
];

/* mac 系统特有菜单 */
if (process.platform === 'darwin') {
  const name = app.getName();

  menuTemplate.unshift({
    label: name,
    submenu: [
      {
        label: `关于 ${name}`,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: '服务',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: `隐藏 ${name}`,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: '隐藏其它',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: '显示全部',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  })
}

module.exports = menuTemplate;