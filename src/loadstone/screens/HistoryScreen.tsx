/**
 * HistoryScreen — full hydration history grouped by day.
 *
 * Pushed from the dashboard (Home stack). Shows per-day totals against goal
 * and lets the user remove individual entries.
 */

import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Screen } from '../components/ui';
import { useLoadstone, startOfToday } from '../store';
import { clockTime, dayLabel } from '../format';
import type { DrinkLog } from '../types';
import { colors, radius, spacing, typography } from '../theme';

interface DaySection {
  title: string;
  dayStart: number;
  total: number;
  data: DrinkLog[];
}

function groupByDay(logs: DrinkLog[]): DaySection[] {
  const buckets = new Map<number, DrinkLog[]>();
  for (const log of logs) {
    const d = new Date(log.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    const arr = buckets.get(key);
    if (arr) {
      arr.push(log);
    } else {
      buckets.set(key, [log]);
    }
  }
  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([dayStart, data]) => ({
      dayStart,
      title: dayStart === startOfToday() ? 'Today' : dayLabel(dayStart),
      total: data.reduce((sum, l) => sum + l.amountOz, 0),
      data: data.sort((a, b) => b.timestamp - a.timestamp),
    }));
}

export function HistoryScreen() {
  const logs = useLoadstone((s) => s.logs);
  const goal = useLoadstone((s) => s.settings.dailyGoalOz);
  const removeLog = useLoadstone((s) => s.removeLog);

  const sections = useMemo(() => groupByDay(logs), [logs]);

  if (sections.length === 0) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💧</Text>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySub}>
            Drinks you log will appear here, grouped by day.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => {
          const s = section as unknown as DaySection;
          const pct = goal > 0 ? Math.round((s.total / goal) * 100) : 0;
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionTotal}>
                {s.total} oz · {pct}%
              </Text>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.amount}>{item.amountOz} oz</Text>
            <Text style={styles.time}>{clockTime(item.timestamp)}</Text>
            <TouchableOpacity
              onPress={() => void removeLog(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.heading },
  sectionTotal: { color: colors.accent, fontSize: 14, fontWeight: '700' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.md,
  },
  amount: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  time: { color: colors.textDim, fontSize: 14, marginRight: spacing.lg },
  remove: { color: colors.danger, fontSize: 13, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.heading, marginBottom: spacing.sm },
  emptySub: { color: colors.textDim, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
