import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Button, Card, Chip, EmptyState, Field, SectionHeader } from '@/components/ui';
import { useAuth } from '@/store/auth';
import {
  createReminder,
  deleteReminder,
  listReminders,
  toggleReminder,
} from '@/services/reminders';
import type { Reminder } from '@/lib/database.types';
import { colors, font, radius, spacing } from '@/theme';

const INTERVALS = [1, 2, 3, 4];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function validTime(t: string) {
  return /^([01]?\d|2[0-3]):[0-5]\d$/.test(t.trim());
}

export default function Reminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [type, setType] = useState<'medication' | 'hydration'>('medication');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [interval, setInterval] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setReminders(await listReminders(user.id));
    } catch (e) {
      console.warn('[reminders] load failed', e);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function add() {
    if (!user) return;
    setError(null);
    if (!title.trim()) {
      setError('Please give the reminder a name.');
      return;
    }
    if (type === 'medication' && !validTime(time)) {
      setError('Enter a valid time as HH:MM (24-hour), e.g. 08:30.');
      return;
    }
    setBusy(true);
    try {
      await createReminder(user.id, {
        type,
        title: title.trim(),
        time: type === 'medication' ? time.trim() : undefined,
        daysOfWeek: type === 'medication' ? days : undefined,
        intervalHours: type === 'hydration' ? interval : undefined,
      });
      setTitle('');
      setTime('');
      setDays([]);
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Could not create the reminder.');
    } finally {
      setBusy(false);
    }
  }

  async function onToggle(r: Reminder, enabled: boolean) {
    try {
      await toggleReminder(r, enabled);
      await load();
    } catch (e) {
      console.warn('[reminders] toggle failed', e);
    }
  }

  async function onDelete(r: Reminder) {
    try {
      await deleteReminder(r);
      await load();
    } catch (e) {
      console.warn('[reminders] delete failed', e);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>Reminders</Text>
          <Text style={styles.sub}>Never miss medication or hydration.</Text>
        </View>

        {/* New reminder form */}
        <Card style={{ gap: spacing.lg }}>
          <SectionHeader title="New reminder" />

          <View style={styles.typeRow}>
            <Chip
              label="💊 Medication"
              selected={type === 'medication'}
              onPress={() => setType('medication')}
            />
            <Chip
              label="💧 Hydration"
              selected={type === 'hydration'}
              onPress={() => setType('hydration')}
            />
          </View>

          <Field
            label="Name"
            value={title}
            onChangeText={setTitle}
            placeholder={
              type === 'medication' ? 'e.g. Metformin 500mg' : 'e.g. Drink water'
            }
          />

          {type === 'medication' ? (
            <>
              <Field
                label="Time (24-hour, HH:MM)"
                value={time}
                onChangeText={setTime}
                placeholder="08:30"
                keyboardType="numbers-and-punctuation"
              />
              <View>
                <Text style={styles.label}>Repeat on (leave empty for daily)</Text>
                <View style={styles.daysRow}>
                  {DAY_LABELS.map((d, i) => (
                    <Pressable
                      key={i}
                      onPress={() =>
                        setDays((prev) =>
                          prev.includes(i)
                            ? prev.filter((x) => x !== i)
                            : [...prev, i]
                        )
                      }
                      style={[
                        styles.dayDot,
                        days.includes(i) && styles.dayDotOn,
                      ]}
                    >
                      <Text
                        style={{
                          color: days.includes(i) ? colors.white : colors.textMuted,
                          fontWeight: font.weight.semibold,
                        }}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View>
              <Text style={styles.label}>Remind me every</Text>
              <View style={styles.typeRow}>
                {INTERVALS.map((h) => (
                  <Chip
                    key={h}
                    label={`${h}h`}
                    selected={interval === h}
                    onPress={() => setInterval(h)}
                  />
                ))}
              </View>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Add reminder" onPress={add} loading={busy} />
        </Card>

        {/* Existing reminders */}
        <View>
          <SectionHeader title="Your reminders" />
          {reminders.length === 0 ? (
            <Card>
              <EmptyState
                emoji="⏰"
                title="No reminders yet"
                subtitle="Add one above to get started."
              />
            </Card>
          ) : (
            <View style={{ gap: spacing.md }}>
              {reminders.map((r) => (
                <Card key={r.id} style={styles.reminderCard}>
                  <Text style={{ fontSize: 26 }}>
                    {r.type === 'medication' ? '💊' : '💧'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reminderTitle}>{r.title}</Text>
                    <Text style={styles.reminderMeta}>
                      {r.type === 'medication'
                        ? `Daily at ${r.time}${
                            r.days_of_week && r.days_of_week.length
                              ? ` · ${r.days_of_week
                                  .map((d) => DAY_LABELS[d])
                                  .join(' ')}`
                              : ''
                          }`
                        : `Every ${r.interval_hours} hours`}
                    </Text>
                    <Pressable onPress={() => onDelete(r)}>
                      <Text style={styles.delete}>Delete</Text>
                    </Pressable>
                  </View>
                  <Switch
                    value={r.enabled}
                    onValueChange={(v) => onToggle(r, v)}
                    trackColor={{ true: colors.primary, false: colors.border }}
                    thumbColor={colors.white}
                  />
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.text },
  sub: { fontSize: font.size.md, color: colors.textMuted, marginTop: 2 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  daysRow: { flexDirection: 'row', gap: spacing.sm },
  dayDot: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayDotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { color: colors.danger, fontSize: font.size.sm },
  reminderCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reminderTitle: { fontSize: font.size.md, fontWeight: font.weight.semibold, color: colors.text },
  reminderMeta: { fontSize: font.size.xs, color: colors.textMuted, marginTop: 2 },
  delete: { fontSize: font.size.xs, color: colors.danger, marginTop: spacing.xs },
});
