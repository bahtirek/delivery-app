import { create } from 'zustand';
import type { CartItem, Product } from '@/types';

interface CartState {
  storeId: string | null;
  items:   CartItem[];
  addItem:       (product: Product) => void;
  removeItem:    (productId: string) => void;
  updateQuantity:(productId: string, quantity: number) => void;
  clearCart:     () => void;
  subtotal:      () => number;
  itemCount:     () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  storeId: null,
  items:   [],

  addItem: (product) => {
    const { items, storeId } = get();

    // If adding from a different store, reset the cart first
    if (storeId && storeId !== product.storeId) {
      set({ storeId: product.storeId, items: [{ product, quantity: 1 }] });
      return;
    }

    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ storeId: product.storeId, items: [...items, { product, quantity: 1 }] });
    }
  },

  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((s) => ({
      items: s.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ storeId: null, items: [] }),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  itemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
