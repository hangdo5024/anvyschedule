"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  format,
  getDay,
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { DAYS_SHORT } from "@/lib/constants";
import type { TimetableResponse } from "./timetable-view";

interface TimetableMonthProps {
  data: TimetableResponse;
  currentDate: Date;
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

export function TimetableMonth({ data, currentDate }: TimetableMonthProps) {
  // Build calendar grid: array of weeks, each week is array of 7 days
  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const weeks: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [currentDate]);

  // Header: Mon-Sun
  const dayHeaders = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                {dayHeaders.map((d) => (
                  <th
                    key={d}
                    className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground border-r last:border-r-0 w-[14.28%]"
                  >
                    {DAYS_SHORT[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarWeeks.map((week, weekIdx) => (
                <tr key={weekIdx} className="border-b last:border-b-0">
                  {week.map((day, dayIdx) => {
                    const inMonth = isSameMonth(day, currentDate);
                    const today = isToday(day);
                    const dayOfWeek = getDay(day);
                    const items = data.days[String(dayOfWeek)] || [];

                    return (
                      <td
                        key={dayIdx}
                        className={`px-1 py-1 border-r last:border-r-0 align-top min-h-[80px] h-[90px] ${
                          !inMonth ? "bg-muted/30" : ""
                        } ${today ? "bg-blue-50/70 dark:bg-blue-950/20" : ""}`}
                      >
                        <div
                          className={`text-xs font-medium mb-1 px-1 ${
                            !inMonth
                              ? "text-muted-foreground/40"
                              : today
                                ? "text-blue-700 dark:text-blue-400 font-bold"
                                : "text-muted-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                        <div className="space-y-0.5">
                          {items.slice(0, 3).map((item) => {
                            const rgb = hexToRgb(item.subjectColor);
                            return (
                              <div
                                key={item.id}
                                className="text-[10px] leading-tight px-1 py-0.5 rounded truncate"
                                style={{
                                  backgroundColor: rgb
                                    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
                                    : undefined,
                                  color: item.subjectColor,
                                }}
                                title={`${item.subjectName} ${item.startTime}-${item.endTime}`}
                              >
                                {item.startTime} {item.subjectName}
                              </div>
                            );
                          })}
                          {items.length > 3 && (
                            <div className="text-[10px] text-muted-foreground px-1">
                              +{items.length - 3} nữa
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
