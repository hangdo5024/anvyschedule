"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, XCircle, CalendarRange } from "lucide-react";
import { Select, SelectOption } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TodayScheduleList, type TodaySchedule } from "@/components/dashboard/today-schedule";
import { WeekOverview } from "@/components/dashboard/week-overview";
import { MonthOverview } from "@/components/dashboard/month-overview";
import { useReminders } from "@/hooks/use-reminders";

type Student = {
  id: string;
  fullName: string;
};

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

type DashboardData = {
  date: string;
  dayOfWeek: number;
  student: { id: string; fullName: string };
  today: {
    schedules: TodaySchedule[];
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    missed: number;
  };
  week: WeekData;
};

type DashboardViewProps = {
  students: Student[];
};

const statCards = [
  {
    key: "total" as const,
    label: "Hôm nay",
    icon: Calendar,
    bg: "bg-blue-50",
    text: "text-blue-600",
    getValue: (d: DashboardData) => d.today.total,
  },
  {
    key: "completed" as const,
    label: "Đã xong",
    icon: CheckCircle,
    bg: "bg-green-50",
    text: "text-green-600",
    getValue: (d: DashboardData) => d.today.completed,
  },
  {
    key: "inProgress" as const,
    label: "Đang học",
    icon: Clock,
    bg: "bg-orange-50",
    text: "text-orange-600",
    getValue: (d: DashboardData) => d.today.inProgress + d.today.pending,
  },
  {
    key: "missed" as const,
    label: "Bỏ lỡ",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    getValue: (d: DashboardData) => d.today.missed,
  },
];

export function DashboardView({ students }: DashboardViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0].id : ""
  );
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [overviewMode, setOverviewMode] = useState<"week" | "month">("week");

  // Check for upcoming reminders and send browser notifications
  useReminders(selectedStudentId || null);

  const fetchDashboard = useCallback(async (studentId: string) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchDashboard(selectedStudentId);
    }
  }, [selectedStudentId, fetchDashboard]);

  if (students.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">
          Chào mừng đến AnvySchedule!
        </h2>
        <p className="text-muted-foreground">
          Bắt đầu bằng cách thêm học sinh để xem dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="student-select" className="text-sm font-medium">
          Học sinh:
        </label>
        <Select
          id="student-select"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-64"
        >
          {students.map((s) => (
            <SelectOption key={s.id} value={s.id}>
              {s.fullName}
            </SelectOption>
          ))}
        </Select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && dashboardData && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.key}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-3 ${stat.bg} ${stat.text}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">
                        {stat.getValue(dashboardData)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content: today schedule + overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodayScheduleList
                schedules={dashboardData.today.schedules}
                date={dashboardData.date}
              />
            </div>
            <div className="space-y-3">
              {/* Overview toggle */}
              <div className="flex items-center gap-1">
                <Button
                  variant={overviewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOverviewMode("week")}
                >
                  <CalendarRange className="h-4 w-4 mr-1.5" />
                  Tuần
                </Button>
                <Button
                  variant={overviewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOverviewMode("month")}
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Tháng
                </Button>
              </div>

              {overviewMode === "week" ? (
                <WeekOverview weekData={dashboardData.week} />
              ) : (
                <MonthOverview
                  studentId={selectedStudentId}
                  currentDate={new Date()}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
