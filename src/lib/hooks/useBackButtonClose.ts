import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';

type ModalState = {
  modal?: string;
};

export function useBackButtonClose(
  open: boolean,
  onClose: () => void,
  id: string
) {
  const pushed = useRef(false);
  const ignoreNextPopRef = useRef(false);
  const modalStackRef = useRef<string[]>([]);

  useEffect(() => {
    if (!open) return;

    const isCapacitor = typeof App !== 'undefined';
    let listener: PluginListenerHandle | null = null;

    const handlePopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }

      const currentModal =
        modalStackRef.current[modalStackRef.current.length - 1];
      if (pushed.current && currentModal === id) {
        onClose();
        modalStackRef.current.pop();
        pushed.current = false;
      }
    };

    const setupListener = async () => {
      if (isCapacitor) {
        listener = await App.addListener('backButton', () => {
          const currentModal =
            modalStackRef.current[modalStackRef.current.length - 1];
          if (currentModal === id) {
            onClose();
            return false;
          }
          return true;
        });
      }
    };

    if (!pushed.current && window?.history && !isCapacitor) {
      modalStackRef.current.push(id);
      const currentState = window.history.state as ModalState | null;
      if (currentState?.modal !== id) {
        window.history.pushState({ modal: id }, '');
      }
      pushed.current = true;
    } else if (isCapacitor) {
      modalStackRef.current.push(id);
      setupListener();
    }

    if (!isCapacitor) {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (listener) {
        listener.remove();
      }
      if (!isCapacitor) {
        window.removeEventListener('popstate', handlePopState);
      }

      if (modalStackRef.current.includes(id)) {
        if (!isCapacitor && pushed.current) {
          try {
            const currentState = window.history.state as ModalState | null;
            if (currentState?.modal === id) {
              window.history.go(-1);
            }
          } catch {
            console.warn('History manipulation error');
          }
        }
        modalStackRef.current = modalStackRef.current.filter((m) => m !== id);
        pushed.current = false;
      }
    };
  }, [open, onClose, id]);

  const ignoreNextPop = () => {
    ignoreNextPopRef.current = true;
  };

  return { ignoreNextPop };
}
