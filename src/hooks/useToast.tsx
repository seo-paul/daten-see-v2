'use client';

import { useState, useCallback } from 'react';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export function useToast(): { show: (message: string, type?: 'success' | 'error' | 'info') => void; toasts: JSX.Element } {
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { ...options, id };
    
    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}