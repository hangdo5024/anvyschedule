import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteSubjectButton } from "@/components/subjects/delete-subject-button";
import { Plus, Pencil, BookOpen } from "lucide-react";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Môn học</h1>
        <Link href="/subjects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm môn học
          </Button>
        </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/subjects/${subject.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteSubjectButton
                      subjectId={subject.id}
                      subjectName={subject.name}
                    />
                  </div>
                </div>
                {subject.description && (
                  <CardDescription>{subject.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {subject._count.assignments} phân công
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
