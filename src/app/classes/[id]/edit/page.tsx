import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/classes/class-form";

interface EditClassPageProps {
  params: { id: string };
}

export default async function EditClassPage({ params }: EditClassPageProps) {
  const classData = await prisma.class.findUnique({
    where: { id: params.id },
  });

  if (!classData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Chỉnh sửa lớp học
        </h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin lớp học {classData.name}
        </p>
      </div>
      <ClassForm
        initialData={{
          id: classData.id,
          name: classData.name,
          gradeLevel: classData.gradeLevel,
          academicYear: classData.academicYear,
          description: classData.description,
        }}
      />
    </div>
  );
}
