import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getWeekBounds(dateStr?: string | null): {
  weekStart: Date;
  weekEnd: Date;
} {
  const date = dateStr ? new Date(dateStr) : new Date();

  // Get Monday of the week (day 0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  teacherName: string | null;
  recurrence: string;
  notes: string | null;
  subjectAssignmentId: string;
  subjectName: string;
  subjectColor: string;
  subjectIcon: string | null;
  className: string;
  progress: {
    id: string;
    date: Date;
    status: string;
    notes: string | null;
    rating: number | null;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    const weekStartParam = searchParams.get("weekStart");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const { weekStart, weekEnd } = getWeekBounds(weekStartParam);

    const whereClause: {
      isActive: boolean;
      effectiveFrom: { lte: Date };
      OR: { effectiveUntil: null | { gte: Date } }[];
      subjectAssignment: {
        studentId: string;
        classId?: string;
      };
    } = {
      isActive: true,
      effectiveFrom: { lte: weekEnd },
      OR: [
        { effectiveUntil: null },
        { effectiveUntil: { gte: weekStart } },
      ],
      subjectAssignment: {
        studentId,
      },
    };

    if (classId) {
      whereClause.subjectAssignment.classId = classId;
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        subjectAssignment: {
          include: {
            subject: true,
            class: true,
          },
        },
        progresses: {
          where: {
            date: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Group schedules by dayOfWeek
    const days: Record<number, ScheduleItem[]> = {};

    for (let d = 0; d <= 6; d++) {
      days[d] = [];
    }

    for (const schedule of schedules) {
      const daySchedules = days[schedule.dayOfWeek];
      if (!daySchedules) continue;

      // Find progress record for the specific day of this week
      const scheduleDayDate = new Date(weekStart);
      // weekStart is Monday (day 1). dayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
      const daysFromMonday =
        schedule.dayOfWeek === 0 ? 6 : schedule.dayOfWeek - 1;
      scheduleDayDate.setDate(weekStart.getDate() + daysFromMonday);
      scheduleDayDate.setHours(0, 0, 0, 0);

      const matchingProgress = schedule.progresses.find((p) => {
        const progressDate = new Date(p.date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === scheduleDayDate.getTime();
      });

      const item: ScheduleItem = {
        id: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location,
        teacherName: schedule.teacherName,
        recurrence: schedule.recurrence,
        notes: schedule.notes,
        subjectAssignmentId: schedule.subjectAssignmentId,
        subjectName: schedule.subjectAssignment.subject.name,
        subjectColor: schedule.subjectAssignment.subject.color,
        subjectIcon: schedule.subjectAssignment.subject.icon,
        className: schedule.subjectAssignment.class.name,
        progress: matchingProgress
          ? {
              id: matchingProgress.id,
              date: matchingProgress.date,
              status: matchingProgress.status,
              notes: matchingProgress.notes,
              rating: matchingProgress.rating,
            }
          : null,
      };

      daySchedules.push(item);
    }

    return NextResponse.json({
      studentId,
      classId: classId || null,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      days,
    });
  } catch (error) {
    console.error("Failed to fetch timetable:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}
