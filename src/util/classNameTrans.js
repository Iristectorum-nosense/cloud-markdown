import PropTypes from 'prop-types';

classNameTrans.prototypes = {
  classNames: PropTypes.object
}

export default function classNameTrans(classNames) {
  let classNameStr = '';
  if (classNames.length !== 0) {
    for (let [key, value] of Object.entries(classNames)) {
      if (value) {
        classNameStr = classNameStr + ' ' + key;
      }
    }
  }

  return classNameStr;
}