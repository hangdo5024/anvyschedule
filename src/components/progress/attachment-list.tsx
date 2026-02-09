/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Trash2, FileText, Video, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentItem {
  id: string;
  type: string;
  url: string;
  fileName: string | null;
}

interface AttachmentListProps {
  attachments: AttachmentItem[];
  progressId: string;
  onDeleted: () => void;
}

export function AttachmentList({
  attachments,
  progressId,
  onDeleted,
}: AttachmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(attachmentId: string) {
    if (!confirm("Xoá tệp đính kèm này?")) return;

    setDeletingId(attachmentId);
    try {
      const res = await fetch(
        `/api/progress/${progressId}/attachments?attachmentId=${attachmentId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        onDeleted();
      } else {
        const data = await res.json();
        alert(data.error || "Xoá thất bại");
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setDeletingId(null);
    }
  }

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Tệp đính kèm ({attachments.length})
      </p>
      <div className="space-y-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2"
          >
            {att.type === "image" ? (
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <img
                  src={att.url}
                  alt={att.fileName || "Ảnh đính kèm"}
                  className="h-16 w-16 rounded object-cover border"
                />
              </a>
            ) : att.type === "video_link" ? (
              <div className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded bg-purple-50 border">
                <Video className="h-6 w-6 text-purple-500" />
              </div>
            ) : (
              <div className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded bg-blue-50 border">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {att.type === "video_link" ? (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{att.url}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              ) : (
                <p className="text-sm truncate">
                  {att.fileName || "Tệp không tên"}
                </p>
              )}
              <p className="text-xs text-muted-foreground capitalize">
                {att.type === "video_link"
                  ? "Video link"
                  : att.type === "image"
                  ? "Hình ảnh"
                  : "Tệp"}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={deletingId === att.id}
              onClick={() => handleDelete(att.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
            >
              {deletingId === att.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
