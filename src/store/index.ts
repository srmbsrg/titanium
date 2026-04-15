/**
 * Titanium — Zustand store
 *
 * Handles local/UI state. Server state (jobs, customers, equipment) lives
 * in React Query. This store covers:
 *   - Auth / current tech identity
 *   - Offline queue (mutations pending sync)
 *   - Active job / navigation context
 */

import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Auth slice
// ---------------------------------------------------------------------------

interface AuthState {
  techId: string | null;
  techName: string | null;
  isAuthenticated: boolean;
  login: (techId: string, techName: string) => void;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Offline queue slice
// ---------------------------------------------------------------------------

interface OfflineQueueItem {
  id: string;
  type: 'saveWorkOrder' | 'updateJobStatus';
  payload: unknown;
  createdAt: string;
}

interface OfflineQueueState {
  queue: OfflineQueueItem[];
  enqueue: (item: Omit<OfflineQueueItem, 'id' | 'createdAt'>) => void;
  dequeue: (id: string) => void;
  clearQueue: () => void;
}

// ---------------------------------------------------------------------------
// App state slice
// ---------------------------------------------------------------------------

interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
}

// ---------------------------------------------------------------------------
// Combined store
// ---------------------------------------------------------------------------

interface TitaniumStore extends AuthState, OfflineQueueState, AppState {}

let _nextQueueId = 1;

export const useTitaniumStore = create<TitaniumStore>((set) => ({
  // Auth
  techId: null,
  techName: null,
  isAuthenticated: false,
  login: (techId, techName) =>
    set({ techId, techName, isAuthenticated: true }),
  logout: () =>
    set({ techId: null, techName: null, isAuthenticated: false }),

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
        },
      ],
    })),
  dequeue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),
  clearQueue: () => set({ queue: [] }),

  // App state
  isOnline: true,
  setOnline: (online) => set({ isOnline: online }),
}));

// ---------------------------------------------------------------------------
// React Query client factory — import and use in App.tsx
// ---------------------------------------------------------------------------

export { QueryClient } from '@tanstack/react-query';
