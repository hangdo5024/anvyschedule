import { z } from "zod";

export const studentSchema = z.object({
  fullName: z.string().min(1, "Tên học sinh là bắt buộc"),
  dateOfBirth: z.string().nullish(),
  gender: z.string().nullish(),
  parentName: z.string().nullish(),
  parentPhone: z.string().nullish(),
  notes: z.string().nullish(),
});

export const classSchema = z.object({
  name: z.string().min(1, "Tên lớp là bắt buộc"),
  gradeLevel: z.coerce.number().min(1).max(5),
  academicYear: z.string().min(1, "Năm học là bắt buộc"),
  description: z.string().nullish(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Tên môn học là bắt buộc"),
  description: z.string().nullish(),
  color: z.string().default("#3B82F6"),
  icon: z.string().nullish(),
});

export const assignmentSchema = z.object({
  studentId: z.string().min(1, "Học sinh là bắt buộc"),
  classId: z.string().min(1, "Lớp là bắt buộc"),
  subjectId: z.string().min(1, "Môn học là bắt buộc"),
});

export const scheduleSchema = z.object({
  subjectAssignmentId: z.string().min(1),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().min(1, "Giờ bắt đầu là bắt buộc"),
  endTime: z.string().min(1, "Giờ kết thúc là bắt buộc"),
  location: z.string().nullish(),
  teacherName: z.string().nullish(),
  recurrence: z.string().default("weekly"),
  effectiveFrom: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  effectiveUntil: z.string().nullish(),
  notes: z.string().nullish(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
export type ClassFormData = z.infer<typeof classSchema>;
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type ScheduleFormData = z.infer<typeof scheduleSchema>;
