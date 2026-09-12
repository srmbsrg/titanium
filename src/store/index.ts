/**
 * Titanium (Carbon) - Zustand store
 * Auth, offline queue, app state, and Carb-O-Comm voice mode state.
 *
 * Auth is persisted to AsyncStorage so the tech stays signed in across app
 * restarts (token + tech identity). Call hydrateAuth() once on boot (App.tsx)
 * to rehydrate, login() persists, logout() clears.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'titanium.auth.v1';

interface PersistedAuth {
  token: string;
  techId: string;
  techName: string | null;
}

interface AuthState {
  techId: string | null;
  techName: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (techId: string, techName: string, token: string) => void;
  logout: () => void;
}

interface OfflineQueueItem {
  id: string;
  type: 'saveWorkOrder' | 'updateJobStatus' | 'completeJob' | 'recordPayment';
  payload: unknown;
  createdAt: string;
}

interface OfflineQueueState {
  queue: OfflineQueueItem[];
  enqueue: (item: Omit<OfflineQueueItem, 'id' | 'createdAt'>) => void;
  dequeue: (id: string) => void;
  clearQueue: () => void;
}

interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
}

// CarbComm = Carb-O-Comm voice mode
interface CarbCommState {
  carbCommVisible: boolean;
  carbCommJobId: string | null;
  carbCommCustomerId: string | null;
  openCarbComm: (jobId?: string, customerId?: string) => void;
  closeCarbComm: () => void;
}

interface TitaniumStore
  extends AuthState,
    OfflineQueueState,
    AppState,
    CarbCommState {}

let _nextQueueId = 1;

export const useTitaniumStore = create<TitaniumStore>((set) => ({
  // Auth
  techId: null,
  techName: null,
  token: null,
  isAuthenticated: false,
  login: (techId, techName, token) => {
    set({ techId, techName, token, isAuthenticated: true });
    // Persist so the session survives an app restart. Fire-and-forget; a
    // storage failure must not block sign-in.
    const payload: PersistedAuth = { token, techId, techName };
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  },
  logout: () => {
    set({ techId: null, techName: null, token: null, isAuthenticated: false });
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
  },

  // Offline queue
  queue: [],
  enqueue: (item) =>
    set((state) => ({
      queue: [
        ...state.queue,
        { ...item, id: `q-${_nextQueueId++}`, createdAt: new Date().toISOString() },
      ],
    })),
  dequeue: (id) =>
    set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),
  clearQueue: () => set({ queue: [] }),

  // App state
  isOnline: true,
  setOnline: (online) => set({ isOnline: online }),

  // Carb-O-Comm
  carbCommVisible: false,
  carbCommJobId: null,
  carbCommCustomerId: null,
  openCarbComm: (jobId, customerId) =>
    set({ carbCommVisible: true, carbCommJobId: jobId ?? null, carbCommCustomerId: customerId ?? null }),
  closeCarbComm: () =>
    set({ carbCommVisible: false, carbCommJobId: null, carbCommCustomerId: null }),
}));

/**
 * Rehydrate the persisted auth session from AsyncStorage into the store.
 * Safe to call once on app boot. Resolves whether or not a session was found;
 * corrupt or partial data is ignored (treated as signed-out).
 */
export async function hydrateAuth(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<PersistedAuth>;
    if (saved && saved.token && saved.techId) {
      useTitaniumStore.setState({
        token: saved.token,
        techId: saved.techId,
        techName: saved.techName ?? saved.techId,
        isAuthenticated: true,
      });
    }
  } catch {
    // Corrupt/unreadable storage -> stay signed out.
  }
}

export { QueryClient } from '@tanstack/react-query';