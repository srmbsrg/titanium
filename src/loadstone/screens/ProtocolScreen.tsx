/**
 * ProtocolScreen — the Magnetic Structuring Protocol timer.
 *
 * Loadstone recommends ~30 minutes of continuous magnetic contact before
 * drinking. This screen runs that countdown with a live pulsing field
 * animation and start / pause / reset controls.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PulseRing } from '../components/PulseRing';
import { Card, PrimaryButton, Screen } from '../components/ui';
import { PROTOCOL_DURATION_SEC } from '../types';
import { mmss } from '../format';
import { colors, radius, spacing, typography } from '../theme';

export function ProtocolScreen() {
  const [remaining, setRemaining] = useState(PROTOCOL_DURATION_SEC);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  const done = remaining === 0;
  const elapsed = PROTOCOL_DURATION_SEC - remaining;
  const progress = elapsed / PROTOCOL_DURATION_SEC;

  const start = () => {
    if (done) {
      setRemaining(PROTOCOL_DURATION_SEC);
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining(PROTOCOL_DURATION_SEC);
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Structuring Protocol</Text>
      <Text style={styles.subtitle}>
        Let the Halbach array order your water before you drink.
      </Text>

      <View style={styles.pulseWrap}>
        <PulseRing size={260} active={running}>
          <Text style={styles.timer}>{done ? 'READY' : mmss(remaining)}</Text>
          <Text style={styles.timerSub}>
            {done
              ? 'Structured & ready'
              : running
              ? 'Structuring…'
              : remaining === PROTOCOL_DURATION_SEC
              ? '30 min recommended'
              : 'Paused'}
          </Text>
        </PulseRing>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{Math.round(progress * 100)}% structured</Text>

      <View style={styles.controls}>
        {running ? (
          <PrimaryButton label="Pause" variant="outline" onPress={pause} style={styles.ctrl} />
        ) : (
          <PrimaryButton
            label={done ? 'Run again' : remaining === PROTOCOL_DURATION_SEC ? 'Start' : 'Resume'}
            onPress={start}
            style={styles.ctrl}
          />
        )}
        <PrimaryButton label="Reset" variant="ghost" onPress={reset} style={styles.ctrl} />
      </View>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Why 30 minutes?</Text>
        <Text style={styles.infoBody}>
          Brief exposure barely touches the bulk water. Sustained immersion in the
          flask&apos;s magnetic field gives hydrogen-bond networks time to settle into
          more ordered, lower-surface-tension clusters. Patience is the protocol.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, marginBottom: 4 },
  subtitle: { color: colors.textDim, fontSize: 14, marginBottom: spacing.xl, lineHeight: 20 },

  pulseWrap: { alignItems: 'center', marginVertical: spacing.lg },
  timer: { color: colors.text, fontSize: 46, fontWeight: '800', letterSpacing: 1 },
  timerSub: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: 4 },

  progressTrack: {
    height: 6,
    backgroundColor: colors.track,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  progressFill: { height: 6, backgroundColor: colors.accent, borderRadius: radius.pill },
  progressLabel: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },

  controls: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  ctrl: { flex: 1 },

  infoCard: { backgroundColor: colors.surfaceAlt },
  infoTitle: { ...typography.heading, marginBottom: spacing.sm },
  infoBody: { color: colors.textDim, fontSize: 14, lineHeight: 22 },
});
