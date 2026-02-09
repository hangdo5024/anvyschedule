"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserMinus, Loader2 } from "lucide-react";

interface RemoveStudentButtonProps {
  classId: string;
  studentId: string;
  studentName: string;
}

export function RemoveStudentButton({
  classId,
  studentId,
  studentName,
}: RemoveStudentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa "${studentName}" khỏi lớp? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Xóa học sinh khỏi lớp thất bại");
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
      onClick={handleRemove}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserMinus className="h-4 w-4" />
      )}
    </Button>
  );
}
