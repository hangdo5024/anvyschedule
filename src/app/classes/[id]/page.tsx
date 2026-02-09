import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GRADE_LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { RemoveStudentButton } from "@/components/classes/remove-student-button";
import { AddStudentToClass } from "@/components/classes/add-student-to-class";
import { Pencil, ArrowLeft, Users, BookOpen } from "lucide-react";

interface ClassDetailPageProps {
  params: { id: string };
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const classData = await prisma.class.findUnique({
    where: { id: params.id },
    include: {
      students: {
        include: {
          student: true,
        },
      },
      assignments: {
        include: {
          student: true,
          subject: true,
        },
      },
    },
  });

  if (!classData) {
    notFound();
  }

  const enrolledStudentIds = classData.students.map((sc) => sc.studentId);

  const allStudents = await prisma.student.findMany({
    orderBy: { fullName: "asc" },
  });

  const availableStudents = allStudents
    .filter((s) => !enrolledStudentIds.includes(s.id))
    .map((s) => ({ id: s.id, fullName: s.fullName }));

  const gradeLabel =
    GRADE_LEVELS.find((g) => g.value === classData.gradeLevel)?.label ??
    `Khối ${classData.gradeLevel}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/classes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {classData.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{gradeLabel}</Badge>
            <span className="text-muted-foreground">
              Năm học: {classData.academicYear}
            </span>
          </div>
        </div>
        <Link href={`/classes/${classData.id}/edit`}>
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </Link>
      </div>

      {classData.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{classData.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Học sinh trong lớp ({classData.students.length})
              </CardTitle>
              <CardDescription>
                Danh sách học sinh đang học trong lớp này
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddStudentToClass
            classId={classData.id}
            availableStudents={availableStudents}
          />

          {classData.students.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Chưa có học sinh nào trong lớp
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.students.map((sc) => (
                  <TableRow key={sc.id}>
                    <TableCell className="font-medium">
                      {sc.student.fullName}
                    </TableCell>
                    <TableCell>
                      {sc.student.gender === "male"
                        ? "Nam"
                        : sc.student.gender === "female"
                        ? "Nữ"
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(sc.enrolledAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <RemoveStudentButton
                        classId={classData.id}
                        studentId={sc.studentId}
                        studentName={sc.student.fullName}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {classData.assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Phân công môn học ({classData.assignments.length})
            </CardTitle>
            <CardDescription>
              Danh sách phân công môn học trong lớp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Môn học</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.student.fullName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: assignment.subject.color + "20",
                          color: assignment.subject.color,
                          borderColor: assignment.subject.color,
                        }}
                      >
                        {assignment.subject.name}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
