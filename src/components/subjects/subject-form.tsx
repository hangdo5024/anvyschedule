"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUBJECT_COLORS } from "@/lib/constants";
import { Loader2, Check } from "lucide-react";

interface SubjectFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
  };
}

export function SubjectForm({ initialData }: SubjectFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [color, setColor] = useState(initialData?.color ?? SUBJECT_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tên môn học là bắt buộc");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/subjects/${initialData.id}`
        : "/api/subjects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      router.push("/subjects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Tên môn học</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Toán, Tiếng Việt, Tiếng Anh..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về môn học (không bắt buộc)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Màu sắc</Label>
        <div className="grid grid-cols-5 gap-3">
          {SUBJECT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => setColor(c.value)}
              className={`h-10 w-10 rounded-full transition-all ${
                color === c.value
                  ? "ring-2 ring-offset-2 ring-primary scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
            >
              {color === c.value && (
                <Check className="h-5 w-5 mx-auto text-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Cập nhật" : "Tạo môn học"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/subjects")}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
