import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubjectForm } from "@/components/subjects/subject-form";

interface EditSubjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const { id } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa môn học</h1>
      <SubjectForm
        initialData={{
          id: subject.id,
          name: subject.name,
          description: subject.description,
          color: subject.color,
          icon: subject.icon,
        }}
      />
    </div>
  );
}
