import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '@/theme';

type Rating = 'safe' | 'caution' | 'avoid';

const RATING_META: Record<
  Rating,
  { label: string; emoji: string; bg: string; fg: string }
> = {
  safe: { label: 'Safe to eat', emoji: '✅', bg: colors.safeLight, fg: colors.safe },
  caution: {
    label: 'Eat with caution',
    emoji: '⚠️',
    bg: colors.cautionLight,
    fg: colors.caution,
  },
  avoid: { label: 'Best avoided', emoji: '🚫', bg: colors.dangerLight, fg: colors.danger },
};

/** Big colored banner summarising suitability for the user's conditions. */
export function SafetyBadge({
  rating,
  summary,
}: {
  rating: Rating;
  summary?: string;
}) {
  const meta = RATING_META[rating] ?? RATING_META.caution;
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.badgeLabel, { color: meta.fg }]}>{meta.label}</Text>
        {summary ? (
          <Text style={[styles.badgeSummary, { color: meta.fg }]}>{summary}</Text>
        ) : null}
      </View>
    </View>
  );
}

interface Macros {
  calories: number;
  carbs_g: number;
  protein_g: number;
  fats_g: number;
  sodium_mg: number;
  sugar_g: number;
}

const MACRO_DEFS: {
  key: keyof Macros;
  label: string;
  unit: string;
  color: string;
}[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: colors.calories },
  { key: 'carbs_g', label: 'Carbs', unit: 'g', color: colors.carbs },
  { key: 'protein_g', label: 'Protein', unit: 'g', color: colors.protein },
  { key: 'fats_g', label: 'Fats', unit: 'g', color: colors.fats },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', color: colors.sodium },
  { key: 'sugar_g', label: 'Sugar', unit: 'g', color: colors.sugar },
];

/** Six-tile grid of estimated nutrition values. */
export function NutritionGrid({ macros }: { macros: Macros }) {
  return (
    <View style={styles.grid}>
      {MACRO_DEFS.map((m) => (
        <View key={m.key} style={styles.tile}>
          <View style={[styles.dot, { backgroundColor: m.color }]} />
          <Text style={styles.tileValue}>
            {Math.round(macros[m.key] ?? 0)}
            <Text style={styles.tileUnit}> {m.unit}</Text>
          </Text>
          <Text style={styles.tileLabel}>{m.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  badgeLabel: { fontSize: font.size.lg, fontWeight: font.weight.bold },
  badgeSummary: { fontSize: font.size.sm, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '31.5%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  tileValue: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  tileUnit: { fontSize: font.size.xs, color: colors.textMuted, fontWeight: font.weight.regular },
  tileLabel: { fontSize: font.size.xs, color: colors.textMuted },
});
