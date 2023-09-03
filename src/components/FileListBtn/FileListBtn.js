import PropTypes from 'prop-types';
import { AddFileSvg, ImportFileSvg } from '../../util/svg';
import './FileListBtn.scss';

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
      {title === "新建" && <AddFileSvg size={24} />}
      {title === "导入" && <ImportFileSvg size={24} />}
      {title}
    </button>
  )
}