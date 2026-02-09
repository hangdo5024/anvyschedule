import { prisma } from "@/lib/prisma";
import { HistoryView } from "@/components/history/history-view";

export default async function HistoryPage() {
  const [students, subjects] = await Promise.all([
    prisma.student.findMany({
      select: {
        id: true,
        fullName: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Lich su hoc tap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem lai lich su hoc tap cua hoc sinh
        </p>
      </div>
      <HistoryView students={students} subjects={subjects} />
    </div>
  );
}
