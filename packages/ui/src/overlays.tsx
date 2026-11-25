'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from './primitives';
import { cn } from './cn';

/** Bottom sheet on phones, centred dialog on desktop. Uses the native dialog element for focus handling. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={title}
      className="m-0 mt-auto w-full max-w-none rounded-t-2xl bg-surface p-0 text-ink backdrop:bg-black/40 sm:m-auto sm:max-w-lg sm:rounded-2xl"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <Button variant="ghost" onClick={onClose} aria-label="Close">
          ✕
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}

type ToastTone = 'good' | 'bad' | 'neutral';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

/** Short confirmations ("Saved"). Errors stay until dismissed; others clear after 4 s. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const show = useCallback(
    (message: string, tone: ToastTone = 'neutral') => {
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs, { id, message, tone }]);
      if (tone !== 'bad') setTimeout(() => remove(id), 4000);
    },
    [remove],
  );
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex min-h-12 items-center gap-3 rounded-lg px-4 shadow-lg',
              t.tone === 'bad'
                ? 'bg-bad-soft text-ink'
                : t.tone === 'good'
                  ? 'bg-good-soft text-ink'
                  : 'bg-navy text-navy-ink',
            )}
          >
            <span>{t.message}</span>
            <button
              type="button"
              className="min-h-12 min-w-12 font-bold"
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
