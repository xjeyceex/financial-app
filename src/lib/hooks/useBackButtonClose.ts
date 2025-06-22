import { useEffect, useRef } from 'react';

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

    if (!pushed.current && window?.history) {
      modalStackRef.current.push(id);

      // Proper type-safe comparison
      const currentState = window.history.state as ModalState | null;
      if (currentState?.modal !== id) {
        window.history.pushState({ modal: id }, '');
      }
      pushed.current = true;
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      if (pushed.current && modalStackRef.current.includes(id)) {
        if (modalStackRef.current[modalStackRef.current.length - 1] === id) {
          try {
            const currentState = window.history.state as ModalState | null;
            if (currentState?.modal === id) {
              window.history.go(-1);
            }
          } catch (e) {
            console.warn('History manipulation error:', e);
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
