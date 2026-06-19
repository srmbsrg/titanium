/**
 * Loadstone — small hooks.
 */

import { useEffect, useState } from 'react';

/**
 * Returns the current epoch ms, refreshed on an interval so relative timers
 * ("2h ago", countdowns) stay live without manual re-renders.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
