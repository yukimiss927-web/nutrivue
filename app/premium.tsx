import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { colors, font, radius, shadow, spacing } from '@/theme';

// One place to change the price / period later.
const PRICE = '$25';
const PERIOD = 'one-time · lifetime access';

// Paste your Razorpay (or Stripe) payment link here to enable real payments.
// Razorpay shows PhonePe/UPI (India) + international cards on one page.
// Leave empty ('') to keep the "coming soon" message.
const PAYMENT_LINK = '';

const BENEFITS: { icon: string; title: string; sub: string }[] = [
  { icon: '♾️', title: 'Unlimited meal scans', sub: 'Free plan is limited to 3 scans per day' },
  { icon: '📊', title: 'Full meal history & trends', sub: 'Track how you eat over weeks and months' },
  { icon: '📄', title: 'Detailed health reports', sub: 'Export a PDF to share with your doctor' },
  { icon: '⚡', title: 'Priority AI analysis', sub: 'Faster results, even at busy times' },
  { icon: '🚫', title: 'Ad-free experience', sub: 'No interruptions, ever' },
  { icon: '👨‍👩‍👧', title: 'Family profiles', sub: 'Add health profiles for your loved ones' },
];

export default function Premium() {
  const router = useRouter();

  function onBuy() {
    if (PAYMENT_LINK) {
      // Opens the secure Razorpay/Stripe checkout page in the browser.
      Linking.openURL(PAYMENT_LINK).catch(() =>
        Alert.alert('Could not open the payment page. Please try again.')
      );
      return;
    }
    Alert.alert(
      'Premium coming soon 🎉',
      'Thanks for your interest! Nutrivue Premium payments are being set up. ' +
        'Please check back shortly.',
      [{ text: 'Got it' }]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.crownWrap}>
            <Text style={{ fontSize: 40 }}>👑</Text>
          </View>
          <Text style={styles.title}>Nutrivue Premium</Text>
          <Text style={styles.subtitle}>
            Get the most out of your health journey.
          </Text>
        </View>

        {/* Price card */}
        <View style={styles.priceCard}>
          <Text style={styles.price}>{PRICE}</Text>
          <Text style={styles.period}>{PERIOD}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitSub}>{b.sub}</Text>
              </View>
              <Text style={styles.check}>✓</Text>
            </View>
          ))}
        </View>

        <Button label={`Get Premium — ${PRICE}`} onPress={onBuy} />
        <Pressable onPress={() => router.back()}>
          <Text style={styles.later}>Maybe later</Text>
        </Pressable>

        <Text style={styles.fine}>
          Payment is charged securely through the Google Play Store. Lifetime
          access — pay once, use forever. Prices may vary by region.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const GOLD = '#B45309';
const GOLD_BG = '#FEF3C7';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  back: { alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontSize: font.size.md, fontWeight: font.weight.semibold },
  header: { alignItems: 'center', gap: spacing.xs },
  crownWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: GOLD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.text },
  subtitle: { fontSize: font.size.md, color: colors.textMuted, textAlign: 'center' },
  priceCard: {
    backgroundColor: GOLD_BG,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow.card,
  },
  price: { fontSize: font.size.display, fontWeight: font.weight.bold, color: GOLD },
  period: { fontSize: font.size.sm, color: GOLD, marginTop: 2 },
  benefits: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadow.card,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  benefitIcon: { fontSize: 24, width: 30, textAlign: 'center' },
  benefitTitle: { fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.text },
  benefitSub: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 1 },
  check: { color: colors.safe, fontSize: font.size.lg, fontWeight: font.weight.bold },
  later: { textAlign: 'center', color: colors.textMuted, fontSize: font.size.md, paddingVertical: spacing.sm },
  fine: {
    fontSize: font.size.xs,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 17,
  },
});
