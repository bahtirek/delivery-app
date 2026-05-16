import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { queryKeys } from './queryKeys';

export const useUser = (id: string) =>
  useQuery({
    queryKey: queryKeys.user.detail(id),
    queryFn:  () => userService.getById(id),
    enabled: !!id,
  });
