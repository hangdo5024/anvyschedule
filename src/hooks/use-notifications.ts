"use client";

import { useState, useEffect, useCallback } from "react";

type NotificationPermission = "default" | "denied" | "granted";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    setPermission(Notification.permission as NotificationPermission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      // Register service worker if permission granted
      if (result === "granted" && "serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (swError) {
          console.error("Service worker registration failed:", swError);
        }
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    }
  }, []);

  const sendNotification = useCallback(
    (title: string, body: string, url?: string) => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        return;
      }

      if (Notification.permission !== "granted") {
        return;
      }

      try {
        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });

        if (url) {
          notification.onclick = () => {
            window.focus();
            window.location.href = url;
            notification.close();
          };
        }
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    },
    []
  );

  return { permission, requestPermission, sendNotification };
}
