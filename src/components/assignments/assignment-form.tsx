"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, AlertTriangle } from "lucide-react";

const LEVEL_LABELS: Record<number, string> = {
  1: "Dễ",
  2: "TB",
  3: "Khó",
  4: "Nâng cao",
  5: "Chuyên sâu",
};

interface AssignmentFormProps {
  students: { id: string; fullName: string; dateOfBirth: string | null }[];
  classes: { id: string; name: string; gradeLevel: number; ageMin: number | null; ageMax: number | null }[];
  subjects: { id: string; name: string; color: string; level: number; ageMin: number | null; ageMax: number | null }[];
}

function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function isAgeMatch(age: number, ageMin: number | null, ageMax: number | null): boolean {
  if (ageMin !== null && age < ageMin) return false;
  if (ageMax !== null && age > ageMax) return false;
  return true;
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

  // Calculate selected student's age
  const selectedStudent = students.find((s) => s.id === studentId);
  const studentAge = useMemo(() => {
    if (!selectedStudent?.dateOfBirth) return null;
    return calculateAge(selectedStudent.dateOfBirth);
  }, [selectedStudent]);

  // Filter classes by student age
  const filteredClasses = useMemo(() => {
    if (studentAge === null) return classes;
    return classes.filter((c) => {
      if (c.ageMin === null && c.ageMax === null) return true;
      return isAgeMatch(studentAge, c.ageMin, c.ageMax);
    });
  }, [classes, studentAge]);

  // Filter subjects by student age
  const filteredSubjects = useMemo(() => {
    if (studentAge === null) return subjects;
    return subjects.filter((s) => {
      if (s.ageMin === null && s.ageMax === null) return true;
      return isAgeMatch(studentAge, s.ageMin, s.ageMax);
    });
  }, [subjects, studentAge]);

  // Reset class/subject when student changes and they become invalid
  function handleStudentChange(newStudentId: string) {
    setStudentId(newStudentId);
    setClassId("");
    setSubjectId("");
  }

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
            onChange={(e) => handleStudentChange(e.target.value)}
          >
            <SelectOption value="">-- Chọn học sinh --</SelectOption>
            {students.map((s) => (
              <SelectOption key={s.id} value={s.id}>
                {s.fullName}
              </SelectOption>
            ))}
          </Select>
          {studentAge !== null && (
            <p className="text-xs text-muted-foreground">
              Tuổi: <span className="font-medium">{studentAge}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="classId">
            Lớp
            {studentAge !== null && filteredClasses.length < classes.length && (
              <span className="text-xs text-orange-600 ml-1">
                (lọc theo tuổi {studentAge})
              </span>
            )}
          </Label>
          <Select
            id="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <SelectOption value="">-- Chọn lớp --</SelectOption>
            {filteredClasses.map((c) => (
              <SelectOption key={c.id} value={c.id}>
                {c.name} (Khối {c.gradeLevel})
                {c.ageMin !== null || c.ageMax !== null
                  ? ` [${c.ageMin ?? "?"}-${c.ageMax ?? "?"}t]`
                  : ""}
              </SelectOption>
            ))}
          </Select>
          {studentAge !== null && filteredClasses.length === 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              Không có lớp phù hợp tuổi {studentAge}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectId">
            Môn học
            {studentAge !== null && filteredSubjects.length < subjects.length && (
              <span className="text-xs text-orange-600 ml-1">
                (lọc theo tuổi {studentAge})
              </span>
            )}
          </Label>
          <Select
            id="subjectId"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <SelectOption value="">-- Chọn môn học --</SelectOption>
            {filteredSubjects.map((s) => (
              <SelectOption key={s.id} value={s.id}>
                {s.name}
                {s.level > 1 ? ` (${LEVEL_LABELS[s.level] || `Lv${s.level}`})` : ""}
                {s.ageMin !== null || s.ageMax !== null
                  ? ` [${s.ageMin ?? "?"}-${s.ageMax ?? "?"}t]`
                  : ""}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      {/* Show selected subject info */}
      {subjectId && (() => {
        const sub = subjects.find((s) => s.id === subjectId);
        if (!sub) return null;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Badge className="text-white" style={{ backgroundColor: sub.color }}>
              {sub.name}
            </Badge>
            <span className="text-muted-foreground">
              Độ khó: {LEVEL_LABELS[sub.level] || sub.level}
            </span>
            {(sub.ageMin !== null || sub.ageMax !== null) && (
              <span className="text-muted-foreground">
                | Tuổi: {sub.ageMin ?? "?"} - {sub.ageMax ?? "?"}
              </span>
            )}
          </div>
        );
      })()}

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
