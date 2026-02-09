import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scheduleSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");

    const where: {
      subjectAssignment?: {
        studentId?: string;
        classId?: string;
        subjectId?: string;
      };
    } = {};

    if (studentId || classId || subjectId) {
      where.subjectAssignment = {};
      if (studentId) where.subjectAssignment.studentId = studentId;
      if (classId) where.subjectAssignment.classId = classId;
      if (subjectId) where.subjectAssignment.subjectId = subjectId;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        subjectAssignment: {
          include: {
            student: true,
            class: true,
            subject: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = scheduleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { effectiveFrom, effectiveUntil, ...rest } = validated.data;

    const subjectAssignment = await prisma.subjectAssignment.findUnique({
      where: { id: rest.subjectAssignmentId },
    });

    if (!subjectAssignment) {
      return NextResponse.json(
        { error: "Subject assignment not found" },
        { status: 404 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        ...rest,
        effectiveFrom: new Date(effectiveFrom),
        effectiveUntil: effectiveUntil ? new Date(effectiveUntil) : null,
      },
      include: {
        subjectAssignment: {
          include: {
            student: true,
            class: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
