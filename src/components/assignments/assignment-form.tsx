"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

interface AssignmentFormProps {
  students: { id: string; fullName: string }[];
  classes: { id: string; name: string; gradeLevel: number }[];
  subjects: { id: string; name: string; color: string }[];
}

export function AssignmentForm({
  students,
  classes,
  subjects,
}: AssignmentFormProps) {
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!studentId || !classId || !subjectId) {
      setError("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, classId, subjectId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      setStudentId("");
      setClassId("");
      setSubjectId("");
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentId">Học sinh</Label>
          <Select
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <SelectOption value="">-- Chọn học sinh --</SelectOption>
            {students.map((s) => (
              <SelectOption key={s.id} value={s.id}>
                {s.fullName}
              </SelectOption>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="classId">Lớp</Label>
          <Select
            id="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <SelectOption value="">-- Chọn lớp --</SelectOption>
            {classes.map((c) => (
              <SelectOption key={c.id} value={c.id}>
                {c.name} (Khối {c.gradeLevel})
              </SelectOption>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectId">Môn học</Label>
          <Select
            id="subjectId"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <SelectOption value="">-- Chọn môn học --</SelectOption>
            {subjects.map((s) => (
              <SelectOption key={s.id} value={s.id}>
                {s.name}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Phân công
      </Button>
    </form>
  );
}
