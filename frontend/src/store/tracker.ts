import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DayCheck {
  done: boolean;
  proofName?: string;
}

export interface DayRecord {
  checks: Record<string, DayCheck>; // keyed by practice appId
  mood?: string;                     // one of MOODS ids
}

export interface EnergyCheckResult {
  date: string;                      // YYYY-MM-DD
  tier: string;                      // 'thriving' | 'flow' | 'building' | 'awakening'
  answers: Record<string, string>;
}

interface TrackerStore {
  days: Record<string, DayRecord>;   // keyed by YYYY-MM-DD
  energyChecks: EnergyCheckResult[];
  lastEnergyCheck?: string;
  earnedBadge?: string;              // badge id — becomes profile pic
  reviewedWishes: string[];          // wish ids whose completion was reviewed

  toggleCheck: (date: string, appId: string) => void;
  setProof: (date: string, appId: string, name: string) => void;
  setMood: (date: string, mood: string) => void;
  recordEnergyCheck: (r: EnergyCheckResult) => void;
  setBadge: (id: string) => void;
  markReviewed: (wishId: string) => void;
}

const emptyDay = (): DayRecord => ({ checks: {} });

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set) => ({
      days: {},
      energyChecks: [],
      reviewedWishes: [],

      toggleCheck: (date, appId) =>
        set((state) => {
          const day = state.days[date] ?? emptyDay();
          const prev = day.checks[appId]?.done ?? false;
          const checks = { ...day.checks, [appId]: { ...day.checks[appId], done: !prev } };
          return { days: { ...state.days, [date]: { ...day, checks } } };
        }),

      setProof: (date, appId, name) =>
        set((state) => {
          const day = state.days[date] ?? emptyDay();
          const existing = day.checks[appId] ?? { done: true };
          const checks = { ...day.checks, [appId]: { ...existing, done: true, proofName: name } };
          return { days: { ...state.days, [date]: { ...day, checks } } };
        }),

      setMood: (date, mood) =>
        set((state) => {
          const day = state.days[date] ?? emptyDay();
          return { days: { ...state.days, [date]: { ...day, mood } } };
        }),

      recordEnergyCheck: (r) =>
        set((state) => ({
          energyChecks: [r, ...state.energyChecks].slice(0, 24),
          lastEnergyCheck: r.date,
        })),

      setBadge: (id) => set({ earnedBadge: id }),

      markReviewed: (wishId) =>
        set((state) =>
          state.reviewedWishes.includes(wishId)
            ? state
            : { reviewedWishes: [...state.reviewedWishes, wishId] },
        ),
    }),
    { name: 'dream-life-tracker' },
  ),
);
