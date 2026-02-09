"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Users, User, TrendingUp, CalendarDays, Paperclip } from "lucide-react";
import { Select, SelectOption } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PROGRESS_STATUS } from "@/lib/constants";
import { ProgressForm } from "@/components/progress/progress-form";
import { StarRating } from "@/components/progress/star-rating";

interface Student {
  id: string;
  fullName: string;
}

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  teacherName: string | null;
  subjectAssignment: {
    subject: { id: string; name: string; color: string };
    class: { id: string; name: string };
    student: { id: string; fullName: string };
  };
}

interface ProgressRecord {
  id: string;
  scheduleId: string;
  date: string;
  status: string;
  notes: string | null;
  rating: number | null;
  attachments: {
    id: string;
    type: string;
    url: string;
    fileName: string | null;
  }[];
  schedule: ScheduleItem;
}

interface DisplayItem {
  schedule: ScheduleItem;
  progress: ProgressRecord | null;
}

interface ProgressViewProps {
  students: Student[];
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDayOfWeekFromDate(dateStr: string): number {
  const date = new Date(dateStr + "T00:00:00");
  return date.getDay();
}

export function ProgressView({ students }: ProgressViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<DisplayItem | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedStudentId || !selectedDate) return;

    setLoading(true);
    try {
      // Fetch progress records for the selected student + date
      const progressRes = await fetch(
        `/api/progress?studentId=${selectedStudentId}&date=${selectedDate}`
      );
      const progressRecords: ProgressRecord[] = await progressRes.json();

      // Get dayOfWeek for the selected date
      const dayOfWeek = getDayOfWeekFromDate(selectedDate);

      // Fetch schedules for the student to find those matching this day
      const schedulesRes = await fetch(
        `/api/schedules?studentId=${selectedStudentId}`
      );
      const allSchedules: ScheduleItem[] = await schedulesRes.json();

      // Filter schedules matching this day of week
      const daySchedules = allSchedules.filter(
        (s) => s.dayOfWeek === dayOfWeek
      );

      // Match schedules with progress records
      const items: DisplayItem[] = daySchedules.map((schedule) => {
        const matchingProgress = progressRecords.find(
          (p) => p.scheduleId === schedule.id
        );
        return {
          schedule,
          progress: matchingProgress || null,
        };
      });

      // Sort by start time
      items.sort((a, b) =>
        a.schedule.startTime.localeCompare(b.schedule.startTime)
      );

      setDisplayItems(items);
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getStatusInfo(statusValue: string) {
    return PROGRESS_STATUS.find((s) => s.value === statusValue);
  }

  function handleFormSaved() {
    setEditingItem(null);
    fetchData();
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tiến độ học tập</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi và cập nhật tiến độ học tập theo ngày
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="student-select" className="text-sm font-medium">
            Học sinh
          </Label>
          <Select
            id="student-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map((student) => (
              <SelectOption key={student.id} value={student.id}>
                {student.fullName}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-56 space-y-1.5">
          <Label htmlFor="date-picker" className="text-sm font-medium">
            Ngày
          </Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Không có lịch học
          </h2>
          <p className="text-muted-foreground">
            {selectedStudent?.fullName || "Học sinh"} không có lịch học vào ngày
            này.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item) => {
            const { schedule, progress } = item;
            const statusInfo = progress
              ? getStatusInfo(progress.status)
              : null;

            return (
              <Card key={schedule.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Subject color bar */}
                    <div
                      className="w-full sm:w-1.5 h-1.5 sm:h-auto flex-shrink-0"
                      style={{
                        backgroundColor:
                          schedule.subjectAssignment.subject.color,
                      }}
                    />

                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        {/* Schedule info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className="text-white text-xs"
                              style={{
                                backgroundColor:
                                  schedule.subjectAssignment.subject.color,
                              }}
                            >
                              {schedule.subjectAssignment.subject.name}
                            </Badge>
                            {statusInfo ? (
                              <Badge
                                variant="secondary"
                                className={`${statusInfo.color} border-0 text-xs`}
                              >
                                {statusInfo.label}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                              >
                                Chưa cập nhật
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              {schedule.subjectAssignment.class.name}
                            </span>
                            {schedule.teacherName && (
                              <span className="inline-flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                {schedule.teacherName}
                              </span>
                            )}
                          </div>

                          {/* Progress details if exists */}
                          {progress && (
                            <div className="mt-2 space-y-1.5">
                              {progress.rating !== null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    Đánh giá:
                                  </span>
                                  <StarRating
                                    value={progress.rating}
                                    onChange={() => {}}
                                    readonly
                                  />
                                </div>
                              )}
                              {progress.notes && (
                                <p className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2">
                                  {progress.notes}
                                </p>
                              )}
                              {progress.attachments.length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Paperclip className="h-3 w-3" />
                                  {progress.attachments.length} tệp đính kèm
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action button */}
                        <Button
                          variant={progress ? "outline" : "default"}
                          size="sm"
                          className="self-start flex-shrink-0"
                          onClick={() => setEditingItem(item)}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Cập nhật
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Progress Form Modal */}
      {editingItem && (
        <ProgressForm
          scheduleId={editingItem.schedule.id}
          date={selectedDate}
          subjectName={editingItem.schedule.subjectAssignment.subject.name}
          className={editingItem.schedule.subjectAssignment.class.name}
          startTime={editingItem.schedule.startTime}
          endTime={editingItem.schedule.endTime}
          initialData={
            editingItem.progress
              ? {
                  id: editingItem.progress.id,
                  status: editingItem.progress.status,
                  notes: editingItem.progress.notes,
                  rating: editingItem.progress.rating,
                  attachments: editingItem.progress.attachments,
                }
              : null
          }
          onClose={() => setEditingItem(null)}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}
