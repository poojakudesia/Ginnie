import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM" 24h
  setReminderEnabled: (v: boolean) => void;
  setReminderTime: (t: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      reminderEnabled: false,
      reminderTime: '08:00',
      setReminderEnabled: (v) => set({ reminderEnabled: v }),
      setReminderTime: (t) => set({ reminderTime: t }),
    }),
    { name: 'dream-life-settings' },
  ),
);
