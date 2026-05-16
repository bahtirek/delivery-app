import { apiClient } from './apiClient';
import type { User } from '@/types';

export const userService = {
  getById:  (id: string)              => apiClient.get<User>(`/users/${id}`),
  update:   (id: string, data: Partial<User>) => apiClient.patch<User>(`/users/${id}`, data),
};
