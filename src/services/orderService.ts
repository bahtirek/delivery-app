import { apiClient } from './apiClient';
import type { Order } from '@/types';

export const orderService = {
  getByUser:  (userId: string)  => apiClient.get<Order[]>(`/orders?userId=${userId}`),
  getById:    (id: string)       => apiClient.get<Order>(`/orders/${id}`),
  create:     (order: Omit<Order, 'id'>) => apiClient.post<Order>('/orders', order),
  updateStatus: (id: string, status: Order['status']) =>
    apiClient.patch<Order>(`/orders/${id}`, { status }),
};
