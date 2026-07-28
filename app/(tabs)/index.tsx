import React, { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, EmptyState, SectionHeader } from '@/components/ui';
import { NutritionGrid } from '@/components/health';
import { useAuth } from '@/store/auth';
import { getProfile } from '@/services/profile';
import { listTodayMeals } from '@/services/meals';
import { listReminders } from '@/services/reminders';
import type { HealthProfile, MealAnalysis, Reminder } from '@/lib/database.types';
import { colors, font, radius, spacing } from '@/theme';

function sumMacros(meals: MealAnalysis[]) {
  return meals.reduce(
    (acc, m) => {
      const n = m.result?.nutrition;
      if (!n) return acc;
      acc.calories += n.calories || 0;
      acc.carbs_g += n.carbs_g || 0;
      acc.protein_g += n.protein_g || 0;
      acc.fats_g += n.fats_g || 0;
      acc.sodium_mg += n.sodium_mg || 0;
      acc.sugar_g += n.sugar_g || 0;
      return acc;
    },
    { calories: 0, carbs_g: 0, protein_g: 0, fats_g: 0, sodium_mg: 0, sugar_g: 0 }
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [meals, setMeals] = useState<MealAnalysis[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [p, m, r] = await Promise.all([
        getProfile(user.id),
        listTodayMeals(user.id),
        listReminders(user.id),
      ]);
      setProfile(p);
      setMeals(m);
      setReminders(r);
    } catch (e) {
      console.warn('[dashboard] load failed', e);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const totals = sumMacros(meals);
  const firstName = (profile?.full_name || 'there').split(' ')[0];
  const activeReminders = reminders.filter((r) => r.enabled);
  const conditionCount =
    (profile?.conditions.length ?? 0) +
    (profile?.allergies.length ?? 0) +
    (profile?.restrictions.length ?? 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting */}
        <View>
          <Text style={styles.hello}>Hi {firstName} 👋</Text>
          <Text style={styles.sub}>Let's keep your meals on track today.</Text>
        </View>

        {/* Primary action */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroEmoji}>📷</Text>
          <Text style={styles.heroTitle}>Scan a meal</Text>
          <Text style={styles.heroSub}>
            Snap your plate and get an instant safety check for your conditions.
          </Text>
          <Button label="Scan my plate" onPress={() => router.push('/(tabs)/scan')} />
        </Card>

        {/* Premium upsell */}
        <Pressable onPress={() => router.push('/premium')} style={styles.premiumBanner}>
          <Text style={{ fontSize: 26 }}>👑</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
            <Text style={styles.premiumSub}>Unlimited scans, reports & more</Text>
          </View>
          <Text style={styles.premiumCta}>$25</Text>
        </Pressable>

        {/* Daily nutrition summary */}
        <View>
          <SectionHeader title="Today's nutrition" />
          <Card>
            {meals.length === 0 ? (
              <EmptyState
                emoji="🍽️"
                title="No meals logged yet"
                subtitle="Scan your first meal to see your daily totals here."
              />
            ) : (
              <>
                <Text style={styles.mealCount}>
                  {meals.length} meal{meals.length > 1 ? 's' : ''} logged today
                </Text>
                <NutritionGrid macros={totals} />
              </>
            )}
          </Card>
        </View>

        {/* Health profile quick card */}
        <View>
          <SectionHeader
            title="Your health profile"
            action={
              <Text style={styles.linkText} onPress={() => router.push('/(tabs)/profile')}>
                Manage
              </Text>
            }
          />
          <Card>
            {conditionCount === 0 ? (
              <EmptyState
                emoji="🩺"
                title="No conditions saved"
                subtitle="Add your conditions so meal analysis is tailored to you."
              />
            ) : (
              <Text style={styles.profileSummary}>
                Tracking {conditionCount} health item
                {conditionCount > 1 ? 's' : ''} — analysis is personalized to you.
              </Text>
            )}
          </Card>
        </View>

        {/* Active reminders */}
        <View>
          <SectionHeader
            title="Active reminders"
            action={
              <Text style={styles.linkText} onPress={() => router.push('/(tabs)/reminders')}>
                View all
              </Text>
            }
          />
          <Card>
            {activeReminders.length === 0 ? (
              <EmptyState
                emoji="⏰"
                title="No active reminders"
                subtitle="Set medication or water reminders to stay on schedule."
              />
            ) : (
              <View style={{ gap: spacing.sm }}>
                {activeReminders.slice(0, 3).map((r) => (
                  <View key={r.id} style={styles.reminderRow}>
                    <Text style={{ fontSize: 20 }}>
                      {r.type === 'medication' ? '💊' : '💧'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reminderTitle}>{r.title}</Text>
                      <Text style={styles.reminderMeta}>
                        {r.type === 'medication'
                          ? `Daily at ${r.time}`
                          : `Every ${r.interval_hours}h`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  hello: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.text },
  sub: { fontSize: font.size.md, color: colors.textMuted, marginTop: 2 },
  heroCard: { gap: spacing.sm, backgroundColor: colors.primaryLight },
  heroEmoji: { fontSize: 34 },
  heroTitle: { fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.primaryDark },
  heroSub: { fontSize: font.size.sm, color: colors.primaryDark, marginBottom: spacing.sm },
  mealCount: { fontSize: font.size.sm, color: colors.textMuted, marginBottom: spacing.md },
  linkText: { color: colors.primary, fontSize: font.size.sm, fontWeight: font.weight.semibold },
  profileSummary: { fontSize: font.size.md, color: colors.text, lineHeight: 22 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reminderTitle: { fontSize: font.size.md, fontWeight: font.weight.medium, color: colors.text },
  reminderMeta: { fontSize: font.size.xs, color: colors.textMuted },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumTitle: { fontSize: font.size.md, fontWeight: font.weight.bold, color: '#B45309' },
  premiumSub: { fontSize: font.size.xs, color: '#B45309', marginTop: 1 },
  premiumCta: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: '#B45309',
  },
});
