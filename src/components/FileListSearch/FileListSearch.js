import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './FileListSearch.scss';
import { CloseSvg, SearchSvg } from '../../util/svg';
import useKeyboard from '../../hooks/useKeyboard';

FileListSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired
};

FileListSearch.defaultProps = {
  title: '文档列表'
};

export default function FileListSearch({ title, onFileSearch }) {
  const [inputActive, setInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const enterKeyPress = useKeyboard(13);
  const escKeyPress = useKeyboard(27);
  const inputRef = useRef(null);

  const handleSearchClose = () => {
    setInputActive(false);
    setInputValue('');
  }

  const handleSearchClick = () => {
    setInputActive(true);
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  useEffect(() => {
    if (enterKeyPress && inputActive) {
      // enter 触发搜索
      onFileSearch(inputValue);
    }
    if (escKeyPress && inputActive) {
      // esc 触发关闭
      handleSearchClose();
    }
  })

  useEffect(() => {
    if (inputActive) {
      // 自动聚焦
      inputRef.current.focus();
    }
  }, [inputActive])

  return (
    <div className="alert alert-primary mb-0">
      <div className="search-container">
        {
          inputActive
            ? <>
              <input className="form-control"
                value={inputValue}
                onChange={handleInputChange}
                ref={inputRef}
              />
              <button className="icon-button"
                type="button"
                onClick={handleSearchClose}
              >
                <CloseSvg size={32} />
              </button>
            </>
            : <>
              <span>{title}</span>
              <button className="icon-button"
                type="button"
                onClick={handleSearchClick}
              >
                <SearchSvg size={32} />
              </button>
            </>
        }
      </div>
    </div>
  )
}