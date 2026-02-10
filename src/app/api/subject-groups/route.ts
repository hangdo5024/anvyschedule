import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subjectGroupSchema } from "@/lib/validations";

export async function GET() {
  try {
    const groups = await prisma.subjectGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Failed to fetch subject groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = subjectGroupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const group = await prisma.subjectGroup.create({
      data: validated.data,
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Failed to create subject group:", error);
    return NextResponse.json(
      { error: "Failed to create subject group" },
      { status: 500 }
    );
  }
}
