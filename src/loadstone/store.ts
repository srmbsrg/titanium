/**
 * Loadstone — global hydration state (Zustand).
 *
 * State is loaded from AsyncStorage once on app start (`hydrate`) and written
 * back after every mutation, so logged drinks and settings survive restarts.
 */

import { create } from 'zustand';
import { DEFAULT_SETTINGS, type DrinkLog, type Settings } from './types';
import {
  loadLogs,
  loadSettings,
  saveLogs,
  saveSettings,
} from './storage';

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface LoadstoneState {
  logs: DrinkLog[];
  settings: Settings;
  /** True once the initial AsyncStorage read has completed. */
  ready: boolean;

  hydrate: () => Promise<void>;
  logDrink: (amountOz: number) => Promise<DrinkLog>;
  removeLog: (id: string) => Promise<void>;
  clearToday: () => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

export const useLoadstone = create<LoadstoneState>((set, get) => ({
  logs: [],
  settings: { ...DEFAULT_SETTINGS },
  ready: false,

  hydrate: async () => {
    const [logs, settings] = await Promise.all([loadLogs(), loadSettings()]);
    set({ logs, settings, ready: true });
  },

  logDrink: async (amountOz) => {
    const entry: DrinkLog = { id: makeId(), amountOz, timestamp: Date.now() };
    const logs = [entry, ...get().logs];
    set({ logs });
    await saveLogs(logs);
    return entry;
  },

  removeLog: async (id) => {
    const logs = get().logs.filter((l) => l.id !== id);
    set({ logs });
    await saveLogs(logs);
  },

  clearToday: async () => {
    const start = startOfToday();
    const logs = get().logs.filter((l) => l.timestamp < start);
    set({ logs });
    await saveLogs(logs);
  },

  updateSettings: async (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await saveSettings(settings);
  },
}));

// ---------------------------------------------------------------------------
// Derived helpers (pure functions over state — kept here so screens stay thin)
// ---------------------------------------------------------------------------

export function startOfToday(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function todaysLogs(logs: DrinkLog[], now = Date.now()): DrinkLog[] {
  const start = startOfToday(now);
  return logs.filter((l) => l.timestamp >= start);
}

export function totalOzToday(logs: DrinkLog[], now = Date.now()): number {
  return todaysLogs(logs, now).reduce((sum, l) => sum + l.amountOz, 0);
}

export function lastDrink(logs: DrinkLog[]): DrinkLog | null {
  if (logs.length === 0) {
    return null;
  }
  return logs.reduce((latest, l) =>
    l.timestamp > latest.timestamp ? l : latest,
  );
}
