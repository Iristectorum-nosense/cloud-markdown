# 云 MarkDown 编辑器
<img src='https://github.com/Iristectorum-nosense/cloud-markdown/blob/master/assets/%E5%B1%95%E7%A4%BA1.png' />

<img src='https://github.com/Iristectorum-nosense/cloud-markdown/blob/master/assets/%E5%B1%95%E7%A4%BA2.png' />

## 项目简介
一款管理 MarkDown 文档的跨平台桌面应用，支持文档自动云同步。
1. 实现本地新建、导入、保存和删除 MarkDown 文档，支持快捷键新建、导入、保存和搜索文档。<br />
2. 实现文档保存、重命名和删除的自动云同步，支持云文档下载至本地，并借助 Stream 流节省内存。<br />
3. 自定义 Hooks，复用键盘监听事件和 ipcRenderer 监听事件。<br />
4. 支持 macOS / Windows 系统进行应用程序的打包。<br />

## 技术栈
<img src='https://img.shields.io/badge/React.js-orange' /> <img src='https://img.shields.io/badge/Electron-orange' /> <img src='https://img.shields.io/badge/electron--sotre-green' /> <img src='https://img.shields.io/badge/OSS-green' />  
<img src='https://img.shields.io/badge/Bootstrap-blue' />

框架相关详情可参阅 <a href='https://github.com/Iristectorum-nosense/cloud-markdown/blob/master/package.json' title='cloud-markdown/package.json' >cloud-markdown/package.json</a>

## 使用方法
1. 运行 `npm install`：安装依赖
2. 运行 `npm dev`：进入开发模式
3. 运行 `npm pack`：打包目录
4. 运行 `npm dist`：生成应用程序和可执行文件

## 项目结构及注释
```
.
├─ cloud-markdown
│  ├─ assets 图标
|  ├─ public 
│  ├─ src
│  │  ├─ components // 渲染组件
│  │  │  ├─ Common                       # 公共组件
│  │  │  │  ├─ Loader.js                 # 加载
│  │  │  │  ├─ Setting.js                # 设置，包括存储位置、AccessKey、SecretKey 和 Bucket
│  │  │  │  ├─ Toast.js                  # 消息提示
│  │  │  │  └─ common.scss               # 公共样式
│  │  │  |
│  │  │  ├─ FileList                     # 文档列表
│  │  │  ├─ FileListBtn                  # 文档列表底部按钮
│  │  │  ├─ FileListSearch               # 文档列表搜索
│  │  │  ├─ SimpleMDE                    # markdown 插件，修复预览功能
│  │  │  └─ TabList                      # 标签页列表
│  │  |
│  │  ├─ hooks // 自定义钩子函数
│  │  │  ├─ useIpcAppMenu.js             # ipc 监听事件逻辑
│  │  │  └─ useKeyboard.js               # 键盘监听事件
│  │  |
│  │  ├─ utils // 相关功能函数
│  │  |  ├─ classNameTrans.js            # class 对象转字符串
│  │  |  ├─ domAction.js                 # 获取元素指定父节点
│  │  |  ├─ fileSystem.js                # 文件系统操作，包括读文件、写文件、重命名和删除文件
│  │  |  ├─ svg.js                       # Bootstrap 图标组件封装
│  │  |  ├─ timeTrans.js                 # 时间转换
│  │  |  └─ titleCheck.js                # 文件名检查
│  │  └─
|  |  |
|  |  ├─ App.js  // 控制渲染数据流的主组件
│  │  |...
│  │  └─
|  |
│  ├─ OSSManager.js                      # qiniu 云存储的方法类，包括上传、下载、重命名、删除、检查云空间是否过期、生成下载链接、获取空间域名和封装 promise 回调
│  ├─ appMenuTemplate.js                 # 全局菜单
│  ├─ preload.js                         # 预加载渲染进程，暴露方法或接口给 React
│  ├─ main.js                            # 主进程入口
│  ├─ .gitignore
│  ├─ package-lock.json
│  ├─ package.json
│  └─ README.md
└─
```

