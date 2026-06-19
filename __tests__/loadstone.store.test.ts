/**
 * Loadstone — store + persistence tests.
 *
 * Verifies that logged drinks round-trip through AsyncStorage (the core
 * "persists across restarts" requirement) and that the derived helpers work.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useLoadstone,
  totalOzToday,
  lastDrink,
  todaysLogs,
} from '../src/loadstone/store';
import { timeAgo, mmss, motivation } from '../src/loadstone/format';

beforeEach(async () => {
  await AsyncStorage.clear();
  // Reset the singleton store to a clean slate between tests.
  useLoadstone.setState({ logs: [], ready: false });
});

test('logDrink persists and survives a simulated restart', async () => {
  await useLoadstone.getState().logDrink(16);
  await useLoadstone.getState().logDrink(8);

  expect(totalOzToday(useLoadstone.getState().logs)).toBe(24);

  // Simulate an app restart: wipe in-memory state, then hydrate from storage.
  useLoadstone.setState({ logs: [], ready: false });
  expect(useLoadstone.getState().logs).toHaveLength(0);

  await useLoadstone.getState().hydrate();

  const restored = useLoadstone.getState().logs;
  expect(restored).toHaveLength(2);
  expect(totalOzToday(restored)).toBe(24);
  expect(useLoadstone.getState().ready).toBe(true);
});

test('removeLog persists deletion', async () => {
  const entry = await useLoadstone.getState().logDrink(32);
  await useLoadstone.getState().removeLog(entry.id);

  useLoadstone.setState({ logs: [], ready: false });
  await useLoadstone.getState().hydrate();

  expect(useLoadstone.getState().logs).toHaveLength(0);
});

test('settings persist and merge over defaults', async () => {
  await useLoadstone.getState().updateSettings({ dailyGoalOz: 100 });

  useLoadstone.setState({ ready: false });
  await useLoadstone.getState().hydrate();

  expect(useLoadstone.getState().settings.dailyGoalOz).toBe(100);
  // Untouched keys keep their defaults.
  expect(useLoadstone.getState().settings.remindersEnabled).toBe(false);
});

test('derived helpers compute today totals and last drink', async () => {
  const now = Date.now();
  const logs = [
    { id: 'a', amountOz: 10, timestamp: now - 1000 },
    { id: 'b', amountOz: 20, timestamp: now },
    // Yesterday — excluded from today's total.
    { id: 'c', amountOz: 99, timestamp: now - 36 * 60 * 60 * 1000 },
  ];
  expect(totalOzToday(logs, now)).toBe(30);
  expect(todaysLogs(logs, now)).toHaveLength(2);
  expect(lastDrink(logs)?.id).toBe('b');
  expect(lastDrink([])).toBeNull();
});

test('format helpers', () => {
  const now = 1_000_000_000_000;
  expect(timeAgo(now, now)).toBe('just now');
  expect(timeAgo(now - 5 * 60_000, now)).toBe('5m ago');
  expect(timeAgo(now - 2 * 60 * 60_000, now)).toBe('2h ago');
  expect(mmss(1800)).toBe('30:00');
  expect(mmss(65)).toBe('1:05');
  expect(motivation(0)).toMatch(/structuring/i);
  expect(motivation(1)).toMatch(/complete/i);
});
