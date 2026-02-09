"use client";

import { useMemo } from "react";
import { addDays, startOfWeek, isToday, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAYS_SHORT } from "@/lib/constants";
import type {
  TimetableResponse,
  TimetableScheduleItem,
} from "./timetable-view";

interface TimetableWeekProps {
  data: TimetableResponse;
  currentDate: Date;
}

const STATUS_ICONS: Record<string, string> = {
  completed: "\u2705",
  in_progress: "\uD83D\uDD04",
  pending: "\u231B",
  missed: "\u274C",
};

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Hoàn thành";
    case "in_progress":
      return "Đang học";
    case "pending":
      return "Chờ";
    case "missed":
      return "Bỏ lỡ";
    default:
      return status;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function TimetableWeek({ data, currentDate }: TimetableWeekProps) {
  const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Always show all 7 days: Mon-Sun
  const displayDays = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 0]; // Mon-Sat + Sun
  }, []);

  // Collect all unique time slots and sort them
  const timeSlots = useMemo(() => {
    const slotSet = new Set<string>();
    for (const dayKey of Object.keys(data.days)) {
      for (const item of data.days[dayKey]) {
        slotSet.add(`${item.startTime}-${item.endTime}`);
      }
    }
    return Array.from(slotSet).sort((a, b) => {
      const aStart = a.split("-")[0];
      const bStart = b.split("-")[0];
      return aStart.localeCompare(bStart);
    });
  }, [data.days]);

  // Build a lookup: timeSlot -> dayOfWeek -> items
  const scheduleMap = useMemo(() => {
    const map: Record<string, Record<number, TimetableScheduleItem[]>> = {};
    for (const slot of timeSlots) {
      map[slot] = {};
    }
    for (const dayKey of Object.keys(data.days)) {
      const dayNum = parseInt(dayKey, 10);
      for (const item of data.days[dayKey]) {
        const slot = `${item.startTime}-${item.endTime}`;
        if (!map[slot]) {
          map[slot] = {};
        }
        if (!map[slot][dayNum]) {
          map[slot][dayNum] = [];
        }
        map[slot][dayNum].push(item);
      }
    }
    return map;
  }, [data.days, timeSlots]);

  // Get Date objects for each display day
  function getDayDate(dayOfWeek: number): Date {
    // dayOfWeek: 0=Sun, 1=Mon, ..., 6=Sat
    // weekStartDate is Monday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return addDays(weekStartDate, daysFromMonday);
  }

  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">
            Không có lịch học trong tuần này.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop: Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-3 text-left text-sm font-semibold text-muted-foreground w-[120px] border-r">
                      Giờ
                    </th>
                    {displayDays.map((day) => {
                      const dayDate = getDayDate(day);
                      const isTodayCol = isToday(dayDate);
                      return (
                        <th
                          key={day}
                          className={`px-2 py-3 text-center text-sm font-semibold min-w-[130px] border-r last:border-r-0 ${
                            isTodayCol
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          <div>{DAYS_SHORT[day]}</div>
                          <div
                            className={`text-xs font-normal mt-0.5 ${
                              isTodayCol
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-muted-foreground/70"
                            }`}
                          >
                            {format(dayDate, "dd/MM")}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIdx) => {
                    const [startTime, endTime] = slot.split("-");
                    return (
                      <tr
                        key={slot}
                        className={`border-b last:border-b-0 ${
                          slotIdx % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }`}
                      >
                        <td className="px-3 py-2 text-xs font-medium text-muted-foreground border-r align-top whitespace-nowrap">
                          <div>{startTime}</div>
                          <div className="text-muted-foreground/60">
                            {endTime}
                          </div>
                        </td>
                        {displayDays.map((day) => {
                          const dayDate = getDayDate(day);
                          const isTodayCol = isToday(dayDate);
                          const items = scheduleMap[slot]?.[day] || [];

                          return (
                            <td
                              key={day}
                              className={`px-1.5 py-1.5 border-r last:border-r-0 align-top ${
                                isTodayCol
                                  ? "bg-blue-50/50 dark:bg-blue-950/20"
                                  : ""
                              }`}
                            >
                              {items.length > 0 ? (
                                <div className="space-y-1">
                                  {items.map((item) => {
                                    const rgb = hexToRgb(item.subjectColor);
                                    const bgStyle = rgb
                                      ? {
                                          backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
                                          borderLeft: `3px solid ${item.subjectColor}`,
                                        }
                                      : {
                                          borderLeft: `3px solid ${item.subjectColor}`,
                                        };

                                    return (
                                      <div
                                        key={item.id}
                                        className="rounded-md px-2 py-1.5 text-xs"
                                        style={bgStyle}
                                      >
                                        <div
                                          className="font-semibold truncate"
                                          style={{ color: item.subjectColor }}
                                          title={item.subjectName}
                                        >
                                          {item.subjectName}
                                        </div>
                                        {item.teacherName && (
                                          <div className="text-muted-foreground truncate mt-0.5">
                                            {item.teacherName}
                                          </div>
                                        )}
                                        {item.location && (
                                          <div className="text-muted-foreground/70 truncate">
                                            {item.location}
                                          </div>
                                        )}
                                        {item.progress && (
                                          <div
                                            className="mt-1 flex items-center gap-1"
                                            title={getStatusLabel(
                                              item.progress.status
                                            )}
                                          >
                                            <span className="text-[10px]">
                                              {STATUS_ICONS[
                                                item.progress.status
                                              ] || ""}
                                            </span>
                                            {item.progress.rating != null && (
                                              <span className="text-[10px] text-amber-500">
                                                {"★".repeat(
                                                  item.progress.rating
                                                )}
                                                {"☆".repeat(
                                                  5 - item.progress.rating
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center text-muted-foreground/30 py-1">
                                  &mdash;
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: Stacked Cards */}
      <div className="md:hidden space-y-4">
        {displayDays.map((day) => {
          const dayDate = getDayDate(day);
          const isTodayCol = isToday(dayDate);
          const dayItems: TimetableScheduleItem[] = data.days[String(day)] || [];

          if (dayItems.length === 0) return null;

          return (
            <Card
              key={day}
              className={
                isTodayCol
                  ? "border-blue-300 dark:border-blue-700"
                  : ""
              }
            >
              <div
                className={`px-4 py-3 border-b ${
                  isTodayCol
                    ? "bg-blue-50 dark:bg-blue-950/30"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-sm ${
                      isTodayCol
                        ? "text-blue-700 dark:text-blue-400"
                        : ""
                    }`}
                  >
                    {DAYS_SHORT[day]}
                  </span>
                  <span
                    className={`text-xs ${
                      isTodayCol
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(dayDate, "dd/MM/yyyy")}
                    {isTodayCol && (
                      <Badge
                        variant="default"
                        className="ml-2 text-[10px] px-1.5 py-0"
                      >
                        Hôm nay
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                {dayItems.map((item) => {
                  const rgb = hexToRgb(item.subjectColor);
                  const bgStyle = rgb
                    ? {
                        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
                        borderLeft: `3px solid ${item.subjectColor}`,
                      }
                    : {
                        borderLeft: `3px solid ${item.subjectColor}`,
                      };

                  return (
                    <div
                      key={item.id}
                      className="rounded-md px-3 py-2 text-sm"
                      style={bgStyle}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-semibold"
                          style={{ color: item.subjectColor }}
                        >
                          {item.subjectName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        {item.teacherName && (
                          <span>{item.teacherName}</span>
                        )}
                        {item.location && <span>{item.location}</span>}
                      </div>
                      {item.progress && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-xs">
                            {STATUS_ICONS[item.progress.status] || ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getStatusLabel(item.progress.status)}
                          </span>
                          {item.progress.rating != null && (
                            <span className="text-xs text-amber-500">
                              {"★".repeat(item.progress.rating)}
                              {"☆".repeat(5 - item.progress.rating)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
        {displayDays.every(
          (day) =>
            !data.days[String(day)] || data.days[String(day)].length === 0
        ) && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Không có lịch học trong tuần này.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
