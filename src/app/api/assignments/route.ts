import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignmentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");

    const where: { studentId?: string; classId?: string } = {};
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;

    const assignments = await prisma.subjectAssignment.findMany({
      where,
      include: {
        student: true,
        class: true,
        subject: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = assignmentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { studentId, classId, subjectId } = validated.data;

    const existing = await prisma.subjectAssignment.findUnique({
      where: {
        studentId_classId_subjectId: { studentId, classId, subjectId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This subject is already assigned to this student in this class" },
        { status: 409 }
      );
    }

    const assignment = await prisma.subjectAssignment.create({
      data: { studentId, classId, subjectId },
      include: {
        student: true,
        class: true,
        subject: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Failed to create assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
