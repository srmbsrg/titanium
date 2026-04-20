/**
 * Titanium — Zustand store
 * Auth, offline queue, app state, and Carb-O-Comm voice mode state.
 */

import { create } from 'zustand';

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
  login: (techId, techName, token) =>
    set({ techId, techName, token, isAuthenticated: true }),
  logout: () =>
    set({ techId: null, techName: null, token: null, isAuthenticated: false }),

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

export { QueryClient } from '@tanstack/react-query';
