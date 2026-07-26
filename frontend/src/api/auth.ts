import client from './client';
import { User } from '../types';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/signup', payload);
  return data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const oauthGoogle = async (idToken: string, name?: string, avatarUrl?: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/oauth/google', {
    provider: 'google',
    id_token: idToken,
    name,
    avatar_url: avatarUrl,
  });
  return data;
};

export const oauthFacebook = async (accessToken: string, name?: string, email?: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/oauth/facebook', {
    provider: 'facebook',
    id_token: accessToken,
    name,
    email,
  });
  return data;
};

export const oauthApple = async (idToken: string, name?: string, email?: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/oauth/apple', {
    provider: 'apple',
    id_token: idToken,
    name,
    email,
  });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await client.get<User>('/auth/me');
  return data;
};

export const updateMe = async (payload: Partial<User>): Promise<User> => {
  const { data } = await client.put<User>('/auth/me', payload);
  return data;
};

/** Change the signed-in user's password. Throws on failure (wrong current pw, etc). */
export const changePassword = async (
  current_password: string,
  new_password: string,
): Promise<void> => {
  await client.post('/auth/change-password', { current_password, new_password });
};

/** Fire-and-forget: remember the last screen so the user resumes here. */
export const saveProgress = (last_screen: string): void => {
  updateMe({ last_screen }).catch(() => {});
};

/** Fire-and-forget: persist the user's chosen practices to their profile. */
export const saveTechniques = (techniques: string[]): void => {
  updateMe({ techniques }).catch(() => {});
};
