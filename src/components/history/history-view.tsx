"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search, Paperclip, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PROGRESS_STATUS, DAYS_OF_WEEK } from "@/lib/constants";

interface ProgressRecord {
  id: string;
  scheduleId: string;
  date: string;
  status: string;
  notes: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  schedule: {
    id: string;
    startTime: string;
    endTime: string;
    teacherName: string | null;
    location: string | null;
    subjectAssignment: {
      student: {
        id: string;
        fullName: string;
      };
      class: {
        id: string;
        name: string;
      };
      subject: {
        id: string;
        name: string;
        color: string;
      };
    };
  };
  attachments: {
    id: string;
    type: string;
    url: string;
    fileName: string | null;
    fileSize: number | null;
  }[];
}

interface HistoryResponse {
  data: ProgressRecord[];
  total: number;
  page: number;
  totalPages: number;
}

interface HistoryViewProps {
  students: { id: string; fullName: string }[];
  subjects: { id: string; name: string; color: string }[];
}

function getStatusIcon(status: string): string {
  switch (status) {
    case "completed":
      return "\u2705";
    case "in_progress":
      return "\uD83D\uDD04";
    case "missed":
      return "\u274C";
    default:
      return "\u23F3";
  }
}

function getStatusInfo(status: string) {
  const found = PROGRESS_STATUS.find((s) => s.value === status);
  return found || { value: status, label: status, color: "bg-gray-100 text-gray-800" };
}

function getDayLabel(dayOfWeek: number): string {
  const found = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek);
  return found ? found.label : `Day ${dayOfWeek}`;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const dayLabel = getDayLabel(dayOfWeek);
  return `${dayLabel}, ${format(date, "dd/MM/yyyy")}`;
}

function groupByDate(records: ProgressRecord[]): Map<string, ProgressRecord[]> {
  const groups = new Map<string, ProgressRecord[]>();
  for (const record of records) {
    const dateKey = format(new Date(record.date), "yyyy-MM-dd");
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(record);
    } else {
      groups.set(dateKey, [record]);
    }
  }
  return groups;
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-4 w-4 ${
          i <= rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export function HistoryView({ students, subjects }: HistoryViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0].id : ""
  );
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return format(d, "yyyy-MM-dd");
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    return format(new Date(), "yyyy-MM-dd");
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<ProgressRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchHistory = useCallback(async (currentPage: number) => {
    if (!selectedStudentId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("studentId", selectedStudentId);
      if (dateFrom) {
        params.set("from", new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        params.set("to", toDate.toISOString());
      }
      if (selectedSubjectId) {
        params.set("subjectId", selectedSubjectId);
      }
      if (selectedStatus) {
        params.set("status", selectedStatus);
      }
      params.set("page", String(currentPage));
      params.set("limit", "20");

      const res = await fetch(`/api/history?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch history");
      }
      const result: HistoryResponse = await res.json();
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, dateFrom, dateTo, selectedSubjectId, selectedStatus]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  function handleSearch() {
    setPage(1);
    fetchHistory(1);
  }

  function handlePrevPage() {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchHistory(newPage);
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchHistory(newPage);
    }
  }

  const grouped = groupByDate(data);

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student-select">Hoc sinh</Label>
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

            <div className="space-y-2">
              <Label htmlFor="subject-select">Mon hoc</Label>
              <Select
                id="subject-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <SelectOption value="">Tat ca</SelectOption>
                {subjects.map((subject) => (
                  <SelectOption key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectOption>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-select">Trang thai</Label>
              <Select
                id="status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <SelectOption value="">Tat ca</SelectOption>
                <SelectOption value="completed">Hoan thanh</SelectOption>
                <SelectOption value="in_progress">Dang hoc</SelectOption>
                <SelectOption value="missed">Bo lo</SelectOption>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">Tu ngay</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">Den ngay</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="invisible">Tim</Label>
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Tim
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Dang tai...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Khong tim thay lich su</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <p className="text-sm text-muted-foreground">
            Tim thay {total} ban ghi
          </p>

          {/* Grouped by date */}
          {Array.from(grouped.entries()).map(([dateKey, records]) => (
            <div key={dateKey} className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">
                {formatDateHeader(records[0].date)}
              </h2>
              <div className="space-y-3">
                {records.map((record) => {
                  const statusInfo = getStatusInfo(record.status);
                  const statusIcon = getStatusIcon(record.status);
                  const assignment = record.schedule.subjectAssignment;

                  return (
                    <Card key={record.id}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-4">
                          {/* Status icon */}
                          <div className="text-2xl flex-shrink-0 pt-1">
                            {statusIcon}
                          </div>

                          {/* Main content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center flex-wrap gap-2">
                              {/* Time */}
                              <span className="text-sm font-medium text-muted-foreground">
                                {record.schedule.startTime} -{" "}
                                {record.schedule.endTime}
                              </span>

                              {/* Subject badge */}
                              <Badge
                                className="text-white"
                                style={{
                                  backgroundColor:
                                    assignment.subject.color,
                                }}
                              >
                                {assignment.subject.name}
                              </Badge>

                              {/* Status badge */}
                              <Badge
                                className={statusInfo.color}
                                variant="secondary"
                              >
                                {statusInfo.label}
                              </Badge>
                            </div>

                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>Lop: {assignment.class.name}</span>
                              {record.schedule.teacherName && (
                                <span>
                                  GV: {record.schedule.teacherName}
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            {record.rating !== null && record.rating > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Danh gia:
                                </span>
                                {renderStars(record.rating)}
                              </div>
                            )}

                            {/* Attachments */}
                            {record.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Paperclip className="h-4 w-4" />
                                <span>
                                  {record.attachments.length} tep dinh
                                  kem
                                </span>
                              </div>
                            )}

                            {/* Notes excerpt */}
                            {record.notes && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {record.notes.length > 100
                                  ? record.notes.slice(0, 100) + "..."
                                  : record.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Truoc
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= totalPages}
              >
                Tiep
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
