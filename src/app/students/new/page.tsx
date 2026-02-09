import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/students/student-form";

interface NewStudentPageProps {
  searchParams: Promise<{ copyFrom?: string }>;
}

export default async function NewStudentPage({ searchParams }: NewStudentPageProps) {
  const { copyFrom } = await searchParams;

  let initialData;
  if (copyFrom) {
    const source = await prisma.student.findUnique({ where: { id: copyFrom } });
    if (source) {
      initialData = {
        fullName: source.fullName + " (bản sao)",
        dateOfBirth: source.dateOfBirth,
        gender: source.gender,
        parentName: source.parentName,
        parentPhone: source.parentPhone,
        notes: source.notes,
      };
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {copyFrom ? "Sao chép học sinh" : "Thêm học sinh mới"}
      </h1>
      <StudentForm initialData={initialData} />
    </div>
  );
}
