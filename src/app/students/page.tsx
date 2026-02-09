import Link from "next/link";
import { Plus, Pencil, Copy, Users } from "lucide-react";
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
import { GENDERS } from "@/lib/constants";
import { DeleteStudentButton } from "@/components/students/delete-student-button";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      classes: {
        include: {
          class: true,
        },
      },
      _count: {
        select: { assignments: true },
      },
    },
    orderBy: { fullName: "asc" },
  });

  function getGenderLabel(gender: string | null) {
    if (!gender) return "—";
    const found = GENDERS.find((g) => g.value === gender);
    return found ? found.label : gender;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Học sinh</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng cộng {students.length} học sinh
          </p>
        </div>
        <Link href="/students/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm học sinh
          </Button>
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Chưa có học sinh nào</h2>
          <p className="text-muted-foreground mb-4">
            Bắt đầu bằng cách thêm học sinh đầu tiên.
          </p>
          <Link href="/students/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm học sinh
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Phụ huynh</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.fullName}
                  </TableCell>
                  <TableCell>{getGenderLabel(student.gender)}</TableCell>
                  <TableCell>{student.dateOfBirth || "—"}</TableCell>
                  <TableCell>{student.parentName || "—"}</TableCell>
                  <TableCell>{student.parentPhone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.classes.length > 0 ? (
                        student.classes.map((sc) => (
                          <Badge key={sc.id} variant="secondary">
                            {sc.class.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/students/new?copyFrom=${student.id}`} title="Sao chép">
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/students/${student.id}/edit`} title="Chỉnh sửa">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteStudentButton
                        studentId={student.id}
                        studentName={student.fullName}
                      />
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
