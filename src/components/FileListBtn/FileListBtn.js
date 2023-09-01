import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AddFileSvg, ImportFileSvg } from '../../util/svg';

FileListBtn.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  onBtnClick: PropTypes.func.isRequired
};

export default function FileListBtn({ title, className, onBtnClick }) {
  return (
    <button className={`btn btn-block no-border ${className}`}
      type="button"
      onClick={onBtnClick}
    >
      {title === "新建" && <AddFileSvg size={32} />}
      {title === "导入" && <ImportFileSvg size={32} />}
      {title}
    </button>
  )
}