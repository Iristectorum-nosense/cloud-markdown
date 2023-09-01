import { useEffect, useState } from 'react';

export default function useKeyboard(inputKeyCode) {
  const [keyPress, setKeyPress] = useState(false);

  const handleKeyDown = ({ keyCode }) => {
    if (keyCode === inputKeyCode) {
      setKeyPress(true);
    }
  }

  const handleKeyUp = ({ keyCode }) => {
    if (keyCode === inputKeyCode) {
      setKeyPress(false);
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }
  }, [])

  return keyPress;
}
