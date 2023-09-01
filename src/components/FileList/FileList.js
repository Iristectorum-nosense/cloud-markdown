import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './FileList.scss';
import { CloseSvg, DeleteSvg, EditSvg, FileSvg } from '../../util/svg';
import useKeyboard from '../../hooks/useKeyboard';

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func.isRequired,
  onFileEdit: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired
};

export default function FileList({ files, onFileClick, onFileEdit, onFileDelete }) {
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const enterKeyPress = useKeyboard(13);
  const escKeyPress = useKeyboard(27);
  const editRef = useRef(null);

  const handleFileEdit = (file) => {
    setEditId(file.id);
    setEditValue(file.title);
  }

  const handleEditClose = () => {
    setEditId(null);
    setEditValue('');
  }

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  }

  useEffect(() => {
    if (enterKeyPress && (editId !== null)) {
      // enter 触发重命名
      const editItem = files.find(file => file.id === editId);
      onFileEdit(editItem.id, editValue);
      handleEditClose();
    }
    if (escKeyPress && (editId !== null)) {
      // esc 触发关闭
      handleEditClose();
    }
  })

  useEffect(() => {
    if (editId !== null) {
      // 自动聚焦
      editRef.current.focus();
    }
  }, [editId])

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
                    value={editValue}
                    onChange={handleEditChange}
                    ref={editRef}
                  />
                  <button className="icon-button"
                    type="button"
                    onClick={handleEditClose}
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
                    onClick={() => handleFileEdit(file)}
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