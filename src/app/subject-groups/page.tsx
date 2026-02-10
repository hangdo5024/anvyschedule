import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { SubjectGroupForm } from "@/components/subject-groups/subject-group-form";
import { SubjectGroupList } from "@/components/subject-groups/subject-group-list";
import { Layers } from "lucide-react";

export default async function SubjectGroupsPage() {
  const groups = await prisma.subjectGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { subjects: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nhóm môn học</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm nhóm mới</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectGroupForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Danh sách nhóm ({groups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Chưa có nhóm môn học nào. Hãy tạo nhóm đầu tiên ở trên.
              </p>
            </div>
          ) : (
            <SubjectGroupList groups={groups} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
