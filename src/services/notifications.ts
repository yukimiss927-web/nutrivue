import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Show alerts even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Ask the OS for permission to post notifications. Call once on app start. */
export async function registerForNotifications(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('[notifications] Must use a physical device for alarms.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status === 'granted';
}

/**
 * Schedule a DAILY medication reminder at HH:MM (optionally only on selected
 * weekdays). Returns the notification IDs so we can cancel them later.
 */
export async function scheduleMedicationReminder(
  title: string,
  time: string, // 'HH:MM'
  daysOfWeek?: number[] // 0=Sun..6=Sat; empty/undefined = every day
): Promise<string[]> {
  const [hour, minute] = time.split(':').map(Number);
  const body = `Time to take: ${title}`;
  const ids: string[] = [];

  if (!daysOfWeek || daysOfWeek.length === 0) {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: '💊 Medication reminder', body, sound: 'default' },
      trigger: { hour, minute, repeats: true, channelId: 'reminders' },
    });
    ids.push(id);
  } else {
    for (const day of daysOfWeek) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: '💊 Medication reminder', body, sound: 'default' },
        // Expo weekday is 1=Sun..7=Sat, so shift from our 0..6 (0=Sun).
        trigger: {
          weekday: day + 1,
          hour,
          minute,
          repeats: true,
          channelId: 'reminders',
        },
      });
      ids.push(id);
    }
  }
  return ids;
}

/**
 * Schedule repeating HYDRATION reminders every N hours across the day.
 * Uses a time-interval trigger that repeats.
 */
export async function scheduleHydrationReminder(
  title: string,
  intervalHours: number
): Promise<string[]> {
  const seconds = Math.max(1, Math.round(intervalHours * 3600));
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Hydration reminder',
      body: title || 'Time to drink some water!',
      sound: 'default',
    },
    trigger: { seconds, repeats: true, channelId: 'reminders' },
  });
  return [id];
}

/** Cancel a set of previously-scheduled notifications. */
export async function cancelNotifications(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    )
  );
}
