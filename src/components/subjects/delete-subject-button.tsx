"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteSubjectButtonProps {
  subjectId: string;
  subjectName: string;
}

export function DeleteSubjectButton({
  subjectId,
  subjectName,
}: DeleteSubjectButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Bạn có chắc chắn muốn xóa môn học "${subjectName}"?`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa môn học");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
