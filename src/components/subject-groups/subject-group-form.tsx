"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUBJECT_COLORS } from "@/lib/constants";
import { Loader2, Plus, Check } from "lucide-react";

interface SubjectGroupFormProps {
  editingGroup?: { id: string; name: string; color: string } | null;
  onCancel?: () => void;
}

export function SubjectGroupForm({ editingGroup, onCancel }: SubjectGroupFormProps) {
  const router = useRouter();
  const isEditing = !!editingGroup;

  const [name, setName] = useState(editingGroup?.name ?? "");
  const [color, setColor] = useState(editingGroup?.color ?? SUBJECT_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tên nhóm môn học là bắt buộc");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/subject-groups/${editingGroup!.id}`
        : "/api/subject-groups";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      setName("");
      setColor(SUBJECT_COLORS[0].value);
      if (onCancel) onCancel();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="groupName">Tên nhóm</Label>
          <Input
            id="groupName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Khoa học tự nhiên, Xã hội..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Màu sắc</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setColor(c.value)}
                className={`h-8 w-8 rounded-full transition-all ${
                  color === c.value
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
              >
                {color === c.value && (
                  <Check className="h-4 w-4 mx-auto text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? (
            "Cập nhật"
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhóm
            </>
          )}
        </Button>
        {isEditing && onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Hủy
          </Button>
        )}
      </div>
    </form>
  );
}
