"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TimetableWeek } from "./timetable-week";
import { TimetableDay } from "./timetable-day";

export interface TimetableScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  teacherName: string | null;
  recurrence: string;
  notes: string | null;
  subjectAssignmentId: string;
  subjectName: string;
  subjectColor: string;
  subjectIcon: string | null;
  className: string;
  progress: {
    id: string;
    date: string;
    status: string;
    notes: string | null;
    rating: number | null;
  } | null;
}

export interface TimetableResponse {
  studentId: string;
  classId: string | null;
  weekStart: string;
  weekEnd: string;
  days: {
    [dayOfWeek: string]: TimetableScheduleItem[];
  };
}

interface TimetableViewProps {
  students: { id: string; fullName: string }[];
  classes: { id: string; name: string; gradeLevel: number }[];
}

function getWeekStart(date: Date): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

function formatDateRange(weekStartDate: Date): string {
  const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
  const startStr = format(weekStartDate, "dd/MM");
  const endStr = format(weekEndDate, "dd/MM/yyyy");
  return `${startStr} - ${endStr}`;
}

export function TimetableView({ students, classes }: TimetableViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timetableData, setTimetableData] =
    useState<TimetableResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!selectedStudentId) {
      setTimetableData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weekStart = getWeekStart(currentDate);
      const params = new URLSearchParams({
        studentId: selectedStudentId,
        weekStart,
      });
      if (selectedClassId) {
        params.set("classId", selectedClassId);
      }

      const response = await fetch(
        `/api/schedules/timetable?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Không thể tải thời khóa biểu");
      }
      const data: TimetableResponse = await response.json();
      setTimetableData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi"
      );
      setTimetableData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, selectedClassId, currentDate]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  function prevWeek() {
    setCurrentDate((prev) => subWeeks(prev, 1));
  }

  function nextWeek() {
    setCurrentDate((prev) => addWeeks(prev, 1));
  }

  function prevDay() {
    setCurrentDate((prev) => subDays(prev, 1));
  }

  function nextDay() {
    setCurrentDate((prev) => addDays(prev, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Student Select */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="student-select" className="mb-1.5 block">
                Học sinh
              </Label>
              <Select
                id="student-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <SelectOption value="">-- Chọn học sinh --</SelectOption>
                {students.map((student) => (
                  <SelectOption key={student.id} value={student.id}>
                    {student.fullName}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Class Select */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="class-select" className="mb-1.5 block">
                Lớp (tùy chọn)
              </Label>
              <Select
                id="class-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <SelectOption value="">-- Tất cả lớp --</SelectOption>
                {classes.map((cls) => (
                  <SelectOption key={cls.id} value={cls.id}>
                    {cls.name} (Khối {cls.gradeLevel})
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
                title="Xem theo tuần"
              >
                <CalendarRange className="h-4 w-4 mr-1.5" />
                Tuần
              </Button>
              <Button
                variant={viewMode === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("day")}
                title="Xem theo ngày"
              >
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Ngày
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={viewMode === "week" ? prevWeek : prevDay}
                title={viewMode === "week" ? "Tuần trước" : "Ngày trước"}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                title="Hôm nay"
              >
                <Calendar className="h-4 w-4 mr-1.5" />
                Hôm nay
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={viewMode === "week" ? nextWeek : nextDay}
                title={viewMode === "week" ? "Tuần sau" : "Ngày sau"}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Date Display */}
            <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {viewMode === "week" ? (
                <span>
                  Tuần: {formatDateRange(weekStartDate)}
                </span>
              ) : (
                <span>
                  {format(currentDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {!selectedStudentId ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">
              Chọn học sinh để xem thời khóa biểu
            </h2>
            <p className="text-muted-foreground">
              Vui lòng chọn một học sinh từ danh sách phía trên.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Đang tải thời khóa biểu...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchTimetable}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      ) : timetableData ? (
        viewMode === "week" ? (
          <TimetableWeek data={timetableData} currentDate={currentDate} />
        ) : (
          <TimetableDay data={timetableData} currentDate={currentDate} />
        )
      ) : null}
    </div>
  );
}
