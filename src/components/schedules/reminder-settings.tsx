"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Reminder = {
  id: string;
  minutesBefore: number;
  isEnabled: boolean;
};

type ReminderSettingsProps = {
  scheduleId: string;
  reminders: Reminder[];
};

export function ReminderSettings({ scheduleId, reminders }: ReminderSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = useCallback(async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId,
          minutesBefore: 15,
          isEnabled: true,
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add reminder:", error);
    } finally {
      setAdding(false);
    }
  }, [scheduleId, router]);

  const handleToggle = useCallback(
    async (reminder: Reminder) => {
      setLoading(reminder.id);
      try {
        const res = await fetch(`/api/reminders/${reminder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isEnabled: !reminder.isEnabled }),
        });

        if (res.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to toggle reminder:", error);
      } finally {
        setLoading(null);
      }
    },
    [router]
  );

  const handleUpdateMinutes = useCallback(
    async (reminder: Reminder, minutesBefore: number) => {
      if (minutesBefore < 1 || minutesBefore > 120) return;
      if (minutesBefore === reminder.minutesBefore) return;

      setLoading(reminder.id);
      try {
        const res = await fetch(`/api/reminders/${reminder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minutesBefore }),
        });

        if (res.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to update reminder:", error);
      } finally {
        setLoading(null);
      }
    },
    [router]
  );

  const handleDelete = useCallback(
    async (reminderId: string) => {
      setLoading(reminderId);
      try {
        const res = await fetch(`/api/reminders/${reminderId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to delete reminder:", error);
      } finally {
        setLoading(null);
      }
    },
    [router]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">
          Nhắc nhở
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          disabled={adding}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm nhắc nhở
        </Button>
      </div>

      {reminders.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Chưa có nhắc nhở nào.
        </p>
      )}

      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span className="whitespace-nowrap text-muted-foreground">
              Nhắc trước
            </span>
            <Input
              type="number"
              min={1}
              max={120}
              defaultValue={reminder.minutesBefore}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  handleUpdateMinutes(reminder, val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                  if (!isNaN(val)) {
                    handleUpdateMinutes(reminder, val);
                  }
                }
              }}
              className="h-7 w-16 px-2 text-center text-sm"
              disabled={loading === reminder.id}
            />
            <span className="whitespace-nowrap text-muted-foreground">
              phút
            </span>

            <div className="ml-auto flex items-center gap-2">
              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={reminder.isEnabled}
                onClick={() => handleToggle(reminder)}
                disabled={loading === reminder.id}
                className={`
                  relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full
                  border-2 border-transparent transition-colors duration-200 ease-in-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${reminder.isEnabled ? "bg-primary" : "bg-input"}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg
                    ring-0 transition-transform duration-200 ease-in-out
                    ${reminder.isEnabled ? "translate-x-4" : "translate-x-0"}
                  `}
                />
              </button>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(reminder.id)}
                disabled={loading === reminder.id}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
