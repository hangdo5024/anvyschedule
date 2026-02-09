import Link from "next/link";
import { Plus, Pencil, Copy, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { DeleteScheduleButton } from "@/components/schedules/delete-schedule-button";

export default async function SchedulesPage() {
  const schedules = await prisma.schedule.findMany({
    include: {
      subjectAssignment: {
        include: {
          student: true,
          class: true,
          subject: true,
        },
      },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  function getDayLabel(dayOfWeek: number) {
    const found = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek);
    return found ? found.label : `Day ${dayOfWeek}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Lịch học</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng cộng {schedules.length} lịch học
          </p>
        </div>
        <Link href="/schedules/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm lịch học
          </Button>
        </Link>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Chưa có lịch học nào</h2>
          <p className="text-muted-foreground mb-4">
            Bắt đầu bằng cách thêm lịch học đầu tiên.
          </p>
          <Link href="/schedules/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm lịch học
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thứ</TableHead>
                <TableHead>Giờ</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead>Học sinh</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead>GV</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {getDayLabel(schedule.dayOfWeek)}
                  </TableCell>
                  <TableCell>
                    {schedule.startTime} - {schedule.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="text-white"
                      style={{
                        backgroundColor:
                          schedule.subjectAssignment.subject.color,
                      }}
                    >
                      {schedule.subjectAssignment.subject.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {schedule.subjectAssignment.student.fullName}
                  </TableCell>
                  <TableCell>
                    {schedule.subjectAssignment.class.name}
                  </TableCell>
                  <TableCell>
                    {schedule.teacherName || "—"}
                  </TableCell>
                  <TableCell>
                    {schedule.location || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/schedules/new?copyFrom=${schedule.id}`} title="Sao chép">
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/schedules/${schedule.id}/edit`} title="Chỉnh sửa">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteScheduleButton scheduleId={schedule.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
