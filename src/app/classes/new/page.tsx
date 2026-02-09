import { ClassForm } from "@/components/classes/class-form";

export default function NewClassPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thêm lớp học mới</h1>
        <p className="text-muted-foreground">
          Điền thông tin bên dưới để tạo lớp học mới
        </p>
      </div>
      <ClassForm />
    </div>
  );
}
