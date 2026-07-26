// Daily practice reminder via Capacitor Local Notifications.
// All calls are safe on web (they simply no-op when not running natively).
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const REMINDER_ID = 4201;

const native = () => Capacitor.isNativePlatform();

/** Ask for notification permission (native only). Returns true if granted. */
export const requestReminderPermission = async (): Promise<boolean> => {
  if (!native()) return false;
  try {
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch {
    return false;
  }
};

/** Schedule a repeating daily reminder at hour:minute (24h). */
export const scheduleDailyReminder = async (hour: number, minute: number): Promise<void> => {
  if (!native()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: 'Your practice is waiting ✦',
          body: 'A few minutes today keeps your dream in motion.',
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ],
    });
  } catch {
    // ignore — not fatal
  }
};

/** Cancel the daily reminder. */
export const cancelDailyReminder = async (): Promise<void> => {
  if (!native()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  } catch {
    // ignore
  }
};

/** Turn the reminder on (asks permission) or off. Returns whether it's now on. */
export const setReminder = async (enabled: boolean, hour: number, minute: number): Promise<boolean> => {
  if (!enabled) {
    await cancelDailyReminder();
    return false;
  }
  const ok = await requestReminderPermission();
  if (!ok) return false;
  await scheduleDailyReminder(hour, minute);
  return true;
};
