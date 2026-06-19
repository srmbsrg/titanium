/**
 * Loadstone — local persistence (offline-first, no backend).
 *
 * Hydration logs and settings are stored in AsyncStorage as JSON. All reads
 * are defensive: corrupt or missing data falls back to sane defaults so the
 * app never crashes on a bad cache.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, type DrinkLog, type Settings } from './types';

const LOGS_KEY = 'loadstone.logs.v1';
const SETTINGS_KEY = 'loadstone.settings.v1';

export async function loadLogs(): Promise<DrinkLog[]> {
  try {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (l): l is DrinkLog =>
        l != null &&
        typeof l.id === 'string' &&
        typeof l.amountOz === 'number' &&
        typeof l.timestamp === 'number',
    );
  } catch {
    return [];
  }
}

export async function saveLogs(logs: DrinkLog[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch {
    // Persistence is best-effort; in-memory state remains the source of truth
    // for this session even if a write fails.
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    // Merge over defaults so newly-added settings keys are always present.
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // best-effort
  }
}
