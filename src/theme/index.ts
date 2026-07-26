/**
 * Central design tokens for Nutrivue.
 * Keeping colors / spacing / typography in one place means the whole
 * app stays visually consistent and is easy to re-theme later.
 */

export const colors = {
  // Brand
  primary: '#0EA5A4', // teal
  primaryDark: '#0B8281',
  primaryLight: '#CCFBF1',

  // Semantic (used for the safety assessment)
  safe: '#16A34A',
  safeLight: '#DCFCE7',
  caution: '#D97706',
  cautionLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  // Neutrals
  text: '#0F172A',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  border: '#E2E8F0',
  card: '#FFFFFF',
  background: '#F8FAFC',
  backgroundAlt: '#F1F5F9',
  white: '#FFFFFF',
  black: '#000000',

  // Macros (for nutrition chips)
  calories: '#F97316',
  carbs: '#8B5CF6',
  protein: '#0EA5A4',
  fats: '#EAB308',
  sodium: '#EC4899',
  sugar: '#EF4444',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const font = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
