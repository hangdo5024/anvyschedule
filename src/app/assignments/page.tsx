import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { DeleteAssignmentButton } from "@/components/assignments/delete-assignment-button";
import { ClipboardList } from "lucide-react";

export default async function AssignmentsPage() {
  const [students, classes, subjects, assignments] = await Promise.all([
    prisma.student.findMany({
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
    }),
    prisma.class.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, gradeLevel: true },
    }),
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
    prisma.subjectAssignment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        class: true,
        subject: true,
        _count: {
          select: { schedules: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Phân công môn học</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm phân công mới</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentForm
            students={students}
            classes={classes}
            subjects={subjects}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Danh sách phân công ({assignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Chưa có phân công nào. Hãy tạo phân công đầu tiên ở trên.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Số lịch học</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.student.fullName}
                    </TableCell>
                    <TableCell>
                      {assignment.class.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-white"
                        style={{ backgroundColor: assignment.subject.color }}
                      >
                        {assignment.subject.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{assignment._count.schedules}</TableCell>
                    <TableCell>
                      <DeleteAssignmentButton assignmentId={assignment.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
