"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DeleteSubjectButton } from "./delete-subject-button";
import { Pencil, Copy, Search } from "lucide-react";

const LEVEL_LABELS: Record<number, string> = {
  1: "Dễ",
  2: "Trung bình",
  3: "Khó",
  4: "Nâng cao",
  5: "Chuyên sâu",
};

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  level: number;
  ageMin: number | null;
  ageMax: number | null;
  subjectGroupId: string | null;
  subjectGroup: { id: string; name: string; color: string } | null;
  _count: { assignments: number };
}

interface SubjectGroup {
  id: string;
  name: string;
  color: string;
}

interface SubjectsTableProps {
  subjects: Subject[];
  groups: SubjectGroup[];
}

export function SubjectsTable({ subjects, groups }: SubjectsTableProps) {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filterGroup) {
        if (filterGroup === "__none__") {
          if (s.subjectGroupId) return false;
        } else {
          if (s.subjectGroupId !== filterGroup) return false;
        }
      }
      if (filterLevel && s.level !== parseInt(filterLevel, 10)) {
        return false;
      }
      return true;
    });
  }, [subjects, search, filterGroup, filterLevel]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="w-[180px]"
        >
          <SelectOption value="">Tất cả nhóm</SelectOption>
          <SelectOption value="__none__">Chưa có nhóm</SelectOption>
          {groups.map((g) => (
            <SelectOption key={g.id} value={g.id}>
              {g.name}
            </SelectOption>
          ))}
        </Select>
        <Select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="w-[160px]"
        >
          <SelectOption value="">Tất cả độ khó</SelectOption>
          {Object.entries(LEVEL_LABELS).map(([val, label]) => (
            <SelectOption key={val} value={val}>
              {label}
            </SelectOption>
          ))}
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Hiển thị {filtered.length}/{subjects.length} môn học
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Môn học</TableHead>
            <TableHead>Nhóm</TableHead>
            <TableHead>Độ khó</TableHead>
            <TableHead>Độ tuổi</TableHead>
            <TableHead>Phân công</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Không tìm thấy môn học nào
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  {subject.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 ml-5">
                      {subject.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {subject.subjectGroup ? (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: subject.subjectGroup.color, color: subject.subjectGroup.color }}
                    >
                      {subject.subjectGroup.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {LEVEL_LABELS[subject.level] || `Lv${subject.level}`}
                  </Badge>
                </TableCell>
                <TableCell>
                  {subject.ageMin !== null || subject.ageMax !== null ? (
                    <span className="text-sm">
                      {subject.ageMin ?? "?"} - {subject.ageMax ?? "?"} tuổi
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>{subject._count.assignments}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/subjects/new?copyFrom=${subject.id}`} title="Sao chép">
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/subjects/${subject.id}/edit`} title="Chỉnh sửa">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteSubjectButton
                      subjectId={subject.id}
                      subjectName={subject.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
