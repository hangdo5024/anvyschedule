import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subjectGroupSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = subjectGroupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const group = await prisma.subjectGroup.update({
      where: { id },
      data: validated.data,
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Subject group not found" },
        { status: 404 }
      );
    }
    console.error("Failed to update subject group:", error);
    return NextResponse.json(
      { error: "Failed to update subject group" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    await prisma.subjectGroup.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Subject group deleted successfully" });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Subject group not found" },
        { status: 404 }
      );
    }
    console.error("Failed to delete subject group:", error);
    return NextResponse.json(
      { error: "Failed to delete subject group" },
      { status: 500 }
    );
  }
}
