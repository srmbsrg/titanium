/**
 * Loadstone — formatting + copy helpers.
 */

/** "2h 14m ago", "just now", "3m ago" — compact relative time. */
export function timeAgo(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) {
    return remMins > 0 ? `${hours}h ${remMins}m ago` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

/** "9:42 AM" */
export function clockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** "Mon, Jun 9" */
export function dayLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** mm:ss countdown formatting. */
export function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Motivational copy tied to structured-water framing, selected by how close
 * the user is to their daily goal.
 */
export function motivation(progress: number): string {
  if (progress <= 0) {
    return 'Your flask has been structuring. Take the first pour and start the cascade.';
  }
  if (progress < 0.25) {
    return 'Structured water moves through tissue faster. A strong start compounds all day.';
  }
  if (progress < 0.5) {
    return 'Steady cadence beats big gulps — your cells absorb a consistent supply best.';
  }
  if (progress < 0.75) {
    return 'Past the halfway mark. Ordered water keeps your energy even, not spiky.';
  }
  if (progress < 1) {
    return 'Almost there. One more structured pour to close your daily ring.';
  }
  return 'Goal complete. Beautifully hydrated — keep the flask charged for tomorrow.';
}
