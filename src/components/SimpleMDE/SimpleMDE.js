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

  return (
    <SimpleMdeReact
      key={activeFile && activeFile.id}
      value={activeFile && activeFile.body}
      onChange={(value) => { onFileChange(activeFile.id, value) }}
      options={options}
    />
  )
}