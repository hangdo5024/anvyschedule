import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/classes/class-form";

interface NewClassPageProps {
  searchParams: Promise<{ copyFrom?: string }>;
}

export default async function NewClassPage({ searchParams }: NewClassPageProps) {
  const { copyFrom } = await searchParams;

  let initialData;
  if (copyFrom) {
    const source = await prisma.class.findUnique({ where: { id: copyFrom } });
    if (source) {
      initialData = {
        name: source.name + " (bản sao)",
        gradeLevel: source.gradeLevel,
        academicYear: source.academicYear,
        description: source.description,
        ageMin: source.ageMin,
        ageMax: source.ageMax,
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {copyFrom ? "Sao chép lớp học" : "Thêm lớp học mới"}
        </h1>
        <p className="text-muted-foreground">
          Điền thông tin bên dưới để tạo lớp học mới
        </p>
      </div>
      <ClassForm initialData={initialData} />
    </div>
  );
}
