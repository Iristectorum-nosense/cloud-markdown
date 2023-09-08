
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './common.scss';
import { CloseSvg } from '../../util/svg';

const { dialog } = window.electronAPI.remote;
const { saveSettingsToStore, getSettingsFromStore } = window.electronStoreAPI;
const { ipcYunConfig } = window.ipcAppMenuAPI;

Setting.propTypes = {
  settingStore: PropTypes.object,
  closeSetting: PropTypes.func.isRequired,
  onMsgCtn: PropTypes.func.isRequired
};

export default function Setting({ closeSetting, onMsgCtn }) {
  /* 设置选项 */
  const settingTitle = [
    '存储位置', 'AccessKey', 'SecretKey', 'Bucket'
  ];

  const settingStore = getSettingsFromStore();

  const settingMap = settingTitle.map(key => {
    return {
      key: key,
      content: settingStore[key]
    };
  });

  const [settingValue, setSettingValue] = useState(settingStore);
  const settingRef = useRef(null);

  /* 输入检验 */
  const keyPattern = (key, str) => {
    // 不设置内容
    if (!str) {
      return true;
    }

    if (key === 'Bucket') {
      const pattern = /^[a-z0-9][a-z0-9-][a-z0-9]{1,61}$/;  // 3 ~ 63 位，只含小写字母、数字、短划线，且必须以小写字母或者数字开头和结尾
      return pattern.test(str);
    } else {
      const pattern = /^[A-Za-z0-9-]{40}$/;  // 40 位，只含字母、数字、短划线
      return pattern.test(str);
    }
  }

  /* 关闭设置 */
  const handleSettingClose = () => {
    closeSetting();
  }

  const handleSettingChange = (e, key) => {
    setSettingValue({ ...settingValue, [key]: e.target.value });
  }

  const handleOpenFolder = async (key) => {
    const result = await dialog.showOpenDialog({
      title: '选择存储位置',
      defaultPath: 'C:\\Users\\Gtc\\Documents',
      properties: ['openDirectory']
    });

    if (result.filePaths.length) {
      setSettingValue({ ...settingValue, [key]: result.filePaths[0] });
    }
  }

  /* 保存设置 */
  const handleSettingSave = () => {
    // 输入校验
    const needPattenKey = settingTitle.slice(1);
    const patternResult = needPattenKey.map(key => keyPattern(key, settingValue[key]));

    if (!patternResult.includes(false)) {
      saveSettingsToStore(settingValue);
      ipcYunConfig(settingValue);
      onMsgCtn('设置成功');
    } else {
      onMsgCtn('Key 为 40 个字符，只含字母、数字、短划线；Bucket 3 ~ 63 位，只含小写字母、数字、短划线，且必须以小写字母或者数字开头和结尾');
    }
  }

  return (
    <>
      <div className="alert alert-primary mb-0 no-border setting-header">
        <button className="icon-button"
          type="button"
          onClick={handleSettingClose}
        >
          <CloseSvg size={32} />
        </button>
      </div>
      <ul className="list-group list-group-flush setting-content">
        {
          settingMap.map((item) => (
            <li className="row g-0 list-group-item bg-light setting-item"
              key={item.key}
            >
              {
                item.key === '存储位置'
                  ? <>
                    <div className="row g-0">
                      <span className="col-9">{item.key}</span>
                      <button className="col-3 btn btn-secondary"
                        type="button"
                        onClick={() => handleOpenFolder(item.key)}
                      >
                        打开
                      </button>
                    </div>
                    <input className="form-control"
                      value={settingValue[item.key]}
                      disabled={true}
                      ref={settingRef}
                    />
                  </>
                  : <>
                    <div>{item.key}</div>
                    <input className="form-control"
                      value={settingValue[item.key]}
                      onChange={(e) => handleSettingChange(e, item.key)}
                      ref={settingRef}
                    />
                  </>
              }
            </li>
          ))
        }
        <li className="row g-0 list-group-item">
          <button className="btn btn-secondary"
            type="button"
            onClick={handleSettingSave}
          >
            保存
          </button>
        </li>
      </ul>
    </>
  )
}