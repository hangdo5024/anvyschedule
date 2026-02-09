import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thêm học sinh mới</h1>
      <StudentForm />
    </div>
  );
}
