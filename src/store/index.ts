/**
 * Titanium (Carbon) - Zustand store
 * Auth, offline queue, app state, and Carb-O-Comm voice mode state.
 *
 * Auth is persisted to AsyncStorage so the tech stays signed in across app
 * restarts (token + tech identity). Call hydrateAuth() once on boot (App.tsx)
 * to rehydrate, login() persists, logout() clears.
 *
 * The offline queue holds mutating actions taken while disconnected. Screens
 * enqueue when useTitaniumStore.getState().isOnline is false; connectivity is
 * driven into setOnline() and the queue is drained by flushQueue() (both in
 * ./offline.ts, wired to @react-native-community/netinfo on app boot).
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CompletionReport,
  JobStatus,
  PaymentRecord,
  WorkOrder,
} from '../types/models';

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

// Correlated map of queue action type -> payload shape. Keeping type and
// payload correlated (rather than payload: unknown) means enqueue() call sites
// and the flush replayer are both type-checked against the same contract.
export interface OfflineQueuePayloads {
  saveWorkOrder: Omit<WorkOrder, 'id' | 'createdAt'> & { id?: string };
  updateJobStatus: { jobId: string; status: JobStatus };
  completeJob: CompletionReport;
  recordPayment: PaymentRecord;
  addJobNote: { jobId: string; body: string; author?: string };
  addJobPhoto: { jobId: string; url: string; caption?: string };
}

export type OfflineQueueType = keyof OfflineQueuePayloads;

// A fully-formed, persisted queue entry (discriminated on `type`).
export type OfflineQueueItem = {
  [K in OfflineQueueType]: {
    id: string;
    type: K;
    payload: OfflineQueuePayloads[K];
    createdAt: string;
  };
}[OfflineQueueType];

// What a caller passes to enqueue() (id + createdAt are assigned by the store).
export type OfflineQueueInput = {
  [K in OfflineQueueType]: { type: K; payload: OfflineQueuePayloads[K] };
}[OfflineQueueType];

interface OfflineQueueState {
  queue: OfflineQueueItem[];
  enqueue: (item: OfflineQueueInput) => void;
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
        {
          ...item,
          id: `q-${_nextQueueId++}`,
          createdAt: new Date().toISOString(),
        } as OfflineQueueItem,
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