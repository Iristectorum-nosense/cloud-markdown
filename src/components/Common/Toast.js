import PropTypes from 'prop-types';
import './common.scss';

Toast.propTypes = {
  message: PropTypes.string,
  closeMessage: PropTypes.func.isRequired
};

export default function Toast({ message, closeMessage }) {
  return (
    <div className={message ? "toast show" : "toast"}>
      <div className="toast-header">
        提示
        <button type="button" className="btn-close" onClick={closeMessage}></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  )
}