"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { GENDERS } from "@/lib/constants";

interface StudentFormProps {
  initialData?: {
    id: string;
    fullName: string;
    dateOfBirth: string | null;
    gender: string | null;
    parentName: string | null;
    parentPhone: string | null;
    notes: string | null;
  };
}

export function StudentForm({ initialData }: StudentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [gender, setGender] = useState(initialData?.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth ?? "");
  const [parentName, setParentName] = useState(initialData?.parentName ?? "");
  const [parentPhone, setParentPhone] = useState(initialData?.parentPhone ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const isEditing = !!initialData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Vui lòng nhập họ tên học sinh.");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        fullName: fullName.trim(),
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        parentName: parentName.trim() || null,
        parentPhone: parentPhone.trim() || null,
        notes: notes.trim() || null,
      };

      const url = isEditing
        ? `/api/students/${initialData.id}`
        : "/api/students";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to save student");
      }

      router.push("/students");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ tên học sinh"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- Chọn giới tính --</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Tên phụ huynh</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nhập tên phụ huynh"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">SĐT phụ huynh</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú (không bắt buộc)"
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Link href="/students">
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật"
                  : "Thêm học sinh"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
