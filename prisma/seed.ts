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
  const [toan, tiengViet, tiengAnh, tnxh, myThuat, amNhac, theDuc, tinHoc, daoDuc] =
    await Promise.all([
      prisma.subject.create({ data: { name: "Toán", color: "#3B82F6", description: "Toán học" } }),
      prisma.subject.create({ data: { name: "Tiếng Việt", color: "#EF4444", description: "Tiếng Việt" } }),
      prisma.subject.create({ data: { name: "Tiếng Anh", color: "#8B5CF6", description: "Tiếng Anh" } }),
      prisma.subject.create({ data: { name: "Tự nhiên & Xã hội", color: "#10B981", description: "TNXH" } }),
      prisma.subject.create({ data: { name: "Mỹ Thuật", color: "#F97316", description: "Mỹ thuật" } }),
      prisma.subject.create({ data: { name: "Âm nhạc", color: "#EC4899", description: "Âm nhạc" } }),
      prisma.subject.create({ data: { name: "Thể dục", color: "#EAB308", description: "Thể dục" } }),
      prisma.subject.create({ data: { name: "Tin học", color: "#6B7280", description: "Tin học" } }),
      prisma.subject.create({ data: { name: "Đạo đức", color: "#92400E", description: "Đạo đức" } }),
    ]);

  const subjects = [toan, tiengViet, tiengAnh, tnxh, myThuat, amNhac, theDuc, tinHoc, daoDuc];

  // Assign all subjects to Anvy in class 3A
  const assignmentMap: Record<string, string> = {};
  for (const subject of subjects) {
    const assignment = await prisma.subjectAssignment.create({
      data: {
        studentId: anvy.id,
        classId: class3A.id,
        subjectId: subject.id,
      },
    });
    assignmentMap[subject.name] = assignment.id;
  }

  // Create schedules for Anvy - typical grade 3 timetable
  // dayOfWeek: 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7
  const effectiveFrom = new Date("2025-09-01");
  const effectiveUntil = new Date("2026-05-31");

  const scheduleData = [
    // Thứ 2
    { assignmentKey: "Toán", dayOfWeek: 1, startTime: "07:30", endTime: "08:15", teacherName: "Cô Hoa", location: "Phòng 3A" },
    { assignmentKey: "Tiếng Việt", dayOfWeek: 1, startTime: "08:20", endTime: "09:05", teacherName: "Cô Mai", location: "Phòng 3A" },
    { assignmentKey: "Tiếng Anh", dayOfWeek: 1, startTime: "09:20", endTime: "10:05", teacherName: "Thầy Nam", location: "Phòng 3A" },
    { assignmentKey: "Mỹ Thuật", dayOfWeek: 1, startTime: "10:10", endTime: "10:55", teacherName: "Cô Lan", location: "Phòng Mỹ thuật" },
    { assignmentKey: "Thể dục", dayOfWeek: 1, startTime: "13:30", endTime: "14:15", teacherName: "Thầy Bình", location: "Sân trường" },
    { assignmentKey: "Đạo đức", dayOfWeek: 1, startTime: "14:20", endTime: "15:05", teacherName: "Cô Hương", location: "Phòng 3A" },

    // Thứ 3
    { assignmentKey: "Tiếng Việt", dayOfWeek: 2, startTime: "07:30", endTime: "08:15", teacherName: "Cô Mai", location: "Phòng 3A" },
    { assignmentKey: "Tiếng Anh", dayOfWeek: 2, startTime: "08:20", endTime: "09:05", teacherName: "Thầy Nam", location: "Phòng 3A" },
    { assignmentKey: "Tự nhiên & Xã hội", dayOfWeek: 2, startTime: "09:20", endTime: "10:05", teacherName: "Cô Hoa", location: "Phòng 3A" },
    { assignmentKey: "Âm nhạc", dayOfWeek: 2, startTime: "10:10", endTime: "10:55", teacherName: "Thầy Dũng", location: "Phòng Âm nhạc" },

    // Thứ 4
    { assignmentKey: "Toán", dayOfWeek: 3, startTime: "07:30", endTime: "08:15", teacherName: "Cô Hoa", location: "Phòng 3A" },
    { assignmentKey: "Tiếng Việt", dayOfWeek: 3, startTime: "08:20", endTime: "09:05", teacherName: "Cô Mai", location: "Phòng 3A" },
    { assignmentKey: "Tiếng Anh", dayOfWeek: 3, startTime: "09:20", endTime: "10:05", teacherName: "Thầy Nam", location: "Phòng 3A" },
    { assignmentKey: "Thể dục", dayOfWeek: 3, startTime: "10:10", endTime: "10:55", teacherName: "Thầy Bình", location: "Sân trường" },

    // Thứ 5
    { assignmentKey: "Tiếng Việt", dayOfWeek: 4, startTime: "07:30", endTime: "08:15", teacherName: "Cô Mai", location: "Phòng 3A" },
    { assignmentKey: "Toán", dayOfWeek: 4, startTime: "08:20", endTime: "09:05", teacherName: "Cô Hoa", location: "Phòng 3A" },
    { assignmentKey: "Tự nhiên & Xã hội", dayOfWeek: 4, startTime: "09:20", endTime: "10:05", teacherName: "Cô Hoa", location: "Phòng 3A" },
    { assignmentKey: "Tin học", dayOfWeek: 4, startTime: "10:10", endTime: "10:55", teacherName: "Thầy Tuấn", location: "Phòng Tin học" },
    { assignmentKey: "Âm nhạc", dayOfWeek: 4, startTime: "13:30", endTime: "14:15", teacherName: "Thầy Dũng", location: "Phòng Âm nhạc" },

    // Thứ 6
    { assignmentKey: "Toán", dayOfWeek: 5, startTime: "07:30", endTime: "08:15", teacherName: "Cô Hoa", location: "Phòng 3A" },
    { assignmentKey: "Tiếng Việt", dayOfWeek: 5, startTime: "08:20", endTime: "09:05", teacherName: "Cô Mai", location: "Phòng 3A" },
    { assignmentKey: "Mỹ Thuật", dayOfWeek: 5, startTime: "09:20", endTime: "10:05", teacherName: "Cô Lan", location: "Phòng Mỹ thuật" },
    { assignmentKey: "Đạo đức", dayOfWeek: 5, startTime: "10:10", endTime: "10:55", teacherName: "Cô Hương", location: "Phòng 3A" },
  ];

  let scheduleCount = 0;
  for (const s of scheduleData) {
    await prisma.schedule.create({
      data: {
        subjectAssignmentId: assignmentMap[s.assignmentKey],
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        teacherName: s.teacherName,
        location: s.location,
        recurrence: "weekly",
        effectiveFrom,
        effectiveUntil,
        isActive: true,
      },
    });
    scheduleCount++;
  }

  console.log("Seed data created successfully!");
  console.log(`- 2 students (Anvy, Mai)`);
  console.log(`- 1 class (3A)`);
  console.log(`- ${subjects.length} subjects`);
  console.log(`- ${subjects.length} subject assignments for Anvy`);
  console.log(`- ${scheduleCount} schedule entries (T2-T6 timetable)`);
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
