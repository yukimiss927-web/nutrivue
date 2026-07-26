import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { colors, font, spacing } from '@/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // RouteGuard redirects to the dashboard on success.
    } catch (e: any) {
      setError(e.message ?? 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.brand}>
            <Text style={styles.logo}>🥗</Text>
            <Text style={styles.title}>Nutrivue</Text>
            <Text style={styles.subtitle}>
              Smart meal analysis, tailored to your health.
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Sign in" onPress={onSubmit} loading={loading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" style={styles.link}>
                Create one
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xxl },
  brand: { alignItems: 'center', gap: spacing.xs },
  logo: { fontSize: 56 },
  title: { fontSize: font.size.display, fontWeight: font.weight.bold, color: colors.text },
  subtitle: { fontSize: font.size.md, color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger, fontSize: font.size.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  footerText: { color: colors.textMuted, fontSize: font.size.sm },
  link: { color: colors.primary, fontSize: font.size.sm, fontWeight: font.weight.semibold },
});
