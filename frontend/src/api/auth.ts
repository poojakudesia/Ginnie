import client from './client';
import { User } from '../types';

export interface SignupPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/signup', payload);
  return data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const oauthGoogle = async (token: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/google', { token });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await client.get<User>('/auth/me');
  return data;
};

export const updateMe = async (payload: Partial<User>): Promise<User> => {
  const { data } = await client.patch<User>('/auth/me', payload);
  return data;
};
