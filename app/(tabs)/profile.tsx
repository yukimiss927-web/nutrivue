import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Button, Card, Chip, Field, SectionHeader } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { getProfile, saveProfile } from '@/services/profile';
import { colors, font, spacing } from '@/theme';

const CONDITIONS = [
  'Diabetes (Type 1)',
  'Diabetes (Type 2)',
  'Hypertension',
  'High Cholesterol',
  'GERD / Acid Reflux',
  'Kidney Disease',
  'Heart Disease',
  'Celiac / Gluten Intolerance',
  'IBS',
];
const ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Eggs',
  'Shellfish',
  'Fish',
  'Soy',
  'Wheat / Gluten',
  'Sesame',
];
const RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Low Sodium',
  'Low Sugar',
  'Low Carb',
  'Keto',
];

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    if (p) {
      setFullName(p.full_name ?? '');
      setConditions(p.conditions ?? []);
      setAllergies(p.allergies ?? []);
      setRestrictions(p.restrictions ?? []);
      setNotes(p.notes ?? '');
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await saveProfile(user.id, {
        full_name: fullName.trim(),
        conditions,
        allergies,
        restrictions,
        notes: notes.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.warn('[profile] save failed', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>Health profile</Text>
          <Text style={styles.sub}>
            Saved securely and used to personalize every meal analysis.
          </Text>
        </View>

        <Card>
          <Field
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
          />
        </Card>

        <View>
          <SectionHeader title="Medical conditions" />
          <View style={styles.chips}>
            {CONDITIONS.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={conditions.includes(c)}
                onPress={() => setConditions((prev) => toggle(prev, c))}
              />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Allergies" />
          <View style={styles.chips}>
            {ALLERGIES.map((a) => (
              <Chip
                key={a}
                label={a}
                selected={allergies.includes(a)}
                onPress={() => setAllergies((prev) => toggle(prev, a))}
              />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Dietary restrictions" />
          <View style={styles.chips}>
            {RESTRICTIONS.map((r) => (
              <Chip
                key={r}
                label={r}
                selected={restrictions.includes(r)}
                onPress={() => setRestrictions((prev) => toggle(prev, r))}
              />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Other notes" />
          <Card>
            <Field
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Trying to reduce sodium under 1500mg/day"
              multiline
              numberOfLines={3}
              style={styles.notes}
            />
          </Card>
        </View>

        <Button
          label={saved ? '✓ Saved' : 'Save profile'}
          onPress={onSave}
          loading={saving}
        />

        <Button label="Sign out" variant="danger" onPress={() => signOut()} />

        <Text style={styles.account}>Signed in as {user?.email}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.text },
  sub: { fontSize: font.size.md, color: colors.textMuted, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  notes: { height: 90, paddingTop: spacing.md, textAlignVertical: 'top' },
  account: { textAlign: 'center', color: colors.textFaint, fontSize: font.size.xs },
});
