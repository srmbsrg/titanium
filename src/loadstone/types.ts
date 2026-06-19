/**
 * Loadstone — domain types
 */

/** A single logged drink from the Loadstone flask. */
export interface DrinkLog {
  id: string;
  /** Volume consumed, in fluid ounces. */
  amountOz: number;
  /** Epoch milliseconds when the drink was logged. */
  timestamp: number;
}

/** User-configurable preferences, persisted locally. */
export interface Settings {
  /** Daily hydration target in fluid ounces. */
  dailyGoalOz: number;
  /** Whether hydration reminders are enabled. */
  remindersEnabled: boolean;
  /** Preferred reminder time, stored as 24h "HH:MM". */
  reminderTime: string;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoalOz: 64,
  remindersEnabled: false,
  reminderTime: '09:00',
};

/** Quick-log presets surfaced as tap targets. 32oz == one full flask. */
export const POUR_PRESETS: { label: string; amountOz: number; note: string }[] = [
  { label: '8 oz', amountOz: 8, note: 'A glass' },
  { label: '16 oz', amountOz: 16, note: 'Half flask' },
  { label: '32 oz', amountOz: 32, note: 'Full flask' },
];

/** Recommended magnetic contact time before drinking, in seconds. */
export const PROTOCOL_DURATION_SEC = 30 * 60;
