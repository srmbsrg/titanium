/**
 * Loadstone — design tokens
 *
 * Dark, premium wellness palette built around the Loadstone brand:
 *   background #060A12, accent cyan #24D8E4, primary text #E6EEF4.
 */

export const colors = {
  bg: '#060A12',
  surface: '#0D1521',
  surfaceAlt: '#121E2C',
  border: '#1C2A39',

  accent: '#24D8E4',
  accentDim: '#138692',
  accentSoft: 'rgba(36, 216, 228, 0.14)',

  text: '#E6EEF4',
  textDim: '#90A2B2',
  textFaint: '#5C6C7B',

  track: '#152130',
  danger: '#F0556B',
  success: '#34D399',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 44, fontWeight: '800' as const, color: colors.text },
  title: { fontSize: 24, fontWeight: '800' as const, color: colors.text },
  heading: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyDim: { fontSize: 15, fontWeight: '400' as const, color: colors.textDim },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.textDim,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
} as const;
