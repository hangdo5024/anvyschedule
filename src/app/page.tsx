import { prisma } from "@/lib/prisma";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const students = await prisma.student.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardView students={students} />
    </div>
  );
}
