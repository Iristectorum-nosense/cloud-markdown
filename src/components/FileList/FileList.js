import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './FileList.scss';
import { CloseSvg, DeleteSvg, EditSvg, FileSvg } from '../../util/svg';
import useKeyboard from '../../hooks/useKeyboard';

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func.isRequired,
  onTitleEdit: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired
};

export default function FileList({ files, onFileClick, onTitleEdit, onFileDelete }) {
  const [editId, setEditId] = useState(null);
  const [titleValue, setTitleValue] = useState('');
  const enterKeyPress = useKeyboard(13);
  const escKeyPress = useKeyboard(27);
  const editRef = useRef(null);

  const handleTitleEdit = (file) => {
    setEditId(file.id);
    setTitleValue(file.title);
  }

  const handleEditClose = (editItem) => {
    setEditId(null);
    setTitleValue('');
    if (editItem.isNew) {
      onFileDelete(editItem.id);
    }
  }

  const handleEditChange = (e) => {
    setTitleValue(e.target.value);
  }

  useEffect(() => {
    const editItem = files.find(file => file.id === editId);
    if (enterKeyPress && (editId !== null)) {
      // enter 触发重命名
      onTitleEdit(editItem.id, titleValue);
      handleEditClose(editItem);
    }
    if (escKeyPress && (editId !== null)) {
      // esc 触发关闭
      handleEditClose(editItem);
    }
  }, [enterKeyPress, escKeyPress])

  useEffect(() => {
    if (editId !== null) {
      // 自动聚焦
      editRef.current.focus();
    }
  }, [editId])

  useEffect(() => {
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
                    onClick={() => handleEditClose(file)}
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
                    onClick={() => onFileDelete(file.id)}
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