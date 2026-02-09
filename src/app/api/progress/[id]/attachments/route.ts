import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: progressId } = await params;

    const progress = await prisma.progress.findUnique({
      where: { id: progressId },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progress not found" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle video_link type
      const body = await request.json();
      const { type, url, fileName } = body;

      if (type !== "video_link") {
        return NextResponse.json(
          { error: "JSON body only supports type 'video_link'" },
          { status: 400 }
        );
      }

      if (!url) {
        return NextResponse.json(
          { error: "url is required for video_link" },
          { status: 400 }
        );
      }

      const attachment = await prisma.attachment.create({
        data: {
          progressId,
          type: "video_link",
          url,
          fileName: fileName || null,
          fileSize: null,
        },
      });

      return NextResponse.json(attachment, { status: 201 });
    }

    // Handle file upload (image or file)
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "file";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!["image", "file"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type for file upload. Must be 'image' or 'file'" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    await writeFile(filePath, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        progressId,
        type,
        url: `/uploads/${uniqueFilename}`,
        fileName: file.name,
        fileSize: file.size,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Failed to create attachment:", error);
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: progressId } = await params;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) {
      return NextResponse.json(
        { error: "attachmentId query parameter is required" },
        { status: 400 }
      );
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    if (attachment.progressId !== progressId) {
      return NextResponse.json(
        { error: "Attachment does not belong to this progress record" },
        { status: 400 }
      );
    }

    // Delete file from disk if it's not a video_link
    if (attachment.type !== "video_link") {
      try {
        const filePath = path.join(process.cwd(), "public", attachment.url);
        await unlink(filePath);
      } catch (fileError) {
        // File may not exist on disk, log but continue with database deletion
        console.warn("Failed to delete file from disk:", fileError);
      }
    }

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Failed to delete attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
