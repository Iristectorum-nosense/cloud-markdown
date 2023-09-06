import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './FileList.scss';
import { CloseSvg, FileSvg } from '../../util/svg';
import useKeyboard from '../../hooks/useKeyboard';
import { duplicateTitle, validateTitle } from '../../util/titleCheck';
import { getParentNode } from '../../util/domAction';

const { createCtxMenu } = window.remoteMenuAPI;

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func.isRequired,
  onTitleEdit: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired,
  onMsgCtn: PropTypes.func.isRequired
};

export default function FileList({ files, onFileClick, onTitleEdit, onFileDelete, onMsgCtn }) {
  const [editId, setEditId] = useState(null);
  const [titleValue, setTitleValue] = useState('');
  const enterKeyPress = useKeyboard(13);
  const escKeyPress = useKeyboard(27);
  const editRef = useRef(null);
  const menuRef = useRef(null);

  const handleEditChange = (e) => {
    setTitleValue(e.target.value);
  }

  /* 取消文件命名 */
  const handleEditClose = (editItem, status) => {
    setEditId(null);
    setTitleValue('');

    if (editItem.isNew) {
      switch (status) {
        case 'enter':  // 重命名为空
          if (!titleValue) onFileDelete(editItem);
          break;
        default:
          onFileDelete(editItem);
          break;
      }
    }
  }

  /* 编辑文件名称 */
  const handleTitleEdit = (file) => {
    setEditId(file.id);
    setTitleValue(file.title);
  }

  useEffect(() => {
    const editItem = files.find(file => file.id === editId);

    if (enterKeyPress && (editId !== null)) {
      // enter 触发重命名
      if (!validateTitle(titleValue)) {
        onMsgCtn('命名不规范，不能包含 \\/:*?"<>| 等特殊字符，不能以空格和 . 开头或结尾');
      } else if (duplicateTitle(files, titleValue)) {
        onMsgCtn('文件名已存在，请输入其他名称');
      } else {
        onTitleEdit(editItem, titleValue);
        handleEditClose(editItem, 'enter');
      }
    }

    if (escKeyPress && (editId !== null)) {
      // esc 触发关闭
      handleEditClose(editItem, 'esc');
    }
  }, [enterKeyPress, escKeyPress])

  useEffect(() => {
    if (editId !== null) {
      // 自动聚焦
      editRef.current.focus();
    }
  }, [editId])

  useEffect(() => {
    // 新建文档聚焦
    const newFile = files.find(file => file.isNew);

    if (newFile) {
      setEditId(newFile.id);
      setTitleValue(newFile.title);
    }
  }, [files])

  useEffect(() => {
    // 右键上下文菜单
    const menuTemplate = [
      {
        label: '重命名',
        click: () => {
          const parentElement = getParentNode(menuRef.current, 'file-list-item');
          const fileItem = files.find(file => file.id === parentElement.dataset.id);
          handleTitleEdit(fileItem);
        }
      },
      {
        label: '删除',
        click: () => {
          const parentElement = getParentNode(menuRef.current, 'file-list-item');
          const fileItem = files.find(file => file.id === parentElement.dataset.id);
          onFileDelete(fileItem);
        }
      }
    ];

    let popupMenu = createCtxMenu(menuTemplate);

    const handleContextMenu = (e) => {
      const menuItem = e.target;
      if (menuItem.classList.contains('item-click')) {
        menuRef.current = menuItem;
        popupMenu();
      }
    }

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    }
  }, [files])

  return (
    <ul className="list-group list-group-flush file-list-container">
      {
        files.map((file) => (
          <li className="row g-0 list-group-item bg-light file-list-item"
            key={file.id}
            data-id={file.id}
          >
            {
              file.id === editId
                ? <div className="edit-item">
                  <input className="form-control"
                    value={titleValue}
                    onChange={handleEditChange}
                    ref={editRef}
                  />
                  <button className="icon-button"
                    type="button"
                    onClick={() => handleEditClose(file, 'esc')}
                  >
                    <CloseSvg size={24} />
                  </button>
                </div>
                : <>
                  <span className="col-2">
                    <FileSvg size={24} />
                  </span>
                  <span className="col-10 item-click"
                    onClick={() => onFileClick(file.id)}
                  >
                    {file.title}
                  </span>
                </>
            }
          </li>
        ))
      }
    </ul>
  )
}