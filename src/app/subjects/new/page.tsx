import { prisma } from "@/lib/prisma";
import { SubjectForm } from "@/components/subjects/subject-form";

interface NewSubjectPageProps {
  searchParams: Promise<{ copyFrom?: string }>;
}

export default async function NewSubjectPage({ searchParams }: NewSubjectPageProps) {
  const { copyFrom } = await searchParams;

  const groups = await prisma.subjectGroup.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });

  let initialData;
  if (copyFrom) {
    const source = await prisma.subject.findUnique({ where: { id: copyFrom } });
    if (source) {
      initialData = {
        name: source.name + " (bản sao)",
        description: source.description,
        color: source.color,
        icon: source.icon,
        level: source.level,
        ageMin: source.ageMin,
        ageMax: source.ageMax,
        subjectGroupId: source.subjectGroupId,
      };
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {copyFrom ? "Sao chép môn học" : "Thêm môn học mới"}
      </h1>
      <SubjectForm initialData={initialData} groups={groups} />
    </div>
  );
}
