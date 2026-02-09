"use client";

import { format, getDay } from "date-fns";
import { Clock, MapPin, User, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAYS_OF_WEEK } from "@/lib/constants";
import type {
  TimetableResponse,
  TimetableScheduleItem,
} from "./timetable-view";

interface TimetableDayProps {
  data: TimetableResponse;
  currentDate: Date;
}

const STATUS_CONFIG: Record<
  string,
  { icon: string; label: string; className: string }
> = {
  completed: {
    icon: "\u2705",
    label: "Hoàn thành",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  in_progress: {
    icon: "\uD83D\uDD04",
    label: "Đang học",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  pending: {
    icon: "\u231B",
    label: "Chờ",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
  },
  missed: {
    icon: "\u274C",
    label: "Bỏ lỡ",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

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

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < rating ? "text-amber-500" : "text-gray-300 dark:text-gray-600"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function TimetableDay({ data, currentDate }: TimetableDayProps) {
  const dayOfWeek = getDay(currentDate);
  const dayLabel =
    DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || "";
  const dateStr = format(currentDate, "dd/MM/yyyy");

  const schedules: TimetableScheduleItem[] =
    data.days[String(dayOfWeek)] || [];

  const sortedSchedules = [...schedules].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">
          {dayLabel}, {dateStr}
        </h2>
        {sortedSchedules.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {sortedSchedules.length} {"tiết học"}
          </Badge>
        )}
      </div>

      {sortedSchedules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base font-semibold mb-1">
              {"Không có lịch học"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {"Không có tiết học nào trong ngày này."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedSchedules.map((item, index) => {
            const rgb = hexToRgb(item.subjectColor);
            const bgStyle = rgb
              ? {
                  backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`,
                }
              : {};
            const statusConfig = item.progress
              ? STATUS_CONFIG[item.progress.status] || STATUS_CONFIG.pending
              : null;

            return (
              <Card
                key={item.id}
                className="overflow-hidden"
                style={bgStyle}
              >
                <div className="flex">
                  <div className="flex flex-col items-center justify-center px-4 py-4 min-w-[90px] border-r bg-muted/30">
                    <span className="text-sm font-bold text-foreground">
                      {item.startTime}
                    </span>
                    <div className="w-px h-3 bg-border my-1" />
                    <span className="text-xs text-muted-foreground">
                      {item.endTime}
                    </span>
                  </div>

                  <div
                    className="flex-1 p-4"
                    style={{ borderLeft: `4px solid ${item.subjectColor}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-base font-bold"
                        style={{ color: item.subjectColor }}
                      >
                        {item.subjectName}
                      </h3>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {"Tiết "}{index + 1}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-sm text-muted-foreground">
                      {item.teacherName && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          <span>{item.teacherName}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="mt-2 text-xs text-muted-foreground italic">
                        {item.notes}
                      </p>
                    )}

                    {item.progress && statusConfig && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Badge
                          className={`text-[11px] ${statusConfig.className}`}
                        >
                          <span className="mr-1">{statusConfig.icon}</span>
                          {statusConfig.label}
                        </Badge>
                        {item.progress.rating != null && (
                          <RatingStars rating={item.progress.rating} />
                        )}
                        {item.progress.notes && (
                          <span className="text-xs text-muted-foreground ml-1 truncate max-w-[200px]">
                            {item.progress.notes}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
