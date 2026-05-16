import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { queryKeys } from './queryKeys';
import { QUERY_STALE_TIME_MS } from '@/constants';

export const useStoreProducts = (storeId: string) =>
  useQuery({
    queryKey: queryKeys.products.byStore(storeId),
    queryFn:  () => productService.getByStore(storeId),
    staleTime: QUERY_STALE_TIME_MS,
    enabled: !!storeId,
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn:  () => productService.getById(id),
    staleTime: QUERY_STALE_TIME_MS,
    enabled: !!id,
  });
