/**
 * ScienceScreen — static educational content explaining the Loadstone concept.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Pill, Screen } from '../components/ui';
import { colors, spacing, typography } from '../theme';

interface Section {
  tag: string;
  title: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    tag: 'The idea',
    title: 'What is structured water?',
    body:
      'Water is not a static fluid — its molecules constantly form and reform hydrogen-bond networks. "Structured" or ordered water refers to states where those networks settle into more organized, lower-energy arrangements. The Loadstone flask is built around the premise that a sustained magnetic field nudges bulk water toward these more ordered clusters before you drink it.',
  },
  {
    tag: 'The hardware',
    title: 'The Halbach array',
    body:
      'A Halbach array is a special arrangement of permanent magnets that concentrates the magnetic field on one side while nearly cancelling it on the other. Loadstone wraps this geometry around the flask body, so the full field is directed inward at the water column rather than leaking outward. The result is a strong, uniform field through the entire volume — not just a weak fringe near a single magnet.',
  },
  {
    tag: 'The method',
    title: 'Continuous immersion vs. brief exposure',
    body:
      'Pouring water past a magnet for a second does almost nothing — the field has no time to act on the bulk. Ordering effects are cumulative: the longer the water sits inside a uniform field, the more its hydrogen-bond network can relax into a structured state. That is why Loadstone is a flask you carry, not a gadget you wave water through. Continuous contact is the whole point.',
  },
  {
    tag: 'In practice',
    title: 'Why it may feel different',
    body:
      'Advocates report that structured water feels "smoother" and is easier to drink in volume, which in turn supports more consistent daily hydration. Whatever the mechanism, the practical win is behavioral: a beautiful flask you keep charged and close by makes you drink more water, more steadily, through the day.',
  },
];

export function ScienceScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>The Science</Text>
      <Text style={styles.subtitle}>
        How the Loadstone flask approaches structured hydration.
      </Text>

      {SECTIONS.map((s) => (
        <Card key={s.title} style={styles.card}>
          <Pill text={s.tag} tone="muted" />
          <Text style={styles.cardTitle}>{s.title}</Text>
          <Text style={styles.cardBody}>{s.body}</Text>
        </Card>
      ))}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Loadstone is a wellness product. Structured-water claims are not evaluated
          by the FDA and this app does not provide medical advice. Drink to thirst and
          to your own goals.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, marginBottom: 4 },
  subtitle: { color: colors.textDim, fontSize: 14, marginBottom: spacing.xl, lineHeight: 20 },

  card: { marginBottom: spacing.lg },
  cardTitle: { ...typography.heading, marginTop: spacing.md, marginBottom: spacing.sm },
  cardBody: { color: colors.textDim, fontSize: 15, lineHeight: 23 },

  disclaimer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginTop: spacing.sm,
  },
  disclaimerText: { color: colors.textFaint, fontSize: 12, lineHeight: 18 },
});
