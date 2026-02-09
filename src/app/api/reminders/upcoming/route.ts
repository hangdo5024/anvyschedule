import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.

    const reminders = await prisma.reminder.findMany({
      where: {
        isEnabled: true,
        schedule: {
          dayOfWeek: currentDayOfWeek,
          isActive: true,
          effectiveFrom: {
            lte: now,
          },
          OR: [
            { effectiveUntil: null },
            { effectiveUntil: { gte: now } },
          ],
          subjectAssignment: {
            studentId,
          },
        },
      },
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                subject: {
                  select: {
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        schedule: {
          startTime: "asc",
        },
      },
    });

    const result = reminders.map((reminder) => ({
      id: reminder.id,
      minutesBefore: reminder.minutesBefore,
      schedule: {
        id: reminder.schedule.id,
        startTime: reminder.schedule.startTime,
        endTime: reminder.schedule.endTime,
        subject: {
          name: reminder.schedule.subjectAssignment.subject.name,
          color: reminder.schedule.subjectAssignment.subject.color,
        },
        teacherName: reminder.schedule.teacherName,
        location: reminder.schedule.location,
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch upcoming reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming reminders" },
      { status: 500 }
    );
  }
}
