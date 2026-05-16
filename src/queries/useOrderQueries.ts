import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { queryKeys } from './queryKeys';
import { ORDER_POLL_INTERVAL_MS } from '@/constants';
import type { Order } from '@/types';

export const useOrderHistory = (userId: string) =>
  useQuery({
    queryKey: queryKeys.orders.byUser(userId),
    queryFn:  () => orderService.getByUser(userId),
    enabled: !!userId,
  });

export const useOrder = (id: string, live = false) =>
  useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn:  () => orderService.getById(id),
    enabled: !!id,
    // Poll while tracking a live order
    refetchInterval: live ? ORDER_POLL_INTERVAL_MS : false,
  });

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order: Omit<Order, 'id'>) => orderService.create(order),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.byUser(newOrder.userId) });
    },
  });
};
