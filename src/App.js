import { useState, useCallback, useEffect } from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { v4 as uuidv4 } from 'uuid';
import fileHelper from './util/fileSystem';
import FileListSearch from './components/FileListSearch/FileListSearch';
import FileList from './components/FileList/FileList';
import FileListBtn from './components/FileListBtn/FileListBtn';
import TabList from './components/TabList/TabList';
import SimpleMDE from './components/SimpleMDE/SimpleMDE';
import Toast from './components/Common/Toast';
import useIpcAppMenu from './hooks/useIpcAppMenu';

const { join, basename, extname, dirname } = window.electronAPI.path;
const { app, dialog } = window.electronAPI.remote;
const { saveFilesToStore, getFilesFromStore } = window.electronStoreAPI;
// const { createNewFile } = window.ipcAppMenuAPI;

// const defaultFiles = [  文件示例
//   {
//     id: '1',
//     title: 'init',
//     body: '## 开始新的 Markdown',
//     path: '',
//     createTime: 1563762965704,
//     isNew: false,
//     isLoad: true
//   }
// ];

function App() {
  /* 文档状态管理 */
  const [files, setFiles] = useState(getFilesFromStore() || []);
  const [searchFiles, setSearchFiles] = useState([]);
  const [searchState, setSearchState] = useState(false);
  const [activeFileId, setActiveFileId] = useState('');
  const [openFileIds, setOpenFileIds] = useState([]);
  const [unsaveFileIds, setUnsaveFileIds] = useState([]);
  const savedLocation = app.getPath('documents');

  /* 消息状态管理 */
  const [msgCtn, setMsgCtn] = useState('');

  /* 展示搜索文档或全部文档 */
  const fileList = (searchState ? searchFiles : files);

  /* 查找打开的文档信息 */
  const openFiles = openFileIds.map(openId => {
    return files.find(file => file.id === openId);
  });

  /* 查找当前打开的文档信息 */
  const activeFile = files.find(file => file.id === activeFileId);

  /* 搜索文档列表 */
  const onFileSearch = useCallback((name) => {
    console.log('search');
    // 更新文档列表
    const newFiles = files.filter(file => file.title.includes(name));
    setSearchFiles(newFiles);

    // 更新搜索状态
    if (name) {
      setSearchState(true);
    } else {
      setSearchState(false);
    }
  }, [files])

  /* 点击文档列表文档 */
  const onFileClick = useCallback(async (fileId) => {

    console.log('click', fileId)
    // 更新打开 files
    setActiveFileId(fileId);

    // 更新标签栏 files
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds([...openFileIds, fileId]);
    }

    // 读取打开的文档内容
    const activeFile = files.find(file => file.id === fileId);

    if (!activeFile.isLoad) {
      try {
        const fileCtn = await fileHelper.readFile(activeFile.path);
        const newFiles = files.map(file => {
          if (file.id === fileId) {
            let newFile = { ...file };
            newFile.body = fileCtn;
            newFile.isLoad = true;
            return newFile;
          }
          return file;
        });
        setFiles(newFiles);
      } catch (error) {
        // 如果用户在文件系统手动删除文件，并尝试打开，则需要清理该文件
        const newFiles = files.filter(file => file.id !== fileId);
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      }
    }
  }, [openFileIds, files])

  /* 编辑文档列表文档名称 */
  const onTitleEdit = useCallback(async (editItem, newTitle) => {
    // 新建文档写入，已有文档修改
    if (newTitle) {
      // 文件新路径
      const newPath = join(savedLocation, `${newTitle}.md`);

      // 更新文档列表
      const newFiles = files.map(file => {
        if (file.id === editItem.id && newTitle) {
          let newFile = { ...file };
          newFile.title = newTitle;
          newFile.path = newPath;
          newFile.isNew = false;
          return newFile;
        }
        return file;
      });

      if (editItem.isNew) {
        await fileHelper.writeFile(newPath, editItem.body, editItem.isNew);
        setFiles(newFiles);
        saveFilesToStore(newFiles);

        // 打开新建文档并聚焦
        setActiveFileId(editItem.id);
        setOpenFileIds([...openFileIds, editItem.id]);
      } else {
        try {
          await fileHelper.renameFile(editItem.path, join(dirname(editItem.path), `${newTitle}.md`));
          setFiles(newFiles);
          saveFilesToStore(newFiles);
        } catch (error) {
          onFileDelete(editItem);
        }
      }
    }
  }, [savedLocation, files, openFileIds])

  /* 删除文档列表文档 */
  const onFileDelete = useCallback(async (fileItem) => {
    const fileId = fileItem.id;
    // 更新列表 files
    const newFiles = files.filter(file => file.id !== fileId);

    // 删除文档
    if (!fileItem.isNew) {
      const delFile = files.find(file => file.id === fileId);
      try {
        await fileHelper.deleteFile(delFile.path);
      } catch (error) {
        setMsgCtn('文件不存在，已移出文档列表');
      }
    }

    setFiles(newFiles);
    saveFilesToStore(newFiles);

    // 更新标签栏 files
    if (openFileIds.includes(fileId)) {
      onTabClose(fileId);
    }
  }, [files, openFileIds])

  /* 新建文档 */
  const onFileAdd = useCallback(() => {
    console.log('add');
    // 生成 id
    const newId = uuidv4();

    // 更新文档列表
    const newFiles = [
      ...files,
      {
        id: newId,
        title: '',
        body: '## 开始新的 Markdown',
        createTime: new Date().getTime(),
        isNew: true,
        isLoad: true
      }
    ]
    setFiles(newFiles);
  }, [files])

  /* 导入文档 */
  const onFileImport = useCallback(async () => {
    console.log('import')
    const result = await dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      defaultPath: 'C:\\Users\\Gtc\\Documents',
      properties: ['openFile', 'multiSelection'],
      filters: [
        { name: 'Markdown files', extensions: ['md'] }
      ]
    });

    if (result.filePaths.length) {
      // 文件去重
      const paths = new Set();
      for (const file of files) {
        paths.add(file.path);
      }

      const importFiles = result.filePaths.map(path => {
        if (!paths.has(path)) {
          const importFile = {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path
          };
          return importFile;
        }
        return undefined;
      }).filter(file => file !== undefined);

      if (importFiles.length) {
        const newFiles = [...files, ...importFiles];
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      }

      const message = result.filePaths.length === importFiles.length
        ? `成功导入 ${importFiles.length} 个文件`
        : `成功导入 ${importFiles.length} 个文件（ ${result.filePaths.length - importFiles.length} 个文件已存在，若有需要，请修改名称后重新导入）`;
      setMsgCtn(message);
    }
  }, [files])

  /* 点击文档标签栏的文档 */
  const onTabClick = useCallback((fileId) => {
    console.log('tab', fileId)
    setActiveFileId(fileId);
  }, [])

  /* 关闭文档标签栏的文档 */
  const onTabClose = useCallback((fileId) => {
    console.log('close', fileId)
    // 更新标签栏 files
    const newOpenFileIds = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(newOpenFileIds);

    // 更新打开 files
    if (activeFileId === fileId) {
      if (newOpenFileIds.length) {
        const fileIndex = openFileIds.findIndex(id => id === fileId);

        if (fileIndex === 0) {  // 被删除的文档在标签栏第一个
          setActiveFileId(newOpenFileIds[0]);
        } else {
          setActiveFileId(newOpenFileIds[fileIndex - 1]);
        }
      } else {
        setActiveFileId('');
      }
    }
  }, [openFileIds, activeFileId])

  /* 更新文档内容 */
  const onFileChange = useCallback((fileId, value) => {
    // 更新列表 files
    const newFiles = files.map(file => {
      if (file.id === fileId) {
        let newFile = { ...file };
        newFile.body = value;
        return newFile;
      }
      return file;
    })
    setFiles(newFiles);

    // 更新未保存 files
    if (!unsaveFileIds.includes(fileId)) {
      setUnsaveFileIds([...unsaveFileIds, fileId]);
    }
  }, [files, unsaveFileIds])

  /* 保存当前文档编辑内容 */
  const onFileSave = useCallback(async () => {
    await fileHelper.writeFile(activeFile.path, activeFile.body, activeFile.isNew);
    setUnsaveFileIds(unsaveFileIds.filter(id => id !== activeFile.id));
  }, [activeFile, unsaveFileIds])

  /* 关闭消息框 */
  const closeMessage = () => {
    setMsgCtn('');
  }

  useIpcAppMenu('create-new-file', onFileAdd);
  useIpcAppMenu('save-edit-file', onFileSave);
  useIpcAppMenu('import-file', onFileImport);

  return (
    <div className="App container-fluid px-0">
      <Toast
        message={msgCtn}
        closeMessage={closeMessage}
      />
      <div className="row g-0">
        <div className="col-3 left">
          <FileListSearch
            searchState={searchState}
            onFileSearch={onFileSearch}
          />
          <FileList
            files={fileList}
            onFileClick={onFileClick}
            onTitleEdit={onTitleEdit}
            onFileDelete={onFileDelete}
            onMsgCtn={setMsgCtn}
          />
          {
            !searchState &&
            <div className="row g-0 btn-container">
              <div className="col">
                <FileListBtn
                  title="新建"
                  className="btn-add"
                  onBtnClick={onFileAdd}
                />
              </div>
              <div className="col">
                <FileListBtn
                  title="导入"
                  className="btn-import"
                  onBtnClick={onFileImport}
                />
              </div>
            </div>
          }
        </div>
        <div className="col-9 right">
          {
            activeFile
              ? <>
                <TabList
                  files={openFiles}
                  activeId={activeFileId}
                  unsaveIds={unsaveFileIds}
                  onTabClick={onTabClick}
                  onTabClose={onTabClose}
                />
                <SimpleMDE
                  activeFile={activeFile}
                  onFileChange={onFileChange}
                />
              </>
              : <div className="init-page">开始你的新页面吧</div>
          }
        </div>
      </div>
    </div>
  );
}

export default App;