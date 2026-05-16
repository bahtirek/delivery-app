import { apiClient } from './apiClient';
import type { User, Address, PaymentMethod } from '@/types';

export const userService = {
  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, data),

  /**
   * Add or update an address on the user record.
   * JSON Server stores addresses as an array inside the user object.
   * We patch the whole addresses array since JSON Server doesn't support nested array item updates.
   */
  saveAddress: async (userId: string, address: Address, existingAddresses: Address[]): Promise<User> => {
    const idx = existingAddresses.findIndex((a) => a.id === address.id);
    const updated = idx >= 0
      ? existingAddresses.map((a) => a.id === address.id ? address : a)
      : [...existingAddresses, address];
    return apiClient.patch<User>(`/users/${userId}`, { addresses: updated });
  },

  deleteAddress: async (userId: string, addressId: string, existingAddresses: Address[]): Promise<User> => {
    const updated = existingAddresses.filter((a) => a.id !== addressId);
    return apiClient.patch<User>(`/users/${userId}`, { addresses: updated });
  },

  savePaymentMethod: async (userId: string, method: PaymentMethod, existingMethods: PaymentMethod[]): Promise<User> => {
    const idx = existingMethods.findIndex((m) => m.id === method.id);
    // If new method is default, clear default on others
    const normalized = method.isDefault
      ? existingMethods.map((m) => ({ ...m, isDefault: false }))
      : existingMethods;
    const updated = idx >= 0
      ? normalized.map((m) => m.id === method.id ? method : m)
      : [...normalized, method];
    return apiClient.patch<User>(`/users/${userId}`, { paymentMethods: updated });
  },

  deletePaymentMethod: async (userId: string, methodId: string, existingMethods: PaymentMethod[]): Promise<User> => {
    const updated = existingMethods.filter((m) => m.id !== methodId);
    return apiClient.patch<User>(`/users/${userId}`, { paymentMethods: updated });
  },
};
