/**
 * DashboardScreen — daily hydration overview.
 *
 * Progress ring vs. goal, time since last drink, structured-water motivation,
 * and quick-log shortcuts. This is the Home tab's root screen.
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProgressRing } from '../components/ProgressRing';
import { Card, PrimaryButton, Screen, SectionLabel } from '../components/ui';
import { useLoadstone, lastDrink, totalOzToday } from '../store';
import { POUR_PRESETS } from '../types';
import { clockTime, motivation, timeAgo } from '../format';
import { useNow } from '../hooks';
import { colors, radius, spacing, typography } from '../theme';
import type { HomeStackParamList } from '../navTypes';

type Props = NativeStackScreenProps<HomeStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const now = useNow(1000);
  const logs = useLoadstone((s) => s.logs);
  const goal = useLoadstone((s) => s.settings.dailyGoalOz);
  const logDrink = useLoadstone((s) => s.logDrink);

  const consumed = totalOzToday(logs, now);
  const progress = goal > 0 ? consumed / goal : 0;
  const remaining = Math.max(0, goal - consumed);
  const last = lastDrink(logs);

  const onQuickLog = useCallback(
    (oz: number) => {
      void logDrink(oz);
    },
    [logDrink],
  );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text style={styles.wordmark}>LOADSTONE</Text>
          <Text style={styles.tagline}>Structured Hydration</Text>
        </View>
        <Text style={styles.date}>
          {new Date(now).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.ringWrap}>
        <ProgressRing size={240} strokeWidth={18} progress={progress}>
          <Text style={styles.ringValue}>{Math.round(consumed)}</Text>
          <Text style={styles.ringUnit}>of {goal} oz</Text>
          <View style={styles.ringPct}>
            <Text style={styles.ringPctText}>{Math.round(progress * 100)}%</Text>
          </View>
        </ProgressRing>
      </View>

      <Text style={styles.remaining}>
        {remaining > 0
          ? `${Math.round(remaining)} oz to your daily goal`
          : 'Daily goal reached 🎉'}
      </Text>

      <Card style={styles.motivationCard}>
        <Text style={styles.motivation}>{motivation(progress)}</Text>
      </Card>

      <View style={styles.lastRow}>
        <Card style={styles.lastCard}>
          <SectionLabel>Last drink</SectionLabel>
          {last ? (
            <>
              <Text style={styles.lastValue}>{timeAgo(last.timestamp, now)}</Text>
              <Text style={styles.lastSub}>
                {last.amountOz} oz · {clockTime(last.timestamp)}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.lastValue}>—</Text>
              <Text style={styles.lastSub}>No drinks logged yet today</Text>
            </>
          )}
        </Card>
      </View>

      <SectionLabel>Quick log</SectionLabel>
      <View style={styles.quickRow}>
        {POUR_PRESETS.map((p) => (
          <TouchableOpacity
            key={p.amountOz}
            style={styles.quickBtn}
            activeOpacity={0.85}
            onPress={() => onQuickLog(p.amountOz)}
          >
            <Text style={styles.quickAmount}>{p.label}</Text>
            <Text style={styles.quickNote}>{p.note}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton
        label="View hydration history"
        variant="ghost"
        onPress={() => navigation.navigate('History')}
        style={styles.historyBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  wordmark: { ...typography.title, letterSpacing: 3 },
  tagline: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 2 },
  date: { color: colors.textDim, fontSize: 13, marginTop: 4 },

  ringWrap: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  ringValue: { fontSize: 56, fontWeight: '800', color: colors.text, lineHeight: 60 },
  ringUnit: { color: colors.textDim, fontSize: 15, marginTop: 2 },
  ringPct: {
    marginTop: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  ringPctText: { color: colors.accent, fontWeight: '800', fontSize: 13 },

  remaining: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },

  motivationCard: { marginBottom: spacing.lg, backgroundColor: colors.surfaceAlt },
  motivation: { color: colors.text, fontSize: 15, lineHeight: 22 },

  lastRow: { marginBottom: spacing.lg },
  lastCard: {},
  lastValue: { color: colors.text, fontSize: 26, fontWeight: '800' },
  lastSub: { color: colors.textDim, fontSize: 13, marginTop: 4 },

  quickRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  quickAmount: { color: colors.accent, fontSize: 20, fontWeight: '800' },
  quickNote: { color: colors.textDim, fontSize: 12, marginTop: 4 },

  historyBtn: { marginTop: spacing.xs },
});
