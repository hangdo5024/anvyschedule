"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type DailyStat = {
  day: number;
  label: string;
  total: number;
  completed: number;
};

type WeekData = {
  weekStart: string;
  weekEnd: string;
  totalSchedules: number;
  completed: number;
  completionRate: number;
  dailyStats: DailyStat[];
};

type WeekOverviewProps = {
  weekData: WeekData;
};

export function WeekOverview({ weekData }: WeekOverviewProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tổng quan tuần</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(weekData.weekStart)} - {formatDate(weekData.weekEnd)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-3xl font-bold text-primary">
              {weekData.completionRate}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {weekData.completed}/{weekData.totalSchedules} hoàn thành
        </p>

        <div className="space-y-3">
          {weekData.dailyStats.map((dayStat) => {
            const percentage =
              dayStat.total > 0
                ? Math.round((dayStat.completed / dayStat.total) * 100)
                : 0;

            return (
              <div key={dayStat.day} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium text-muted-foreground">
                  {dayStat.label}
                </span>
                <div className="flex-1">
                  <div className="h-6 w-full rounded-full bg-muted overflow-hidden">
                    {dayStat.total > 0 && (
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                  </div>
                </div>
                <span className="w-16 text-right text-xs text-muted-foreground">
                  {dayStat.total > 0
                    ? `${dayStat.completed}/${dayStat.total}`
                    : "---"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
