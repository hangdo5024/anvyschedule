import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const studentId = searchParams.get("studentId");

    const where: {
      scheduleId?: string;
      schedule?: {
        subjectAssignment?: {
          studentId?: string;
        };
      };
    } = {};

    if (scheduleId) {
      where.scheduleId = scheduleId;
    }

    if (studentId) {
      where.schedule = {
        subjectAssignment: {
          studentId,
        },
      };
    }

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                student: true,
                class: true,
                subject: true,
              },
            },
          },
        },
      },
      orderBy: {
        schedule: {
          dayOfWeek: "asc",
        },
      },
    });

    // Secondary sort by startTime (Prisma doesn't support nested multi-field orderBy)
    reminders.sort((a, b) => {
      if (a.schedule.dayOfWeek !== b.schedule.dayOfWeek) {
        return a.schedule.dayOfWeek - b.schedule.dayOfWeek;
      }
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Failed to fetch reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, minutesBefore = 15, isEnabled = true } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId is required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        scheduleId,
        minutesBefore,
        isEnabled,
      },
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                student: true,
                class: true,
                subject: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Failed to create reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
