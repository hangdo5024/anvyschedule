import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        classes: {
          include: {
            class: true,
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = studentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: validated.data,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Failed to create student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
