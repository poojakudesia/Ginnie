import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Palette, Wish } from '../types';
import type { MethodQuizAnswers } from '../lib/methodMatch';

interface AppStore {
  screen: string;
  palette: Palette;
  wishes: Wish[];
  techniques: string[];
  screenHistory: string[];
  authMode: 'signup' | 'signin';
  methodQuiz: MethodQuizAnswers | null;
  goto: (screen: string) => void;
  goBack: () => void;
  setPalette: (palette: Palette) => void;
  setWishes: (wishes: Wish[]) => void;
  addWish: (wish: Wish) => void;
  removeWish: (id: string) => void;
  manifestWish: (id: string) => void;
  setTechniques: (techniques: string[]) => void;
  setAuthMode: (mode: 'signup' | 'signin') => void;
  setMethodQuiz: (answers: MethodQuizAnswers) => void;
}

const PALETTE_VARS: Record<Palette, Record<string, string>> = {
  petal: {
    '--paper': '#FCF1F0',
    '--card': '#FFF8F7',
    '--ink': '#3B1F26',
    '--ink-2': '#5A3040',
    '--muted': '#9B7080',
    '--line': 'rgba(59,31,38,0.10)',
    '--line-strong': 'rgba(59,31,38,0.20)',
    '--btn': '#7C3763',
    '--btn-deep': '#5B2D5E',
    '--btn-text': '#FFFFFF',
    '--accent': '#C97BA8',
    '--accent-soft': 'rgba(124,55,99,0.12)',
  },
  sage: {
    '--paper': '#F4EFE5',
    '--card': '#FDFAF4',
    '--ink': '#211F1A',
    '--ink-2': '#3D3A32',
    '--muted': '#7A7260',
    '--line': 'rgba(33,31,26,0.10)',
    '--line-strong': 'rgba(33,31,26,0.20)',
    '--btn': '#DC8551',
    '--btn-deep': '#B86838',
    '--btn-text': '#FFFFFF',
    '--accent': '#C4A96A',
    '--accent-soft': 'rgba(220,133,81,0.12)',
  },
  sand: {
    '--paper': '#F5F0E8',
    '--card': '#FDFBF6',
    '--ink': '#2A2318',
    '--ink-2': '#4A3E2A',
    '--muted': '#8A7A5A',
    '--line': 'rgba(42,35,24,0.10)',
    '--line-strong': 'rgba(42,35,24,0.20)',
    '--btn': '#A0845C',
    '--btn-deep': '#7A6040',
    '--btn-text': '#FFFFFF',
    '--accent': '#C4A96A',
    '--accent-soft': 'rgba(160,132,92,0.12)',
  },
  dusk: {
    '--paper': '#1A1525',
    '--card': '#221D30',
    '--ink': '#EDE8F5',
    '--ink-2': '#C4BADC',
    '--muted': '#7A6E96',
    '--line': 'rgba(237,232,245,0.10)',
    '--line-strong': 'rgba(237,232,245,0.20)',
    '--btn': '#8B5CF6',
    '--btn-deep': '#6D28D9',
    '--btn-text': '#FFFFFF',
    '--accent': '#C084FC',
    '--accent-soft': 'rgba(139,92,246,0.15)',
  },
};

export const applyPalette = (palette: Palette) => {
  const vars = PALETTE_VARS[palette];
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
  screen: 'welcome',
  palette: 'petal',
  wishes: [],
  techniques: [],
  screenHistory: [],
  authMode: 'signup',
  methodQuiz: null,

  goto: (screen) => {
    const current = get().screen;
    set((state) => ({
      screen,
      screenHistory: [...state.screenHistory, current],
    }));
  },

  goBack: () => {
    const history = get().screenHistory;
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set((state) => ({
      screen: prev,
      screenHistory: state.screenHistory.slice(0, -1),
    }));
  },

  setPalette: (palette) => {
    applyPalette(palette);
    set({ palette });
  },

  setWishes: (wishes) => set({ wishes }),

  addWish: (wish) =>
    set((state) => ({ wishes: [...state.wishes, wish] })),

  removeWish: (id) =>
    set((state) => ({ wishes: state.wishes.filter((w) => w.id !== id) })),

  manifestWish: (id) =>
    set((state) => ({
      wishes: state.wishes.map((w) =>
        w.id === id ? { ...w, is_manifested: true, pct_complete: 100 } : w,
      ),
    })),

  setTechniques: (techniques) => set({ techniques }),

  setAuthMode: (mode) => set({ authMode: mode }),

  setMethodQuiz: (answers) => set({ methodQuiz: answers }),
    }),
    {
      name: 'dream-life-app',
      // Persist only serializable progress state (not the action fns)
      partialize: (state) => ({
        screen: state.screen,
        palette: state.palette,
        wishes: state.wishes,
        techniques: state.techniques,
        authMode: state.authMode,
        methodQuiz: state.methodQuiz,
      }),
    },
  ),
);

export { PALETTE_VARS };
