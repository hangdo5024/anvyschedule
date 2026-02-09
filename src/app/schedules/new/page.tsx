import { prisma } from "@/lib/prisma";
import { ScheduleForm } from "@/components/schedules/schedule-form";

interface NewSchedulePageProps {
  searchParams: Promise<{ copyFrom?: string }>;
}

export default async function NewSchedulePage({ searchParams }: NewSchedulePageProps) {
  const { copyFrom } = await searchParams;

  const [sourceSchedule, assignments] = await Promise.all([
    copyFrom
      ? prisma.schedule.findUnique({ where: { id: copyFrom } })
      : null,
    prisma.subjectAssignment.findMany({
      include: {
        student: { select: { fullName: true } },
        class: { select: { name: true } },
        subject: { select: { name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let initialData;
  if (sourceSchedule) {
    initialData = {
      subjectAssignmentId: sourceSchedule.subjectAssignmentId,
      dayOfWeek: sourceSchedule.dayOfWeek,
      startTime: sourceSchedule.startTime,
      endTime: sourceSchedule.endTime,
      location: sourceSchedule.location,
      teacherName: sourceSchedule.teacherName,
      recurrence: sourceSchedule.recurrence,
      effectiveFrom: sourceSchedule.effectiveFrom.toISOString().split("T")[0],
      effectiveUntil: sourceSchedule.effectiveUntil
        ? sourceSchedule.effectiveUntil.toISOString().split("T")[0]
        : null,
      notes: sourceSchedule.notes,
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {copyFrom ? "Sao chép lịch học" : "Thêm lịch học mới"}
      </h1>
      <ScheduleForm initialData={initialData} assignments={assignments} />
    </div>
  );
}
