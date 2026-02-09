import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            class: true,
          },
        },
        assignments: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Failed to fetch student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = studentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.student.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Failed to update student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.student.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Failed to delete student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
