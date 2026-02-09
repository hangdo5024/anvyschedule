import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScheduleForm } from "@/components/schedules/schedule-form";

interface EditSchedulePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
  const { id } = await params;

  const [schedule, assignments] = await Promise.all([
    prisma.schedule.findUnique({
      where: { id },
      include: {
        subjectAssignment: {
          include: {
            student: true,
            class: true,
            subject: true,
          },
        },
      },
    }),
    prisma.subjectAssignment.findMany({
      include: {
        student: { select: { fullName: true } },
        class: { select: { name: true } },
        subject: { select: { name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!schedule) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa lịch học</h1>
      <ScheduleForm
        initialData={{
          id: schedule.id,
          subjectAssignmentId: schedule.subjectAssignmentId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          location: schedule.location,
          teacherName: schedule.teacherName,
          recurrence: schedule.recurrence,
          effectiveFrom: schedule.effectiveFrom.toISOString().split("T")[0],
          effectiveUntil: schedule.effectiveUntil
            ? schedule.effectiveUntil.toISOString().split("T")[0]
            : null,
          notes: schedule.notes,
        }}
        assignments={assignments}
      />
    </div>
  );
}
