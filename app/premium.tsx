import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { colors, font, radius, shadow, spacing } from '@/theme';

// One place to change the price / period later.
const PRICE = '$25';
const PERIOD = 'one-time · lifetime access';

// Paste your payment links here to enable real payments (leave '' for "coming soon").
// RAZORPAY_LINK = India (PhonePe / UPI / cards).   PAYPAL_LINK = international customers.
const RAZORPAY_LINK = '';
const PAYPAL_LINK = '';

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

  function openPay(link: string, provider: string) {
    if (link) {
      // Opens the secure checkout page (Razorpay / PayPal) in the browser.
      Linking.openURL(link).catch(() =>
        Alert.alert('Could not open the payment page. Please try again.')
      );
      return;
    }
    Alert.alert(
      'Payments coming soon 🎉',
      `${provider} checkout is being set up. Please check back shortly.`,
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

        <View style={{ gap: spacing.md }}>
          <Button
            label={`🇮🇳 UPI / PhonePe / Card — ${PRICE}`}
            onPress={() => openPay(RAZORPAY_LINK, 'Razorpay')}
          />
          <Button
            label={`🌍 Pay with PayPal — ${PRICE}`}
            variant="secondary"
            onPress={() => openPay(PAYPAL_LINK, 'PayPal')}
          />
        </View>
        <Text style={styles.trust}>
          🔒 Secure payments via Razorpay & PayPal · UPI & cards accepted
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.later}>Maybe later</Text>
        </Pressable>

        <Text style={styles.fine}>
          Payments are processed securely by Razorpay (UPI/cards) and PayPal.
          Lifetime access — pay once, use forever. Prices shown in USD.
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
  trust: { textAlign: 'center', color: colors.textFaint, fontSize: font.size.xs },
  later: { textAlign: 'center', color: colors.textMuted, fontSize: font.size.md, paddingVertical: spacing.sm },
  fine: {
    fontSize: font.size.xs,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 17,
  },
});
