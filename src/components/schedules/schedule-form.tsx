"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectOption } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { DAYS_OF_WEEK } from "@/lib/constants";

interface ScheduleFormProps {
  initialData?: {
    id?: string;
    subjectAssignmentId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location: string | null;
    teacherName: string | null;
    recurrence: string;
    effectiveFrom: string;
    effectiveUntil: string | null;
    notes: string | null;
  };
  assignments: {
    id: string;
    student: { fullName: string };
    class: { name: string };
    subject: { name: string; color: string };
  }[];
}

export function ScheduleForm({ initialData, assignments }: ScheduleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subjectAssignmentId, setSubjectAssignmentId] = useState(
    initialData?.subjectAssignmentId ?? ""
  );
  const [dayOfWeek, setDayOfWeek] = useState<string>(
    initialData?.dayOfWeek !== undefined ? String(initialData.dayOfWeek) : ""
  );
  const [startTime, setStartTime] = useState(initialData?.startTime ?? "");
  const [endTime, setEndTime] = useState(initialData?.endTime ?? "");
  const [teacherName, setTeacherName] = useState(initialData?.teacherName ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [recurrence, setRecurrence] = useState(initialData?.recurrence ?? "weekly");
  const [effectiveFrom, setEffectiveFrom] = useState(
    initialData?.effectiveFrom ?? "2025-09-01"
  );
  const [effectiveUntil, setEffectiveUntil] = useState(
    initialData?.effectiveUntil ?? "2026-05-31"
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const isEditing = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subjectAssignmentId) {
      alert("Vui lòng chọn phân công.");
      return;
    }

    if (dayOfWeek === "") {
      alert("Vui lòng chọn thứ.");
      return;
    }

    if (!startTime || !endTime) {
      alert("Vui lòng nhập giờ bắt đầu và giờ kết thúc.");
      return;
    }

    if (!effectiveFrom) {
      alert("Vui lòng nhập ngày bắt đầu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        subjectAssignmentId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        teacherName: teacherName.trim() || null,
        location: location.trim() || null,
        recurrence,
        effectiveFrom,
        effectiveUntil: effectiveUntil || null,
        notes: notes.trim() || null,
      };

      const url = isEditing
        ? `/api/schedules/${initialData!.id}`
        : "/api/schedules";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to save schedule");
      }

      router.push("/schedules");
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/schedules"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Chỉnh sửa lịch học" : "Thêm lịch học mới"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectAssignmentId">
                Phân công <span className="text-destructive">*</span>
              </Label>
              <Select
                id="subjectAssignmentId"
                value={subjectAssignmentId}
                onChange={(e) => setSubjectAssignmentId(e.target.value)}
                required
              >
                <SelectOption value="">-- Chọn phân công --</SelectOption>
                {assignments.map((a) => (
                  <SelectOption key={a.id} value={a.id}>
                    {a.student.fullName} - {a.class.name} - {a.subject.name}
                  </SelectOption>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">
                  Thứ <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  required
                >
                  <SelectOption value="">-- Chọn thứ --</SelectOption>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectOption key={d.value} value={String(d.value)}>
                      {d.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">
                  Giờ bắt đầu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">
                  Giờ kết thúc <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacherName">Giáo viên</Label>
                <Input
                  id="teacherName"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Nhập tên giáo viên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Nhập địa điểm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurrence">Lặp lại</Label>
                <Select
                  id="recurrence"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                >
                  <SelectOption value="weekly">Hàng tuần</SelectOption>
                  <SelectOption value="once">Một lần</SelectOption>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">
                  Từ ngày <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveUntil">Đến ngày</Label>
                <Input
                  id="effectiveUntil"
                  type="date"
                  value={effectiveUntil}
                  onChange={(e) => setEffectiveUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú (không bắt buộc)"
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Link href="/schedules">
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật"
                  : "Thêm lịch học"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
