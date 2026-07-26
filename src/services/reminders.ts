import { supabase } from '@/lib/supabase';
import type { Reminder } from '@/lib/database.types';
import {
  scheduleMedicationReminder,
  scheduleHydrationReminder,
  cancelNotifications,
} from './notifications';

export async function listReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create a reminder: schedules the local alarm(s) first, then stores the row
 * (including the notification IDs) so it survives app restarts and can be
 * cancelled later.
 */
export async function createReminder(
  userId: string,
  input: {
    type: 'medication' | 'hydration';
    title: string;
    time?: string;
    intervalHours?: number;
    daysOfWeek?: number[];
  }
): Promise<Reminder> {
  let notificationIds: string[] = [];

  if (input.type === 'medication' && input.time) {
    notificationIds = await scheduleMedicationReminder(
      input.title,
      input.time,
      input.daysOfWeek
    );
  } else if (input.type === 'hydration' && input.intervalHours) {
    notificationIds = await scheduleHydrationReminder(
      input.title,
      input.intervalHours
    );
  }

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      type: input.type,
      title: input.title,
      time: input.time ?? null,
      interval_hours: input.intervalHours ?? null,
      days_of_week: input.daysOfWeek ?? null,
      enabled: true,
      notification_ids: notificationIds,
    })
    .select('*')
    .single();

  if (error) {
    // Roll back the scheduled alarms if the DB write failed.
    await cancelNotifications(notificationIds);
    throw error;
  }
  return data;
}

/** Toggle a reminder on/off, (re)scheduling or cancelling its alarms. */
export async function toggleReminder(
  reminder: Reminder,
  enabled: boolean
): Promise<Reminder> {
  let notificationIds = reminder.notification_ids;

  if (enabled) {
    if (reminder.type === 'medication' && reminder.time) {
      notificationIds = await scheduleMedicationReminder(
        reminder.title,
        reminder.time,
        reminder.days_of_week ?? undefined
      );
    } else if (reminder.type === 'hydration' && reminder.interval_hours) {
      notificationIds = await scheduleHydrationReminder(
        reminder.title,
        reminder.interval_hours
      );
    }
  } else {
    await cancelNotifications(reminder.notification_ids);
    notificationIds = [];
  }

  const { data, error } = await supabase
    .from('reminders')
    .update({ enabled, notification_ids: notificationIds })
    .eq('id', reminder.id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReminder(reminder: Reminder): Promise<void> {
  await cancelNotifications(reminder.notification_ids);
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminder.id);
  if (error) throw error;
}
