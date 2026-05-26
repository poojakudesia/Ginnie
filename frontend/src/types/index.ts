export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  familiarity: 'explorer' | 'catalyst' | 'master';
  xp: number;
  streak_count: number;
  techniques: string[];
}

export interface Wish {
  id: string;
  title: string;
  category: string;
  why: string;
  progress_label: string;
  timeline: string;
  pct_complete: number;
  is_manifested: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  entry_type: 'affirm' | 'viz' | 'sign' | 'movie' | 'gratitude' | 'photo' | 'script' | '369' | '555';
  content: Record<string, unknown>;
  wish_id?: string;
  created_at: string;
}

export type Palette = 'petal' | 'sage' | 'sand' | 'dusk';

export interface AppState {
  screen: string;
  palette: Palette;
  wishes: Wish[];
  techniques: string[];
}
