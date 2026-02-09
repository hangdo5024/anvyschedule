import { prisma } from "@/lib/prisma";
import { ScheduleForm } from "@/components/schedules/schedule-form";

export default async function NewSchedulePage() {
  const assignments = await prisma.subjectAssignment.findMany({
    include: {
      student: { select: { fullName: true } },
      class: { select: { name: true } },
      subject: { select: { name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thêm lịch học mới</h1>
      <ScheduleForm assignments={assignments} />
    </div>
  );
}
