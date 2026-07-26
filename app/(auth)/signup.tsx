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

export default function SignUp() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setNotice(null);
    if (!fullName || !email || !password) {
      setError('Please fill in every field.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      setNotice(
        'Account created! If email confirmation is on, check your inbox, ' +
          'then sign in.'
      );
    } catch (e: any) {
      setError(e.message ?? 'Could not create the account.');
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Your health data stays private to you.
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <Field
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jordan Smith"
            />
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
              placeholder="At least 6 characters"
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}

            <Button label="Create account" onPress={onSubmit} loading={loading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" style={styles.link}>
                Sign in
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
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.text },
  subtitle: { fontSize: font.size.md, color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger, fontSize: font.size.sm },
  notice: { color: colors.safe, fontSize: font.size.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  footerText: { color: colors.textMuted, fontSize: font.size.sm },
  link: { color: colors.primary, fontSize: font.size.sm, fontWeight: font.weight.semibold },
});
