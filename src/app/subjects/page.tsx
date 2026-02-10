import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SubjectsTable } from "@/components/subjects/subjects-table";
import { Plus, BookOpen, Layers } from "lucide-react";

export default async function SubjectsPage() {
  const [subjects, groups] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        subjectGroup: {
          select: { id: true, name: true, color: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
    }),
    prisma.subjectGroup.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Môn học</h1>
        <div className="flex gap-2">
          <Link href="/subject-groups">
            <Button variant="outline">
              <Layers className="mr-2 h-4 w-4" />
              Nhóm môn học
            </Button>
          </Link>
          <Link href="/subjects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm môn học
            </Button>
          </Link>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Chưa có môn học nào</h2>
            <p className="text-muted-foreground mb-4">
              Bắt đầu bằng cách thêm môn học đầu tiên.
            </p>
            <Link href="/subjects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm môn học
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Danh sách môn học ({subjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectsTable subjects={subjects} groups={groups} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
