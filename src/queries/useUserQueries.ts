import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { queryKeys } from './queryKeys';
import { useAuthStore } from '@/store';
import type { Address, PaymentMethod } from '@/types';

export const useUser = (id: string) =>
  useQuery({
    queryKey: queryKeys.user.detail(id),
    queryFn:  () => userService.getById(id),
    enabled:  !!id,
  });

export const useSaveAddress = () => {
  const queryClient = useQueryClient();
  const userId      = useAuthStore.getState().userId;
  const setUser     = useAuthStore.getState().setUser;

  return useMutation({
    mutationFn: (address: Address) => {
      const user = useAuthStore.getState().user;
      return userService.saveAddress(userId!, address, user?.addresses ?? []);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId!) });
    },
  });
};

export const useDeleteAddress = () => {
  const userId  = useAuthStore.getState().userId;
  const setUser = useAuthStore.getState().setUser;

  return useMutation({
    mutationFn: (addressId: string) => {
      const user = useAuthStore.getState().user;
      return userService.deleteAddress(userId!, addressId, user?.addresses ?? []);
    },
    onSuccess: (updatedUser) => setUser(updatedUser),
  });
};

export const useSavePaymentMethod = () => {
  const queryClient = useQueryClient();
  const userId      = useAuthStore.getState().userId;
  const setUser     = useAuthStore.getState().setUser;

  return useMutation({
    mutationFn: (method: PaymentMethod) => {
      const user = useAuthStore.getState().user;
      return userService.savePaymentMethod(userId!, method, user?.paymentMethods ?? []);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId!) });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const userId  = useAuthStore.getState().userId;
  const setUser = useAuthStore.getState().setUser;

  return useMutation({
    mutationFn: (methodId: string) => {
      const user = useAuthStore.getState().user;
      return userService.deletePaymentMethod(userId!, methodId, user?.paymentMethods ?? []);
    },
    onSuccess: (updatedUser) => setUser(updatedUser),
  });
};
