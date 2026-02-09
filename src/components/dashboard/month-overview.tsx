"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  format,
  eachWeekOfInterval,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { DAYS_SHORT } from "@/lib/constants";

type WeekDashData = {
  week: {
    weekStart: string;
    weekEnd: string;
    totalSchedules: number;
    completed: number;
    completionRate: number;
    dailyStats: {
      day: number;
      label: string;
      total: number;
      completed: number;
    }[];
  };
};

type MonthOverviewProps = {
  studentId: string;
  currentDate: Date;
};

export function MonthOverview({ studentId, currentDate }: MonthOverviewProps) {
  const [weekDataMap, setWeekDataMap] = useState<Record<string, WeekDashData["week"]>>({});
  const [loading, setLoading] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Get all week start dates in this month
  const weekStarts = useMemo(() => {
    return eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    );
  }, [monthStart, monthEnd]);

  const fetchMonthData = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        weekStarts.map(async (ws) => {
          const dateStr = format(ws, "yyyy-MM-dd");
          const res = await fetch(
            `/api/dashboard?studentId=${studentId}&date=${dateStr}`
          );
          if (res.ok) {
            const data = await res.json();
            return { weekStart: dateStr, week: data.week as WeekDashData["week"] };
          }
          return null;
        })
      );
      const map: Record<string, WeekDashData["week"]> = {};
      for (const r of results) {
        if (r) map[r.weekStart] = r.week;
      }
      setWeekDataMap(map);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [studentId, weekStarts]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  // Aggregate month stats
  const monthStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const w of Object.values(weekDataMap)) {
      total += w.totalSchedules;
      completed += w.completed;
    }
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [weekDataMap]);

  // Build calendar grid
  const calendarWeeks = useMemo(() => {
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
  }, [monthStart, monthEnd]);

  // Find daily stats for a specific day from weekDataMap
  function getDayStat(date: Date) {
    const ws = startOfWeek(date, { weekStartsOn: 1 });
    const wsKey = format(ws, "yyyy-MM-dd");
    const weekData = weekDataMap[wsKey];
    if (!weekData) return null;
    const dayOfWeek = date.getDay();
    return weekData.dailyStats.find((d) => d.day === dayOfWeek) || null;
  }

  const dayHeaders = [1, 2, 3, 4, 5, 6, 0];

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu tháng...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Tổng quan tháng {format(currentDate, "MM/yyyy")}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {monthStats.completed}/{monthStats.total} hoàn thành
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-3xl font-bold text-primary">
              {monthStats.rate}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {dayHeaders.map((d) => (
                  <th
                    key={d}
                    className="px-1 py-1.5 text-center text-xs font-medium text-muted-foreground"
                  >
                    {DAYS_SHORT[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarWeeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((day, di) => {
                    const inMonth = isSameMonth(day, currentDate);
                    const today = isToday(day);
                    const stat = inMonth ? getDayStat(day) : null;
                    const hasSchedule = stat && stat.total > 0;
                    const allDone = hasSchedule && stat.completed === stat.total;

                    return (
                      <td key={di} className="p-0.5">
                        <div
                          className={`relative flex flex-col items-center justify-center rounded-md h-10 text-xs ${
                            !inMonth
                              ? "text-muted-foreground/30"
                              : today
                                ? "bg-blue-100 text-blue-700 font-bold dark:bg-blue-950/40 dark:text-blue-400"
                                : hasSchedule
                                  ? allDone
                                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                                  : "text-muted-foreground"
                          }`}
                        >
                          <span>{format(day, "d")}</span>
                          {hasSchedule && (
                            <span className="text-[9px] leading-none">
                              {stat.completed}/{stat.total}
                            </span>
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
