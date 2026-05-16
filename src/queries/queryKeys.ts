export const queryKeys = {
  stores: {
    all:    ['stores']                             as const,
    detail: (id: string) => ['stores', id]        as const,
  },
  products: {
    byStore: (storeId: string) => ['products', 'store', storeId] as const,
    detail:  (id: string)      => ['products', id]               as const,
  },
  orders: {
    byUser:  (userId: string)  => ['orders', 'user', userId]     as const,
    detail:  (id: string)      => ['orders', id]                 as const,
  },
  user: {
    detail:  (id: string)      => ['user', id]                   as const,
  },
} as const;
