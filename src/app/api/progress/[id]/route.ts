import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const progress = await prisma.progress.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                subject: true,
                class: true,
                student: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const existing = await prisma.progress.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, notes, rating } = body;

    if (status && !["pending", "completed", "in_progress", "missed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, completed, in_progress, missed" },
        { status: 400 }
      );
    }

    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const data: { status?: string; notes?: string | null; rating?: number | null } = {};
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (rating !== undefined) data.rating = rating;

    const progress = await prisma.progress.update({
      where: { id },
      data,
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                subject: true,
                class: true,
                student: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
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

    await prisma.progress.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Progress deleted successfully" });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }
    console.error("Failed to delete progress:", error);
    return NextResponse.json(
      { error: "Failed to delete progress" },
      { status: 500 }
    );
  }
}
