import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileListSearch from './components/FileListSearch/FileListSearch';
import FileList from './components/FileList/FileList';
import FileListBtn from './components/FileListBtn/FileListBtn';
import TabList from './components/TabList/TabList';

const defaultFiles = [
  {
    id: '1',
    title: 'first',
    body: 'first body',
    createTime: 1563762965704
  },
  {
    id: '2',
    title: 'second',
    body: 'second body',
    createTime: 1563762965704
  },
  {
    id: '3',
    title: '列表',
    body: '第三 body',
    createTime: 1563762965704
  },
];

const defaultUnsaveIds = [
  "1", "3"
];

function App() {
  const onBtnClick = () => {

  }

  const onTabClick = (id) => {
    console.log('click', id)
  }

  const onTabClose = (id) => {
    console.log('close', id)
  }

  return (
    <div className="App container-fluid px-0">
      <div className="row g-0">
        <div className="col-3 left">
          <FileListSearch
            onFileSearch={(value) => { console.log(value) }}
          />
          <FileList
            files={defaultFiles}
            onFileClick={(id) => { console.log(id) }}
            onFileEdit={(id, value) => { console.log(id, value) }}
            onFileDelete={(id) => { console.log(id) }}
          />
          <div className="row g-0">
            <div className="col">
              <FileListBtn
                title="新建"
                className="btn-add"
                onBtnClick={onBtnClick}
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
        </div>
        <div className="col-9 right">
          <TabList
            files={defaultFiles}
            activeId="1"
            unsaveIds={defaultUnsaveIds}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
          />
        </div>
      </div>
    </div>
  );
}

export default App;