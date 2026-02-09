"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectOption } from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";

interface AddStudentToClassProps {
  classId: string;
  availableStudents: { id: string; fullName: string }[];
}

export function AddStudentToClass({
  classId,
  availableStudents,
}: AddStudentToClassProps) {
  const router = useRouter();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (availableStudents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tất cả học sinh đã được thêm vào lớp
      </p>
    );
  }

  async function handleAdd() {
    if (!selectedStudentId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Thêm học sinh thất bại");
      }

      setSelectedStudentId("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="flex-1"
        >
          <SelectOption value="">-- Chọn học sinh --</SelectOption>
          {availableStudents.map((student) => (
            <SelectOption key={student.id} value={student.id}>
              {student.fullName}
            </SelectOption>
          ))}
        </Select>
        <Button
          onClick={handleAdd}
          disabled={loading || !selectedStudentId}
          size="sm"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Thêm
        </Button>
      </div>
    </div>
  );
}
