import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.attachment.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.subjectAssignment.deleteMany();
  await prisma.studentClass.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();

  // Create students
  const anvy = await prisma.student.create({
    data: {
      fullName: "Nguyễn Văn Anvy",
      dateOfBirth: "2017-05-15",
      gender: "male",
      parentName: "Nguyễn Văn Hùng",
      parentPhone: "0901234567",
      notes: "Học sinh giỏi",
    },
  });

  const mai = await prisma.student.create({
    data: {
      fullName: "Trần Thị Mai",
      dateOfBirth: "2017-08-20",
      gender: "female",
      parentName: "Trần Văn Bình",
      parentPhone: "0912345678",
    },
  });

  // Create classes
  const class3A = await prisma.class.create({
    data: {
      name: "3A",
      gradeLevel: 3,
      academicYear: "2025-2026",
      description: "Lớp 3A - Cô Hoa chủ nhiệm",
    },
  });

  // Enroll students
  await prisma.studentClass.createMany({
    data: [
      { studentId: anvy.id, classId: class3A.id },
      { studentId: mai.id, classId: class3A.id },
    ],
  });

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: { name: "Toán", color: "#3B82F6", description: "Toán học" },
    }),
    prisma.subject.create({
      data: { name: "Tiếng Việt", color: "#EF4444", description: "Tiếng Việt" },
    }),
    prisma.subject.create({
      data: { name: "Tiếng Anh", color: "#8B5CF6", description: "Tiếng Anh" },
    }),
    prisma.subject.create({
      data: {
        name: "Tự nhiên & Xã hội",
        color: "#10B981",
        description: "TNXH",
      },
    }),
    prisma.subject.create({
      data: { name: "Mỹ Thuật", color: "#F97316", description: "Mỹ thuật" },
    }),
    prisma.subject.create({
      data: { name: "Âm nhạc", color: "#EC4899", description: "Âm nhạc" },
    }),
    prisma.subject.create({
      data: { name: "Thể dục", color: "#EAB308", description: "Thể dục" },
    }),
    prisma.subject.create({
      data: { name: "Tin học", color: "#6B7280", description: "Tin học" },
    }),
    prisma.subject.create({
      data: { name: "Đạo đức", color: "#92400E", description: "Đạo đức" },
    }),
  ]);

  // Assign subjects to Anvy in class 3A
  for (const subject of subjects) {
    await prisma.subjectAssignment.create({
      data: {
        studentId: anvy.id,
        classId: class3A.id,
        subjectId: subject.id,
      },
    });
  }

  console.log("Seed data created successfully!");
  console.log(`- 2 students`);
  console.log(`- 1 class`);
  console.log(`- ${subjects.length} subjects`);
  console.log(`- ${subjects.length} subject assignments for Anvy`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
