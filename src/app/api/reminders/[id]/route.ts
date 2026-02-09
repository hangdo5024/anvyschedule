import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const existing = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { minutesBefore, isEnabled } = body;

    const data: { minutesBefore?: number; isEnabled?: boolean } = {};

    if (minutesBefore !== undefined) {
      data.minutesBefore = minutesBefore;
    }

    if (isEnabled !== undefined) {
      data.isEnabled = isEnabled;
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data,
      include: {
        schedule: {
          include: {
            subjectAssignment: {
              include: {
                student: true,
                class: true,
                subject: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(reminder);
  } catch (error) {
    console.error("Failed to update reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
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

    await prisma.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Reminder deleted successfully" });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }
    console.error("Failed to delete reminder:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
