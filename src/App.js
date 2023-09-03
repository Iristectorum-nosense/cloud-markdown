import { useState, useCallback, useEffect } from 'react';
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { v4 as uuidv4 } from 'uuid';
import FileListSearch from './components/FileListSearch/FileListSearch';
import FileList from './components/FileList/FileList';
import FileListBtn from './components/FileListBtn/FileListBtn';
import TabList from './components/TabList/TabList';
import SimpleMDE from './components/SimpleMDE/SimpleMDE';

const fs = window.require('fs');

const defaultFiles = [
  {
    id: '1',
    title: 'init',
    body: '## 开始新的 Markdown',
    createTime: 1563762965704,
    isNew: false
  },
  {
    id: '2',
    title: 'second',
    body: 'second body',
    createTime: 1563762965704,
    isNew: false
  },
  {
    id: '3',
    title: '列表',
    body: '第三 body',
    createTime: 1563762965704,
    isNew: false
  },
];

function App() {
  const [files, setFiles] = useState(defaultFiles);
  const [searchFiles, setSearchFiles] = useState([]);
  const [searchState, setSearchState] = useState(false);
  const [activeFileId, setActiveFileId] = useState('');
  const [openFileIds, setOpenFileIds] = useState([]);
  const [unsaveFileIds, setUnsaveFileIds] = useState([]);

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
  const onFileClick = useCallback((fileId) => {
    // 更新打开 files
    setActiveFileId(fileId);
    // 更新标签栏 files
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds([...openFileIds, fileId]);
    }
  }, [openFileIds])

  /* 编辑文档列表文档名称 */
  const onTitleEdit = useCallback((fileId, newTitle) => {
    // 更新文档列表
    const newFiles = files.map(file => {
      if (file.id === fileId && newTitle) {
        file.title = newTitle;
        file.isNew = false;
      }
      return file;
    })
    setFiles(newFiles);
  }, [files])

  /* 删除文档列表文档 */
  const onFileDelete = useCallback((fileId) => {
    // 更新列表 files
    const newFiles = files.filter(file => file.id !== fileId);
    console.log(newFiles)
    setFiles(newFiles);
    // 更新标签栏 files
    if (openFileIds.includes(fileId)) {
      onTabClose(fileId);
    }
  }, [files, openFileIds])

  /* 新建文档 */
  const onFileAdd = useCallback(() => {
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
        isNew: true
      }
    ]
    setFiles(newFiles);
  }, [files])

  /* 导入文档 */
  const onFileImport = useCallback(() => {

  }, [])

  const onBtnClick = () => {

  }

  /* 点击文档标签栏的文档 */
  const onTabClick = useCallback((fileId) => {
    setActiveFileId(fileId);
  }, [])

  /* 关闭文档标签栏的文档 */
  const onTabClose = useCallback((fileId) => {
    // 更新标签栏 files
    const newOpenFileIds = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(newOpenFileIds);
    // 更新打开 files
    if (newOpenFileIds.length) {
      const fileIndex = openFileIds.findIndex(id => id === fileId);
      if (fileIndex === 0) {
        setActiveFileId(newOpenFileIds[0]);
      } else {
        setActiveFileId(newOpenFileIds[fileIndex - 1]);
      }
    } else {
      setActiveFileId('');
    }
  }, [openFileIds])

  /* 更新文档内容 */
  const onFileChange = useCallback((fileId, value) => {
    // 更新列表 files
    const newFiles = files.map(file => {
      if (file.id === fileId) {
        file.body = value;
      }
      return file;
    })
    setFiles(newFiles);
    // 更新未保存 files
    if (!unsaveFileIds.includes(fileId)) {
      setUnsaveFileIds([...unsaveFileIds, fileId]);
    }
  }, [files, unsaveFileIds])

  return (
    <div className="App container-fluid px-0">
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
                  onBtnClick={onBtnClick}
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