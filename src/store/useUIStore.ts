import { create } from 'zustand';

interface Toast {
  id:      string;
  message: string;
  type:    'success' | 'error' | 'info';
}

interface UIState {
  toasts:    Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().hideToast(id), 3000);
  },
  hideToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
