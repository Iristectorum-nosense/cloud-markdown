import { useEffect } from 'react';
const { ipcMenuAction } = window.ipcAppMenuAPI;

export default function useIpcAppMenu(actionType, callback) {
  useEffect(() => {
    const { on, remove } = ipcMenuAction(actionType, callback);

    on();

    return () => {
      remove();
    }
  }, [actionType, callback])
} 