import client from './client';
import { Wish } from '../types';

export const getWishes = async (): Promise<Wish[]> => {
  const { data } = await client.get<Wish[]>('/wishes');
  return data;
};

export const createWish = async (payload: Omit<Wish, 'id' | 'created_at' | 'pct_complete' | 'is_manifested'>): Promise<Wish> => {
  const { data } = await client.post<Wish>('/wishes', payload);
  return data;
};

export const updateWish = async (id: string, payload: Partial<Wish>): Promise<Wish> => {
  const { data } = await client.patch<Wish>(`/wishes/${id}`, payload);
  return data;
};

export const deleteWish = async (id: string): Promise<void> => {
  await client.delete(`/wishes/${id}`);
};
