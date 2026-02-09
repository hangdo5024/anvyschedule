import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, School, BookOpen, ClipboardList } from "lucide-react";

export default async function DashboardPage() {
  const [studentCount, classCount, subjectCount, assignmentCount] =
    await Promise.all([
      prisma.student.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.subjectAssignment.count(),
    ]);

  const stats = [
    {
      label: "Học sinh",
      value: studentCount,
      icon: Users,
      href: "/students",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Lớp học",
      value: classCount,
      icon: School,
      href: "/classes",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Môn học",
      value: subjectCount,
      icon: BookOpen,
      href: "/subjects",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Phân công",
      value: assignmentCount,
      icon: ClipboardList,
      href: "/assignments",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="block rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {studentCount === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">
            Chào mừng đến AnvySchedule!
          </h2>
          <p className="text-muted-foreground mb-4">
            Bắt đầu bằng cách thêm học sinh, lớp học và môn học.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Users className="h-4 w-4" />
              Thêm học sinh
            </Link>
            <Link
              href="/classes/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <School className="h-4 w-4" />
              Thêm lớp học
            </Link>
            <Link
              href="/subjects/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <BookOpen className="h-4 w-4" />
              Thêm môn học
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
