"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectOption } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GRADE_LEVELS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface ClassFormProps {
  initialData?: {
    id: string;
    name: string;
    gradeLevel: number;
    academicYear: string;
    description: string | null;
  };
}

export function ClassForm({ initialData }: ClassFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name ?? "");
  const [gradeLevel, setGradeLevel] = useState(
    initialData?.gradeLevel?.toString() ?? "1"
  );
  const [academicYear, setAcademicYear] = useState(
    initialData?.academicYear ?? "2025-2026"
  );
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const isEditing = !!initialData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = {
        name,
        gradeLevel: parseInt(gradeLevel, 10),
        academicYear,
        description: description || undefined,
      };

      const url = isEditing
        ? `/api/classes/${initialData.id}`
        : "/api/classes";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lưu lớp học thất bại");
      }

      router.push("/classes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Tên lớp</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Lớp 1A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Khối</Label>
              <Select
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                required
              >
                {GRADE_LEVELS.map((grade) => (
                  <SelectOption key={grade.value} value={grade.value.toString()}>
                    {grade.label}
                  </SelectOption>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">Năm học</Label>
              <Input
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Ví dụ: 2025-2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả về lớp học (không bắt buộc)"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Cập nhật" : "Tạo lớp"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/classes")}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
