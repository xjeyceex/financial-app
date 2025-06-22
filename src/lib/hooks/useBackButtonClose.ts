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
  const listenerRef = useRef<PluginListenerHandle | null>(null);

  useEffect(() => {
    if (!open) return;

    const isCapacitor = typeof App !== 'undefined';

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

    const handleBackButton = async (): Promise<boolean> => {
      const currentModal =
        modalStackRef.current[modalStackRef.current.length - 1];
      if (currentModal === id) {
        onClose();
        return false;
      }
      return true;
    };

    if (!isCapacitor) {
      if (!pushed.current && window?.history) {
        modalStackRef.current.push(id);
        const currentState = window.history.state as ModalState | null;
        if (currentState?.modal !== id) {
          window.history.pushState({ modal: id }, '');
        }
        pushed.current = true;
      }
      window.addEventListener('popstate', handlePopState);
    } else if (!listenerRef.current) {
      modalStackRef.current.push(id);
      App.addListener('backButton', handleBackButton)
        .then((listener) => {
          listenerRef.current = listener;
        })
        .catch(console.error);
    }

    return () => {
      if (!isCapacitor) {
        window.removeEventListener('popstate', handlePopState);
        if (pushed.current && window.history.state?.modal === id) {
          try {
            window.history.go(-1);
          } catch (e) {
            console.warn('History navigation error:', e);
          }
        }
      } else if (listenerRef.current) {
        listenerRef.current.remove().catch(console.warn);
        listenerRef.current = null;
      }

      modalStackRef.current = modalStackRef.current.filter((m) => m !== id);
      pushed.current = false;
    };
  }, [open, onClose, id]);

  const ignoreNextPop = () => {
    ignoreNextPopRef.current = true;
  };

  return { ignoreNextPop };
}
