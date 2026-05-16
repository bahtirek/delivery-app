import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/storeService';
import { queryKeys } from './queryKeys';
import { QUERY_STALE_TIME_MS } from '@/constants';

export const useStores = () =>
  useQuery({
    queryKey: queryKeys.stores.all,
    queryFn:  storeService.getAll,
    staleTime: QUERY_STALE_TIME_MS,
  });

export const useStore = (id: string) =>
  useQuery({
    queryKey: queryKeys.stores.detail(id),
    queryFn:  () => storeService.getById(id),
    staleTime: QUERY_STALE_TIME_MS,
    enabled: !!id,
  });
