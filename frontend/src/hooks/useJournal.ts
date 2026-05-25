import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJournal, createEntry, getStats } from '../api/journal';
import { JournalEntry } from '../types';

export const useJournal = (page = 1) => {
  return useQuery({
    queryKey: ['journal', page],
    queryFn: () => getJournal(page),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEntry,
    onSuccess: (newEntry) => {
      qc.setQueryData<JournalEntry[]>(['journal', 1], (old = []) => [
        newEntry,
        ...old,
      ]);
      qc.invalidateQueries({ queryKey: ['journal-stats'] });
    },
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['journal-stats'],
    queryFn: getStats,
    staleTime: 1000 * 60 * 5,
  });
};
