/**
 * Offline connectivity + queue flush for Titanium (Carbon).
 *
 * - initConnectivity() subscribes to @react-native-community/netinfo, drives the
 *   result into the store's setOnline(), and flushes the queue on every
 *   offline -> online transition. Call it once on app boot (App.tsx); it is
 *   idempotent and returns an unsubscribe fn.
 * - flushQueue() replays queued mutating actions oldest-first against the live
 *   Carbon/Manifold API, dequeuing each on success and stopping on the first
 *   failure (so a transient error/back-offline doesn't drop later items).
 *
 * Screens enqueue via useTitaniumStore.getState().enqueue({ type, payload })
 * when isOnline is false; the discriminated OfflineQueueItem union keeps the
 * replayer below exhaustive and type-safe.
 */

import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { useTitaniumStore } from './index';
import type { OfflineQueueItem } from './index';
import { carbonClient, addCarbonJobNote, addCarbonJobPhoto } from '../api/carbonClient';

function isOnlineFromState(state: NetInfoState): boolean {
  // isInternetReachable is null until NetInfo has probed; treat unknown as
  // reachable so we don't wrongly gate the app offline on first read.
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function replay(item: OfflineQueueItem): Promise<void> {
  switch (item.type) {
    case 'updateJobStatus':
      await carbonClient.updateJobStatus(item.payload.jobId, item.payload.status);
      return;
    case 'completeJob':
      await carbonClient.completeJob(item.payload);
      return;
    case 'recordPayment':
      await carbonClient.recordPayment(item.payload);
      return;
    case 'saveWorkOrder':
      await carbonClient.saveWorkOrder(item.payload);
      return;
    case 'addJobNote':
      await addCarbonJobNote(item.payload.jobId, item.payload.body, item.payload.author);
      return;
    case 'addJobPhoto':
      await addCarbonJobPhoto(item.payload.jobId, item.payload.url, item.payload.caption);
      return;
  }
}

let flushing = false;

/**
 * Drain the offline queue oldest-first. Each item is replayed then dequeued on
 * success; the first failure stops the run and leaves the remaining items for
 * the next flush. Safe to call repeatedly and concurrently (re-entrancy guarded).
 */
export async function flushQueue(): Promise<void> {
  if (flushing) return;
  const store = useTitaniumStore.getState();
  if (store.queue.length === 0) return;
  flushing = true;
  try {
    // Snapshot so newly-enqueued items during the run wait for the next flush.
    for (const item of [...useTitaniumStore.getState().queue]) {
      try {
        await replay(item);
        useTitaniumStore.getState().dequeue(item.id);
      } catch {
        // Likely back offline or a server error; retry on the next flush.
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

let unsubscribe: (() => void) | null = null;

/**
 * Wire NetInfo -> store.setOnline and flush the queue on reconnect.
 * Idempotent: repeated calls return the existing unsubscribe fn.
 */
export function initConnectivity(): () => void {
  if (unsubscribe) return unsubscribe;

  // Seed current connectivity immediately.
  NetInfo.fetch()
    .then((state) => {
      const online = isOnlineFromState(state);
      useTitaniumStore.getState().setOnline(online);
      if (online) void flushQueue();
    })
    .catch(() => {});

  const sub = NetInfo.addEventListener((state) => {
    const wasOnline = useTitaniumStore.getState().isOnline;
    const online = isOnlineFromState(state);
    useTitaniumStore.getState().setOnline(online);
    // Flush only on the offline -> online edge.
    if (online && !wasOnline) void flushQueue();
  });

  unsubscribe = () => {
    sub();
    unsubscribe = null;
  };
  return unsubscribe;
}