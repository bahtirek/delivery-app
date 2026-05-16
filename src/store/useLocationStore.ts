import { create } from 'zustand';
import type { Address } from '@/types';

interface LocationState {
  deliveryAddress: Address | null;
  setDeliveryAddress: (address: Address) => void;
  clearDeliveryAddress: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  deliveryAddress: null,
  setDeliveryAddress:   (address) => set({ deliveryAddress: address }),
  clearDeliveryAddress: ()        => set({ deliveryAddress: null }),
}));
