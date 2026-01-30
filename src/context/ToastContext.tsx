import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastMessage['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'], duration = 4000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] w-full max-w-xs space-y-3">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// This would ideally be in its own file (components/Toast.tsx), but is included here for simplicity.
const Toast: React.FC<{ message: ToastMessage; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, message.duration);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const baseClasses = "w-full p-4 rounded-xl shadow-2xl border text-sm font-semibold animate-fade-in-right";
  const typeClasses = {
    success: 'bg-green-900/50 border-green-700 text-green-200',
    error: 'bg-red-900/50 border-red-700 text-red-200',
    info: 'bg-blue-900/50 border-blue-700 text-blue-200',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[message.type]}`}>
      {message.message}
    </div>
  );
};