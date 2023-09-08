import { useMemo } from 'react';
import { SimpleMdeReact } from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import PropTypes from 'prop-types';
import { marked } from 'marked';
import './SimpleMDE.scss';

SimpleMDE.propTypes = {
  activeFile: PropTypes.object,
  onFileChange: PropTypes.func.isRequired
};

export default function SimpleMDE({ activeFile, onFileChange }) {
  /* 配置项 */
  const options = useMemo(() => {
    return {
      autofocus: true,  // 自动聚焦
      spellChecker: false,  // 拼写检查
      previewRender: () => {  // 自定义解析，easymde 库未维护预览功能
        return marked(activeFile.body);
      },
      sideBySideFullscreen: false  // 分栏不全屏
    }
  }, [activeFile])

  const handleFileChange = (value, event) => {
    const chineseRegex = /[\u4e00-\u9fff\u3000-\u303f\uff01-\uff5e]/;  // 中文检测，避免拼音导致 activeFile 更新引起组件 options 重渲染
    if (event.origin.includes('compose')) {
      if (chineseRegex.test(event.text[0])) {
        onFileChange(activeFile.id, value);
      }
    } else {
      onFileChange(activeFile.id, value);
    }
  }

  return (
    <SimpleMdeReact
      key={activeFile && activeFile.id}
      value={activeFile && activeFile.body}
      onChange={(value, event) => handleFileChange(value, event)}
      options={options}
    />
  )
}