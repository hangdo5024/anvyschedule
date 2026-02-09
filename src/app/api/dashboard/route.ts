import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, format, getDay, addDays } from "date-fns";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const dateParam = searchParams.get("date");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, fullName: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const date = dateParam ? new Date(dateParam) : new Date();
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayOfWeek = getDay(dateOnly);

    // Week boundaries (Monday start)
    const weekStart = startOfWeek(dateOnly, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(dateOnly, { weekStartsOn: 1 });

    // Find all active schedules for this student
    const allStudentSchedules = await prisma.schedule.findMany({
      where: {
        isActive: true,
        subjectAssignment: {
          studentId: studentId,
        },
        effectiveFrom: {
          lte: weekEnd,
        },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: weekStart } },
        ],
      },
      include: {
        subjectAssignment: {
          include: {
            subject: {
              select: { name: true, color: true },
            },
            class: {
              select: { name: true },
            },
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

    // Filter today's schedules
    const todaySchedules = allStudentSchedules
      .filter((s) => {
        const from = new Date(s.effectiveFrom);
        const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const until = s.effectiveUntil ? new Date(s.effectiveUntil) : null;
        const untilDate = until
          ? new Date(until.getFullYear(), until.getMonth(), until.getDate())
          : null;
        return (
          s.dayOfWeek === dayOfWeek &&
          fromDate <= dateOnly &&
          (untilDate === null || untilDate >= dateOnly)
        );
      })
      .map((s) => {
        const todayProgress = s.progresses.find((p) => {
          const pDate = new Date(p.date);
          return (
            pDate.getFullYear() === dateOnly.getFullYear() &&
            pDate.getMonth() === dateOnly.getMonth() &&
            pDate.getDate() === dateOnly.getDate()
          );
        });
        return {
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          subject: {
            name: s.subjectAssignment.subject.name,
            color: s.subjectAssignment.subject.color,
          },
          className: s.subjectAssignment.class.name,
          teacherName: s.teacherName || "",
          location: s.location || "",
          progress: todayProgress
            ? {
                status: todayProgress.status,
                rating: todayProgress.rating,
                notes: todayProgress.notes,
              }
            : null,
        };
      });

    // Today stats
    const todayCompleted = todaySchedules.filter(
      (s) => s.progress?.status === "completed"
    ).length;
    const todayInProgress = todaySchedules.filter(
      (s) => s.progress?.status === "in_progress"
    ).length;
    const todayPending = todaySchedules.filter(
      (s) => !s.progress || s.progress.status === "pending"
    ).length;
    const todayMissed = todaySchedules.filter(
      (s) => s.progress?.status === "missed"
    ).length;

    // Weekly stats: build daily breakdown
    const dailyStats: {
      day: number;
      label: string;
      total: number;
      completed: number;
    }[] = [];

    let weekTotalSchedules = 0;
    let weekCompleted = 0;

    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      const currentDayOfWeek = getDay(currentDay);
      const currentDateOnly = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth(),
        currentDay.getDate()
      );

      // Schedules valid for this day
      const daySchedules = allStudentSchedules.filter((s) => {
        const from = new Date(s.effectiveFrom);
        const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const until = s.effectiveUntil ? new Date(s.effectiveUntil) : null;
        const untilDate = until
          ? new Date(until.getFullYear(), until.getMonth(), until.getDate())
          : null;
        return (
          s.dayOfWeek === currentDayOfWeek &&
          fromDate <= currentDateOnly &&
          (untilDate === null || untilDate >= currentDateOnly)
        );
      });

      const dayCompleted = daySchedules.filter((s) =>
        s.progresses.some((p) => {
          const pDate = new Date(p.date);
          return (
            pDate.getFullYear() === currentDateOnly.getFullYear() &&
            pDate.getMonth() === currentDateOnly.getMonth() &&
            pDate.getDate() === currentDateOnly.getDate() &&
            p.status === "completed"
          );
        })
      ).length;

      weekTotalSchedules += daySchedules.length;
      weekCompleted += dayCompleted;

      dailyStats.push({
        day: currentDayOfWeek,
        label: DAY_LABELS[currentDayOfWeek],
        total: daySchedules.length,
        completed: dayCompleted,
      });
    }

    const completionRate =
      weekTotalSchedules > 0
        ? Math.round((weekCompleted / weekTotalSchedules) * 100)
        : 0;

    return NextResponse.json({
      date: format(dateOnly, "yyyy-MM-dd"),
      dayOfWeek,
      student,
      today: {
        schedules: todaySchedules,
        total: todaySchedules.length,
        completed: todayCompleted,
        inProgress: todayInProgress,
        pending: todayPending,
        missed: todayMissed,
      },
      week: {
        weekStart: format(weekStart, "yyyy-MM-dd"),
        weekEnd: format(weekEnd, "yyyy-MM-dd"),
        totalSchedules: weekTotalSchedules,
        completed: weekCompleted,
        completionRate,
        dailyStats,
      },
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
