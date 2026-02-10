"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { SubjectGroupForm } from "./subject-group-form";
import { DeleteSubjectGroupButton } from "./delete-subject-group-button";

interface SubjectGroup {
  id: string;
  name: string;
  color: string;
  _count: { subjects: number };
}

interface SubjectGroupListProps {
  groups: SubjectGroup[];
}

export function SubjectGroupList({ groups }: SubjectGroupListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nhóm môn học</TableHead>
          <TableHead>Màu</TableHead>
          <TableHead>Số môn học</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          editingId === group.id ? (
            <TableRow key={group.id}>
              <TableCell colSpan={4}>
                <SubjectGroupForm
                  editingGroup={group}
                  onCancel={() => setEditingId(null)}
                />
              </TableCell>
            </TableRow>
          ) : (
            <TableRow key={group.id}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>
                <Badge className="text-white" style={{ backgroundColor: group.color }}>
                  {group.color}
                </Badge>
              </TableCell>
              <TableCell>{group._count.subjects}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(group.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteSubjectGroupButton
                    groupId={group.id}
                    groupName={group.name}
                  />
                </div>
              </TableCell>
            </TableRow>
          )
        ))}
      </TableBody>
    </Table>
  );
}
