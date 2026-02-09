"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteClassButtonProps {
  classId: string;
  className: string;
}

export function DeleteClassButton({ classId, className }: DeleteClassButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Bạn có chắc chắn muốn xóa lớp "${className}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Xóa lớp thất bại");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
