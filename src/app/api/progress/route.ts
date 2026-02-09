import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const studentId = searchParams.get("studentId");

    const where: {
      scheduleId?: string;
      date?: Date | { gte?: Date; lte?: Date };
      schedule?: {
        subjectAssignment?: {
          studentId?: string;
        };
      };
    } = {};

    if (scheduleId) {
      where.scheduleId = scheduleId;
    }

    if (date) {
      where.date = new Date(date);
    } else if (from || to) {
      where.date = {};
      if (from) {
        (where.date as { gte?: Date; lte?: Date }).gte = new Date(from);
      }
      if (to) {
        (where.date as { gte?: Date; lte?: Date }).lte = new Date(to);
      }
    }

    if (studentId) {
      where.schedule = {
        subjectAssignment: {
          studentId,
        },
      };
    }

    const progressRecords = await prisma.progress.findMany({
      where,
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                subject: true,
                class: true,
                student: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: [{ date: "desc" }, { schedule: { startTime: "asc" } }],
    });

    return NextResponse.json(progressRecords);
  } catch (error) {
    console.error("Failed to fetch progress records:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, date, status, notes, rating } = body;

    if (!scheduleId || !date) {
      return NextResponse.json(
        { error: "scheduleId and date are required" },
        { status: 400 }
      );
    }

    if (status && !["pending", "completed", "in_progress", "missed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, completed, in_progress, missed" },
        { status: 400 }
      );
    }

    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    const parsedDate = new Date(date);

    const progress = await prisma.progress.upsert({
      where: {
        scheduleId_date: {
          scheduleId,
          date: parsedDate,
        },
      },
      update: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        rating: rating !== undefined ? rating : undefined,
      },
      create: {
        scheduleId,
        date: parsedDate,
        status: status || "pending",
        notes: notes || null,
        rating: rating || null,
      },
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                subject: true,
                class: true,
                student: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error("Failed to create/update progress:", error);
    return NextResponse.json(
      { error: "Failed to create/update progress" },
      { status: 500 }
    );
  }
}
