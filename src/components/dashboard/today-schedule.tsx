"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, XCircle, Star, MapPin, User } from "lucide-react";

export type TodaySchedule = {
  id: string;
  startTime: string;
  endTime: string;
  subject: { name: string; color: string };
  className: string;
  teacherName: string;
  location: string;
  progress: { status: string; rating: number | null; notes: string | null } | null;
};

type TodayScheduleProps = {
  schedules: TodaySchedule[];
  date: string;
};

const DAY_NAMES: Record<number, string> = {
  0: "Ch\u1EE7 Nh\u1EADt",
  1: "Th\u1EE9 Hai",
  2: "Th\u1EE9 Ba",
  3: "Th\u1EE9 T\u01B0",
  4: "Th\u1EE9 N\u0103m",
  5: "Th\u1EE9 S\u00E1u",
  6: "Th\u1EE9 B\u1EA3y",
};

function getStatusIcon(status: string | undefined) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "in_progress":
      return <Clock className="h-5 w-5 text-blue-500" />;
    case "missed":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  }
}

function getStatusLabel(status: string | undefined) {
  switch (status) {
    case "completed":
      return "Hoàn thành";
    case "in_progress":
      return "Đang học";
    case "missed":
      return "Bỏ lỡ";
    default:
      return "Chờ";
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function TodayScheduleList({ schedules, date }: TodayScheduleProps) {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();
  const dayName = DAY_NAMES[dayOfWeek] || "";
  const formattedDate = dateObj.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {dayName}, {formattedDate}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {schedules.length > 0
            ? `${schedules.length} tiết học hôm nay`
            : "Không có tiết học hôm nay"}
        </p>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Không có lịch học nào cho ngày hôm nay.
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => {
              const progressStatus = schedule.progress?.status;
              return (
                <Link
                  key={schedule.id}
                  href={`/progress/${schedule.id}?date=${date}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    {/* Time column */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-sm font-semibold">
                        {schedule.startTime}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {schedule.endTime}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center self-stretch">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: schedule.subject.color }}
                      />
                      <div className="w-0.5 flex-1 bg-border mt-1" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium truncate">
                          {schedule.subject.name}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {getStatusIcon(progressStatus)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusLabel(progressStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="inline-block h-2 w-2 rounded-sm"
                            style={{ backgroundColor: schedule.subject.color }}
                          />
                          {schedule.className}
                        </span>
                        {schedule.teacherName && (
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {schedule.teacherName}
                          </span>
                        )}
                        {schedule.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {schedule.location}
                          </span>
                        )}
                      </div>

                      {schedule.progress?.rating != null && (
                        <div className="mt-1.5">
                          <StarRating rating={schedule.progress.rating} />
                        </div>
                      )}

                      {schedule.progress?.notes && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {schedule.progress.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
