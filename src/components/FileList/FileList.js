import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './FileList.scss';
import { CloseSvg, DeleteSvg, EditSvg, FileSvg } from '../../util/svg';
import useKeyboard from '../../hooks/useKeyboard';

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func.isRequired,
  onTitleEdit: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired,
  onMsgCtn: PropTypes.func.isRequired
};

/* 检查是否存在同命名文件 */
const duplicateTitle = (files, title) => {
  const titles = new Set();

  for (const file of files) {
    titles.add(file.title);
    if (titles.has(title)) {
      return true;
    }
  }

  return false;
};

/* 检查命名是否符合规则 */
const validateTitle = (title) => {
  const restrictedChars = /[\\/:*?"<>|]/;
  const startsWithSpaceDot = /^[ .]/;
  const endsWithSpaceDot = /[ .]$/;
  const maxLength = 255;

  if (
    restrictedChars.test(title) ||
    startsWithSpaceDot.test(title) ||
    endsWithSpaceDot.test(title) ||
    title.length > maxLength
  ) {
    return false;
  }

  return true;
}

export default function FileList({ files, onFileClick, onTitleEdit, onFileDelete, onMsgCtn }) {
  const [editId, setEditId] = useState(null);
  const [titleValue, setTitleValue] = useState('');
  const enterKeyPress = useKeyboard(13);
  const escKeyPress = useKeyboard(27);
  const editRef = useRef(null);

  const handleEditChange = (e) => {
    setTitleValue(e.target.value);
  }

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

  return (
    <ul className="list-group list-group-flush file-list-container">
      {
        files.map((file) => (
          <li className="row g-0 list-group-item bg-light file-list-item"
            key={file.id}
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
                  <span className="col-6 item-click"
                    onClick={() => onFileClick(file.id)}
                  >
                    {file.title}
                  </span>
                  <button className="col-2 icon-button"
                    type="button"
                    onClick={() => handleTitleEdit(file)}
                  >
                    <EditSvg size={24} />
                  </button>
                  <button className="col-2 icon-button"
                    type="button"
                    onClick={() => onFileDelete(file)}
                  >
                    <DeleteSvg size={24} />
                  </button>
                </>
            }
          </li>
        ))
      }
    </ul>
  )
}