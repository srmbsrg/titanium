/**
 * SettingsScreen — daily goal, reminders toggle, and reminder time.
 *
 * All preferences persist to AsyncStorage via the store. Reminder scheduling
 * itself requires a native notifications module (out of scope for this
 * offline build) — the preference is stored and ready to wire up.
 */

import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { Card, Screen, SectionLabel } from '../components/ui';
import { useLoadstone } from '../store';
import { colors, radius, spacing, typography } from '../theme';

const GOAL_PRESETS = [48, 64, 80, 100, 128];

function parseTime(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':').map((n) => parseInt(n, 10));
  return {
    hour: Number.isFinite(h) ? h : 9,
    minute: Number.isFinite(m) ? m : 0,
  };
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function display12h(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function SettingsScreen() {
  const settings = useLoadstone((s) => s.settings);
  const update = useLoadstone((s) => s.updateSettings);

  const { hour, minute } = parseTime(settings.reminderTime);

  const setGoal = (oz: number) => void update({ dailyGoalOz: oz });
  const bumpGoal = (delta: number) =>
    void update({ dailyGoalOz: Math.max(8, Math.min(256, settings.dailyGoalOz + delta)) });

  const bumpHour = (delta: number) =>
    void update({ reminderTime: formatTime((hour + delta + 24) % 24, minute) });
  const bumpMinute = (delta: number) => {
    const total = (hour * 60 + minute + delta + 1440) % 1440;
    void update({ reminderTime: formatTime(Math.floor(total / 60), total % 60) });
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Settings</Text>

      <SectionLabel>Daily goal</SectionLabel>
      <Card style={styles.card}>
        <View style={styles.goalRow}>
          <Stepper sign="−" onPress={() => bumpGoal(-8)} />
          <View style={styles.goalValueWrap}>
            <Text style={styles.goalValue}>{settings.dailyGoalOz}</Text>
            <Text style={styles.goalUnit}>oz / day</Text>
          </View>
          <Stepper sign="+" onPress={() => bumpGoal(8)} />
        </View>
        <View style={styles.presetRow}>
          {GOAL_PRESETS.map((oz) => {
            const active = settings.dailyGoalOz === oz;
            return (
              <TouchableOpacity
                key={oz}
                style={[styles.preset, active && styles.presetActive]}
                onPress={() => setGoal(oz)}
                activeOpacity={0.8}
              >
                <Text style={[styles.presetText, active && styles.presetTextActive]}>{oz}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <SectionLabel>Reminders</SectionLabel>
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.rowTitle}>Hydration reminders</Text>
            <Text style={styles.rowSub}>A daily nudge to keep your flask charged</Text>
          </View>
          <Switch
            value={settings.remindersEnabled}
            onValueChange={(v) => void update({ remindersEnabled: v })}
            trackColor={{ false: colors.track, true: colors.accentDim }}
            thumbColor={settings.remindersEnabled ? colors.accent : '#7A8896'}
          />
        </View>

        <View
          style={[styles.timeBlock, !settings.remindersEnabled && styles.timeBlockDisabled]}
          pointerEvents={settings.remindersEnabled ? 'auto' : 'none'}
        >
          <Text style={styles.rowTitle}>Reminder time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeUnit}>
              <Stepper sign="+" small onPress={() => bumpHour(1)} />
              <Text style={styles.timeBig}>{display12h(hour, minute).split(' ')[0].split(':')[0]}</Text>
              <Stepper sign="−" small onPress={() => bumpHour(-1)} />
            </View>
            <Text style={styles.timeColon}>:</Text>
            <View style={styles.timeUnit}>
              <Stepper sign="+" small onPress={() => bumpMinute(5)} />
              <Text style={styles.timeBig}>{minute.toString().padStart(2, '0')}</Text>
              <Stepper sign="−" small onPress={() => bumpMinute(-5)} />
            </View>
            <Text style={styles.period}>{hour >= 12 ? 'PM' : 'AM'}</Text>
          </View>
          <Text style={styles.timeFull}>Scheduled for {display12h(hour, minute)} daily</Text>
        </View>
      </Card>

      <Text style={styles.note}>
        Everything you log and configure is stored on this device only. No account,
        no cloud — Loadstone works fully offline.
      </Text>
    </Screen>
  );
}

function Stepper({ sign, onPress, small }: { sign: string; onPress: () => void; small?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.stepper, small && styles.stepperSmall]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[styles.stepperText, small && styles.stepperTextSmall]}>{sign}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, marginBottom: spacing.xl },
  card: { marginBottom: spacing.xl },

  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  goalValueWrap: { alignItems: 'center' },
  goalValue: { color: colors.text, fontSize: 44, fontWeight: '800' },
  goalUnit: { color: colors.textDim, fontSize: 13 },

  presetRow: { flexDirection: 'row', gap: spacing.sm },
  preset: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetActive: { backgroundColor: colors.accentSoft, borderColor: colors.accentDim },
  presetText: { color: colors.textDim, fontWeight: '700', fontSize: 14 },
  presetTextActive: { color: colors.accent },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { flex: 1, paddingRight: spacing.lg },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowSub: { color: colors.textDim, fontSize: 13, marginTop: 3 },

  timeBlock: {
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  timeBlockDisabled: { opacity: 0.4 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  timeUnit: { alignItems: 'center', gap: spacing.sm },
  timeBig: { color: colors.text, fontSize: 34, fontWeight: '800', minWidth: 50, textAlign: 'center' },
  timeColon: { color: colors.textDim, fontSize: 30, fontWeight: '800', marginBottom: 2 },
  period: { color: colors.accent, fontSize: 18, fontWeight: '800', marginLeft: spacing.sm },
  timeFull: { color: colors.textDim, fontSize: 13, textAlign: 'center', marginTop: spacing.md },

  stepper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSmall: { width: 40, height: 40, borderRadius: 20 },
  stepperText: { color: colors.accent, fontSize: 26, fontWeight: '700', lineHeight: 28 },
  stepperTextSmall: { fontSize: 20, lineHeight: 22 },

  note: { color: colors.textFaint, fontSize: 12, lineHeight: 18 },
});
