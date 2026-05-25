import client from './client';
import { JournalEntry } from '../types';

export interface JournalStats {
  total_entries: number;
  streak_days: number;
  affirm_count: number;
  viz_count: number;
  gratitude_count: number;
  sign_count: number;
  xp: number;
}

export const getJournal = async (page = 1, limit = 20): Promise<JournalEntry[]> => {
  const { data } = await client.get<JournalEntry[]>('/journal', {
    params: { page, limit },
  });
  return data;
};

export const createEntry = async (
  payload: Omit<JournalEntry, 'id' | 'created_at'>
): Promise<JournalEntry> => {
  const { data } = await client.post<JournalEntry>('/journal', payload);
  return data;
};

export const deleteEntry = async (id: string): Promise<void> => {
  await client.delete(`/journal/${id}`);
};

export const getStats = async (): Promise<JournalStats> => {
  const { data } = await client.get<JournalStats>('/journal/stats');
  return data;
};
