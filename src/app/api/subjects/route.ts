import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subjectSchema } from "@/lib/validations";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = subjectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: validated.data,
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("Failed to create subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
