import { apiClient } from './apiClient';
import type { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  user: User;
}

export const authService = {
  /**
   * Mock login: JSON Server has no real auth, so we find the user by email.
   * Replace this with a real POST /auth/login when the backend is ready.
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const users = await apiClient.get<User[]>(`/users?email=${encodeURIComponent(payload.email)}`);
    if (!users.length) throw new Error('No account found with that email.');
    const user = users[0];
    // Mock token — replace with real JWT from backend
    const token = `mock-token-${user.id}-${Date.now()}`;
    return { token, userId: user.id, user };
  },

  /**
   * Mock register: creates a new user in JSON Server.
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const newUser = await apiClient.post<User>('/users', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      addresses: [],
      paymentMethods: [],
    });
    const token = `mock-token-${newUser.id}-${Date.now()}`;
    return { token, userId: newUser.id, user: newUser };
  },
};
