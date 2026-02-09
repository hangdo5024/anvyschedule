"use client";

import { useState, useEffect } from "react";
import { Bell, Info, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";

const DISMISSED_KEY = "notification-banner-dismissed";

export function NotificationBanner() {
  const { permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(true); // default true to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem(DISMISSED_KEY);
    setDismissed(stored === "1");
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  const handleEnable = async () => {
    await requestPermission();
  };

  // Don't render during SSR or if dismissed or if already granted
  if (!mounted || dismissed || permission === "granted") {
    return null;
  }

  // Not available in this browser
  if (typeof window !== "undefined" && !("Notification" in window)) {
    return null;
  }

  if (permission === "default") {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <Bell className="h-4 w-4 shrink-0 text-blue-500" />
        <p className="flex-1">
          Bật thông báo để nhận nhắc nhở khi đến lịch học
        </p>
        <Button
          size="sm"
          onClick={handleEnable}
          className="h-8 gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
        >
          Bật thông báo
        </Button>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
        <p className="flex-1">
          Thông báo đã bị tắt. Vui lòng bật trong cài đặt trình duyệt.
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-yellow-400 hover:bg-yellow-100 hover:text-yellow-600"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}
