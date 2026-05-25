import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishes, createWish, updateWish, deleteWish } from '../api/wishes';
import { Wish } from '../types';

export const useWishes = () => {
  return useQuery({
    queryKey: ['wishes'],
    queryFn: getWishes,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateWish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWish,
    onSuccess: (newWish) => {
      qc.setQueryData<Wish[]>(['wishes'], (old = []) => [...old, newWish]);
    },
  });
};

export const useUpdateWish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Wish> }) =>
      updateWish(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData<Wish[]>(['wishes'], (old = []) =>
        old.map((w) => (w.id === updated.id ? updated : w))
      );
    },
  });
};

export const useDeleteWish = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWish,
    onSuccess: (_, id) => {
      qc.setQueryData<Wish[]>(['wishes'], (old = []) =>
        old.filter((w) => w.id !== id)
      );
    },
  });
};
