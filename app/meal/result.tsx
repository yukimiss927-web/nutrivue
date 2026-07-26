import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Card, SectionHeader } from '@/components/ui';
import { NutritionGrid, SafetyBadge } from '@/components/health';
import { getLastResult } from '@/store/lastResult';
import { colors, font, radius, spacing } from '@/theme';

function BulletList({
  items,
  color,
  marker,
}: {
  items: string[];
  color: string;
  marker: string;
}) {
  if (!items?.length) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((t, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.marker, { color }]}>{marker}</Text>
          <Text style={styles.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export default function MealResult() {
  const router = useRouter();
  const data = getLastResult();

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No analysis to show.</Text>
          <Button label="Back to dashboard" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  const { result, imageUri } = data;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>Meal analysis</Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} />
        ) : null}

        {/* Suitability banner */}
        <SafetyBadge rating={result.safety.rating} summary={result.safety.summary} />

        {/* Identified foods */}
        <View>
          <SectionHeader title="On your plate" />
          <View style={styles.foodWrap}>
            {result.foods.map((f, i) => (
              <View key={i} style={styles.foodChip}>
                <Text style={styles.foodText}>{f.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nutrition */}
        <View>
          <SectionHeader title="Estimated nutrition" />
          <Card>
            <NutritionGrid macros={result.nutrition} />
          </Card>
        </View>

        {/* Concerns */}
        {result.safety.concerns?.length ? (
          <View>
            <SectionHeader title="Health concerns" />
            <Card style={{ backgroundColor: colors.dangerLight }}>
              <BulletList items={result.safety.concerns} color={colors.danger} marker="•" />
            </Card>
          </View>
        ) : null}

        {/* Recommendations */}
        <View>
          <SectionHeader title="Recommendations" />
          <Card style={{ gap: spacing.lg }}>
            <View>
              <Text style={styles.recLabel}>👍 Suggested portions</Text>
              <Text style={styles.recBody}>{result.recommendations.portions}</Text>
            </View>

            {result.recommendations.avoid_or_limit?.length ? (
              <View>
                <Text style={styles.recLabel}>🚫 Avoid or limit</Text>
                <BulletList
                  items={result.recommendations.avoid_or_limit}
                  color={colors.caution}
                  marker="–"
                />
              </View>
            ) : null}

            {result.recommendations.tips?.length ? (
              <View>
                <Text style={styles.recLabel}>💡 Tips</Text>
                <BulletList
                  items={result.recommendations.tips}
                  color={colors.primary}
                  marker="–"
                />
              </View>
            ) : null}
          </Card>
        </View>

        <Text style={styles.disclaimer}>
          Nutrivue provides general guidance based on AI estimates and is not a
          substitute for professional medical advice. Always consult your doctor
          about your diet.
        </Text>

        <Button label="Done" onPress={() => router.replace('/(tabs)')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  back: { alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontSize: font.size.md, fontWeight: font.weight.semibold },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.text },
  photo: { width: '100%', height: 220, borderRadius: radius.lg },
  foodWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  foodChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  foodText: { color: colors.primaryDark, fontSize: font.size.sm, fontWeight: font.weight.medium },
  recLabel: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recBody: { fontSize: font.size.sm, color: colors.textMuted, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', gap: spacing.sm },
  marker: { fontSize: font.size.md, fontWeight: font.weight.bold, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: font.size.sm, color: colors.text, lineHeight: 20 },
  disclaimer: {
    fontSize: font.size.xs,
    color: colors.textFaint,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
  emptyText: { fontSize: font.size.md, color: colors.textMuted },
});
