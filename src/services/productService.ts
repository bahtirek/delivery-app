import { apiClient } from './apiClient';
import type { Product } from '@/types';

export const productService = {
  getByStore: (storeId: string) => apiClient.get<Product[]>(`/products?storeId=${storeId}`),
  getById:    (id: string)      => apiClient.get<Product>(`/products/${id}`),
};
