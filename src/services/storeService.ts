import { apiClient } from './apiClient';
import type { Store } from '@/types';

export const storeService = {
  getAll:   ()           => apiClient.get<Store[]>('/stores'),
  getById:  (id: string) => apiClient.get<Store>(`/stores/${id}`),
};
