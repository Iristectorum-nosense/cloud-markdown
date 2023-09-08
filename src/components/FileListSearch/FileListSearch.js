import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './FileListSearch.scss';
import { CloseSvg, SearchSvg, SettingSvg } from '../../util/svg';
import useKeyboard from '../../hooks/useKeyboard';
import useIpcAppMenu from '../../hooks/useIpcAppMenu';

FileListSearch.propTypes = {
  onFileSearch: PropTypes.func.isRequired,
  clickSetting: PropTypes.func.isRequired
};

export default function FileListSearch({ onFileSearch, clickSetting }) {
  const [inputActive, setInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const enterKeyPress = useKeyboard(13);
  const escKeyPress = useKeyboard(27);
  const inputRef = useRef(null);

  /* 关闭搜索 */
  const handleSearchClose = () => {
    setInputActive(false);
    setInputValue('');
    onFileSearch('');
  }

  /* 打开搜索 */
  const handleSearchClick = () => {
    setInputActive(true);
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  /* 打开设置 */
  const handleSettingClick = () => {
    clickSetting();
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
  }, [enterKeyPress, escKeyPress])

  useEffect(() => {
    if (inputActive) {
      // 自动聚焦
      inputRef.current.focus();
    }
  }, [inputActive])

  useIpcAppMenu('search-file', handleSearchClick);

  return (
    <div className="alert alert-primary mb-0 no-border">
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
              <button className="icon-button"
                type="button"
                onClick={handleSettingClick}
              >
                <SettingSvg size={32} />
              </button>
              <span style={{ fontSize: '24px' }}>文档列表</span>
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