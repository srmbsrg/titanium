/**
 * LogDrinkScreen — primary logging surface.
 *
 * Big preset tap targets (8 / 16 / 32 oz), a custom-amount stepper, and a
 * running list of what's already been logged today. Every log persists.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card, PrimaryButton, Screen, SectionLabel } from '../components/ui';
import { useLoadstone, todaysLogs, totalOzToday } from '../store';
import { POUR_PRESETS } from '../types';
import { clockTime } from '../format';
import { useNow } from '../hooks';
import { colors, radius, spacing, typography } from '../theme';

export function LogDrinkScreen() {
  const now = useNow(1000);
  const logs = useLoadstone((s) => s.logs);
  const goal = useLoadstone((s) => s.settings.dailyGoalOz);
  const logDrink = useLoadstone((s) => s.logDrink);
  const removeLog = useLoadstone((s) => s.removeLog);

  const [custom, setCustom] = useState(20);
  const [confirm, setConfirm] = useState<string | null>(null);

  const today = todaysLogs(logs, now);
  const consumed = totalOzToday(logs, now);

  const log = useCallback(
    async (oz: number) => {
      await logDrink(oz);
      setConfirm(`Logged ${oz} oz`);
    },
    [logDrink],
  );

  return (
    <Screen scroll>
      <Text style={styles.title}>Log a drink</Text>
      <Text style={styles.subtitle}>
        {Math.round(consumed)} oz logged today · goal {goal} oz
      </Text>

      <SectionLabel>Tap to log</SectionLabel>
      <View style={styles.presetCol}>
        {POUR_PRESETS.map((p) => (
          <TouchableOpacity
            key={p.amountOz}
            style={styles.presetBtn}
            activeOpacity={0.85}
            onPress={() => log(p.amountOz)}
          >
            <View>
              <Text style={styles.presetAmount}>{p.label}</Text>
              <Text style={styles.presetNote}>{p.note}</Text>
            </View>
            <View style={styles.presetPlus}>
              <Text style={styles.presetPlusText}>+</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <SectionLabel>Custom amount</SectionLabel>
      <Card style={styles.customCard}>
        <View style={styles.stepperRow}>
          <Stepper sign="−" onPress={() => setCustom((v) => Math.max(1, v - 1))} />
          <View style={styles.customValueWrap}>
            <Text style={styles.customValue}>{custom}</Text>
            <Text style={styles.customUnit}>oz</Text>
          </View>
          <Stepper sign="+" onPress={() => setCustom((v) => Math.min(128, v + 1))} />
        </View>
        <PrimaryButton label={`Log ${custom} oz`} onPress={() => log(custom)} />
      </Card>

      {confirm ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>✓ {confirm}</Text>
        </View>
      ) : null}

      <SectionLabel>Today&apos;s log</SectionLabel>
      {today.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Nothing logged yet. Take a pour from your flask.</Text>
        </Card>
      ) : (
        <Card style={styles.logList}>
          {today.map((entry, idx) => (
            <View
              key={entry.id}
              style={[styles.logRow, idx < today.length - 1 && styles.logRowDivider]}
            >
              <Text style={styles.logAmount}>{entry.amountOz} oz</Text>
              <Text style={styles.logTime}>{clockTime(entry.timestamp)}</Text>
              <TouchableOpacity
                onPress={() => void removeLog(entry.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.logRemove}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function Stepper({ sign, onPress }: { sign: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.stepper} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.stepperText}>{sign}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, marginBottom: 4 },
  subtitle: { color: colors.textDim, fontSize: 14, marginBottom: spacing.xl },

  presetCol: { gap: spacing.md, marginBottom: spacing.xl },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  presetAmount: { color: colors.text, fontSize: 22, fontWeight: '800' },
  presetNote: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  presetPlus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetPlusText: { color: colors.accent, fontSize: 24, fontWeight: '700', lineHeight: 26 },

  customCard: { marginBottom: spacing.lg },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  stepper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { color: colors.accent, fontSize: 28, fontWeight: '700', lineHeight: 30 },
  customValueWrap: { flexDirection: 'row', alignItems: 'baseline' },
  customValue: { color: colors.text, fontSize: 48, fontWeight: '800' },
  customUnit: { color: colors.textDim, fontSize: 18, marginLeft: 6 },

  confirm: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmText: { color: colors.accent, fontWeight: '700', fontSize: 14 },

  empty: { color: colors.textDim, fontSize: 14 },
  logList: { paddingVertical: spacing.xs },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  logRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  logAmount: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  logTime: { color: colors.textDim, fontSize: 14, marginRight: spacing.lg },
  logRemove: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
