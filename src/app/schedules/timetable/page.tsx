import { prisma } from "@/lib/prisma";
import { TimetableView } from "@/components/schedules/timetable-view";

export default async function TimetablePage() {
  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.class.findMany({
      select: { id: true, name: true, gradeLevel: true },
      orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Thời khóa biểu</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem lịch học theo tuần hoặc theo ngày
        </p>
      </div>
      <TimetableView students={students} classes={classes} />
    </div>
  );
}
