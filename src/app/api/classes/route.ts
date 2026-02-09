import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validations";

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            students: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = classSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: validated.data,
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Failed to create class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
