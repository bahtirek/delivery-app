import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  token:   string | null;
  userId:  string | null;
  user:    User | null;
  setAuth: (token: string, userId: string) => void;
  setUser: (user: User) => void;
  logout:  () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:   null,
  userId:  null,
  user:    null,
  setAuth: (token, userId) => set({ token, userId }),
  setUser: (user)          => set({ user }),
  logout:  ()              => set({ token: null, userId: null, user: null }),
}));
