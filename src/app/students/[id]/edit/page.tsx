import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/students/student-form";

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa học sinh</h1>
      <StudentForm
        initialData={{
          id: student.id,
          fullName: student.fullName,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          notes: student.notes,
        }}
      />
    </div>
  );
}
