import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const subjectId = searchParams.get("subjectId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    if (status && !["completed", "missed", "in_progress"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be one of: completed, missed, in_progress",
        },
        { status: 400 }
      );
    }

    const where: {
      schedule: {
        subjectAssignment: {
          studentId: string;
          subjectId?: string;
        };
      };
      date?: { gte?: Date; lte?: Date };
      status?: string;
    } = {
      schedule: {
        subjectAssignment: {
          studentId,
        },
      },
    };

    if (from || to) {
      where.date = {};
      if (from) {
        where.date.gte = new Date(from);
      }
      if (to) {
        where.date.lte = new Date(to);
      }
    }

    if (subjectId) {
      where.schedule.subjectAssignment.subjectId = subjectId;
    }

    if (status) {
      where.status = status;
    }

    const total = await prisma.progress.count({ where });

    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const data = await prisma.progress.findMany({
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
        attachments: true,
      },
      orderBy: [{ date: "desc" }, { schedule: { startTime: "desc" } }],
      skip,
      take: limit,
    });

    return NextResponse.json({
      data,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
