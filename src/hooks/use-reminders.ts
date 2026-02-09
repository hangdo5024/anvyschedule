"use client";

import { useEffect, useRef, useCallback } from "react";
import { useNotifications } from "@/hooks/use-notifications";

type UpcomingReminder = {
  id: string;
  minutesBefore: number;
  schedule: {
    id: string;
    startTime: string;
    endTime: string;
    subject: {
      name: string;
      color: string | null;
    };
    teacherName: string | null;
    location: string | null;
  };
};

/**
 * Parses a "HH:mm" time string to minutes since midnight.
 */
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Returns today's date as YYYY-MM-DD string for localStorage keys.
 */
function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns current time as minutes since midnight.
 */
function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Checks if a reminder has already been notified today.
 */
function isAlreadyNotified(scheduleId: string): boolean {
  if (typeof window === "undefined") return true;
  const key = `reminder-${scheduleId}-${getTodayKey()}`;
  return localStorage.getItem(key) !== null;
}

/**
 * Marks a reminder as notified for today.
 */
function markAsNotified(scheduleId: string): void {
  if (typeof window === "undefined") return;
  const key = `reminder-${scheduleId}-${getTodayKey()}`;
  localStorage.setItem(key, "1");
}

export function useReminders(studentId: string | null) {
  const { sendNotification } = useNotifications();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkReminders = useCallback(async () => {
    if (!studentId) return;

    try {
      const res = await fetch(
        `/api/reminders/upcoming?studentId=${encodeURIComponent(studentId)}`
      );

      if (!res.ok) return;

      const reminders: UpcomingReminder[] = await res.json();
      const currentMinutes = getCurrentMinutes();

      for (const reminder of reminders) {
        const startMinutes = parseTimeToMinutes(reminder.schedule.startTime);
        const reminderMinutes = startMinutes - reminder.minutesBefore;

        // Check if current time is within the reminder window:
        // currentTime >= reminderTime AND currentTime < startTime
        if (
          currentMinutes >= reminderMinutes &&
          currentMinutes < startMinutes &&
          !isAlreadyNotified(reminder.schedule.id)
        ) {
          const title = `${reminder.schedule.subject.name} sắp bắt đầu!`;
          const parts: string[] = [reminder.schedule.startTime];
          if (reminder.schedule.teacherName) {
            parts.push(reminder.schedule.teacherName);
          }
          if (reminder.schedule.location) {
            parts.push(reminder.schedule.location);
          }
          const body = parts.join(" - ");

          sendNotification(title, body, "/");
          markAsNotified(reminder.schedule.id);
        }
      }
    } catch (error) {
      console.error("Failed to check reminders:", error);
    }
  }, [studentId, sendNotification]);

  useEffect(() => {
    if (!studentId) return;

    // Check immediately on mount
    checkReminders();

    // Then check every 60 seconds
    intervalRef.current = setInterval(checkReminders, 60_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [studentId, checkReminders]);
}
