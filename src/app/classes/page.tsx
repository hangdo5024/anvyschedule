import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GRADE_LEVELS } from "@/lib/constants";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DeleteClassButton } from "@/components/classes/delete-class-button";
import { Plus, Pencil, School } from "lucide-react";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    include: {
      students: {
        include: {
          student: true,
        },
      },
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });

  function getGradeLabel(level: number) {
    return GRADE_LEVELS.find((g) => g.value === level)?.label ?? `Khối ${level}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Lớp học
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách các lớp học trong hệ thống
          </p>
        </div>
        <Link href="/classes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm lớp
          </Button>
        </Link>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <School className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Chưa có lớp học nào</h3>
            <p className="text-muted-foreground mb-4">
              Bắt đầu bằng cách thêm lớp học đầu tiên
            </p>
            <Link href="/classes/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm lớp học
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách lớp học ({classes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên lớp</TableHead>
                  <TableHead>Khối</TableHead>
                  <TableHead>Năm học</TableHead>
                  <TableHead>Số học sinh</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <Link
                        href={`/classes/${cls.id}`}
                        className="font-medium hover:underline"
                      >
                        {cls.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getGradeLabel(cls.gradeLevel)}
                      </Badge>
                    </TableCell>
                    <TableCell>{cls.academicYear}</TableCell>
                    <TableCell>{cls.students.length}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {cls.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/classes/${cls.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteClassButton
                          classId={cls.id}
                          className={cls.name}
                        />
                      </div>
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
