import { createContext, useState, useCallback, useRef } from "react";

type ToastItem = { id: number; component: React.ReactNode; duration: number };
type ToastContextType = { addToast: (component: React.ReactNode, duration?: number) => void};

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const ref = useRef(0);

  const addToast = useCallback((component: React.ReactNode, duration = 3000) => {
    const id = ref.current++;
    setToasts(prev => [...prev, { id, component, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 left-4 md:left-auto md:w-80 flex flex-col gap-2 z-[9999]">
        {toasts.map(t => (
          <div key={t.id} style={{ animation: `toast-in-out ${t.duration}ms ease forwards` }}>
            {t.component}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

