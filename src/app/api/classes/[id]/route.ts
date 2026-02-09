import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: true,
          },
        },
        assignments: {
          include: {
            student: true,
            subject: true,
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error("Failed to fetch class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
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
    const validated = classSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.class.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: validated.data,
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Failed to update class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
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

    const existing = await prisma.class.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    await prisma.class.delete({ where: { id } });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Failed to delete class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
