import { prisma } from "@/lib/prisma";
import { ProgressView } from "@/components/progress/progress-view";

export default async function ProgressPage() {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      fullName: true,
    },
    orderBy: { fullName: "asc" },
  });

  return <ProgressView students={students} />;
}
