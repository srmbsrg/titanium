/**
 * Loadstone — small shared UI primitives (Screen, Card, Button, SectionLabel).
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';

export function Screen({
  children,
  scroll = false,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        variant === 'solid' && styles.btnSolid,
        variant === 'outline' && styles.btnOutline,
        variant === 'ghost' && styles.btnGhost,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          variant === 'solid' ? styles.btnTextSolid : styles.btnTextAccent,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Pill({ text, tone = 'accent' }: { text: string; tone?: 'accent' | 'muted' }) {
  return (
    <View style={[styles.pill, tone === 'muted' && styles.pillMuted]}>
      <Text style={[styles.pillText, tone === 'muted' && styles.pillTextMuted]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  sectionLabel: { ...typography.label, marginBottom: spacing.sm },

  btn: {
    borderRadius: radius.pill,
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSolid: { backgroundColor: colors.accent },
  btnOutline: { borderWidth: 1.5, borderColor: colors.accentDim, backgroundColor: 'transparent' },
  btnGhost: { backgroundColor: colors.surfaceAlt },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 16, fontWeight: '800' },
  btnTextSolid: { color: '#04212B' },
  btnTextAccent: { color: colors.accent },

  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  pillMuted: { backgroundColor: colors.surfaceAlt },
  pillText: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  pillTextMuted: { color: colors.textDim },
});
