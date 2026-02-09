/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { X, ImagePlus, Paperclip, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PROGRESS_STATUS } from "@/lib/constants";
import { StarRating } from "@/components/progress/star-rating";
import { AttachmentList } from "@/components/progress/attachment-list";

interface AttachmentData {
  id: string;
  type: string;
  url: string;
  fileName: string | null;
}

interface ProgressFormProps {
  scheduleId: string;
  date: string;
  subjectName: string;
  className: string;
  startTime: string;
  endTime: string;
  initialData?: {
    id: string;
    status: string;
    notes: string | null;
    rating: number | null;
    attachments: AttachmentData[];
  } | null;
  onClose: () => void;
  onSaved: () => void;
}

interface PendingFile {
  file: File;
  type: "image" | "file";
  previewUrl?: string;
}

export function ProgressForm({
  scheduleId,
  date,
  subjectName,
  className: classNameProp,
  startTime,
  endTime,
  initialData,
  onClose,
  onSaved,
}: ProgressFormProps) {
  const [status, setStatus] = useState(initialData?.status || "completed");
  const [rating, setRating] = useState<number | null>(
    initialData?.rating ?? null
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [existingAttachments, setExistingAttachments] = useState<
    AttachmentData[]
  >(initialData?.attachments || []);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [videoLinkInput, setVideoLinkInput] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [pendingVideoLinks, setPendingVideoLinks] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusOptions = PROGRESS_STATUS.filter((s) => s.value !== "pending");

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newFiles: PendingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newFiles.push({
        file,
        type: "image",
        previewUrl: URL.createObjectURL(file),
      });
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newFiles: PendingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      newFiles.push({ file: files[i], type: "file" });
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function addVideoLink() {
    const url = videoLinkInput.trim();
    if (!url) return;
    setPendingVideoLinks((prev) => [...prev, url]);
    setVideoLinkInput("");
    setShowVideoInput(false);
  }

  function removeVideoLink(index: number) {
    setPendingVideoLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Step 1: Save progress record
      const progressRes = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId,
          date,
          status,
          notes: notes || null,
          rating,
        }),
      });

      if (!progressRes.ok) {
        const errData = await progressRes.json();
        alert(errData.error || "Lưu thất bại");
        setSaving(false);
        return;
      }

      const progress = await progressRes.json();
      const progressId = progress.id;

      // Step 2: Upload pending files
      for (const pf of pendingFiles) {
        const formData = new FormData();
        formData.append("file", pf.file);
        formData.append("type", pf.type);

        await fetch(`/api/progress/${progressId}/attachments`, {
          method: "POST",
          body: formData,
        });
      }

      // Step 3: Add video links
      for (const url of pendingVideoLinks) {
        await fetch(`/api/progress/${progressId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "video_link",
            url,
            fileName: null,
          }),
        });
      }

      onSaved();
    } catch {
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  function handleAttachmentDeleted() {
    // Re-fetch existing attachments after deletion
    if (initialData?.id) {
      fetch(`/api/progress/${initialData.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.attachments) {
            setExistingAttachments(data.attachments);
          }
        });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-lg border bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 rounded-t-lg">
          <div>
            <h2 className="text-lg font-semibold">Cập nhật tiến độ</h2>
            <p className="text-sm text-muted-foreground">
              {subjectName} &middot; {classNameProp} &middot; {startTime} - {endTime} &middot;{" "}
              {date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Trạng thái</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    status === opt.value
                      ? `${opt.color} ring-2 ring-offset-1 ring-current`
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Đánh giá</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ghi chú</Label>
            <Textarea
              placeholder="Nhập ghi chú về buổi học..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Existing attachments */}
          {initialData?.id && existingAttachments.length > 0 && (
            <AttachmentList
              attachments={existingAttachments}
              progressId={initialData.id}
              onDeleted={handleAttachmentDeleted}
            />
          )}

          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tệp mới ({pendingFiles.length})
              </p>
              <div className="space-y-2">
                {pendingFiles.map((pf, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border bg-blue-50/50 p-2"
                  >
                    {pf.previewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={pf.previewUrl}
                        alt="Preview"
                        className="h-12 w-12 rounded object-cover border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-100 border">
                        <Paperclip className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                    <span className="flex-1 truncate text-sm">
                      {pf.file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePendingFile(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending video links */}
          {pendingVideoLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Video links mới ({pendingVideoLinks.length})
              </p>
              <div className="space-y-2">
                {pendingVideoLinks.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border bg-purple-50/50 p-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-purple-100">
                      <Video className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="flex-1 truncate text-sm">{url}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideoLink(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add attachments buttons */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Đính kèm</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Thêm ảnh
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Thêm file
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVideoInput(!showVideoInput)}
              >
                <Video className="h-4 w-4 mr-2" />
                Thêm link video
              </Button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Video link input */}
            {showVideoInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập URL video (YouTube, Drive...)"
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVideoLink();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addVideoLink}
                  disabled={!videoLinkInput.trim()}
                >
                  Thêm
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-4 rounded-b-lg">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Huỷ
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
