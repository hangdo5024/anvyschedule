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
  await prisma.subjectGroup.deleteMany();

  // Create subject groups
  const [khoaHoc, ngonNgu, nghethuat, theChat, xaHoi] = await Promise.all([
    prisma.subjectGroup.create({ data: { name: "Khoa học", color: "#3B82F6" } }),
    prisma.subjectGroup.create({ data: { name: "Ngôn ngữ", color: "#EF4444" } }),
    prisma.subjectGroup.create({ data: { name: "Nghệ thuật", color: "#F97316" } }),
    prisma.subjectGroup.create({ data: { name: "Thể chất & Sức khỏe", color: "#EAB308" } }),
    prisma.subjectGroup.create({ data: { name: "Xã hội & Đạo đức", color: "#10B981" } }),
  ]);

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
      ageMin: 8,
      ageMax: 9,
    },
  });

  // Enroll students
  await prisma.studentClass.createMany({
    data: [
      { studentId: anvy.id, classId: class3A.id },
      { studentId: mai.id, classId: class3A.id },
    ],
  });

  // Create subjects with groups
  const [toan, tiengViet, tiengAnh, tnxh, myThuat, amNhac, theDuc, tinHoc, daoDuc] =
    await Promise.all([
      prisma.subject.create({ data: { name: "Toán", color: "#3B82F6", description: "Toán học", level: 2, ageMin: 6, ageMax: 11, subjectGroupId: khoaHoc.id } }),
      prisma.subject.create({ data: { name: "Tiếng Việt", color: "#EF4444", description: "Tiếng Việt", level: 2, ageMin: 6, ageMax: 11, subjectGroupId: ngonNgu.id } }),
      prisma.subject.create({ data: { name: "Tiếng Anh", color: "#8B5CF6", description: "Tiếng Anh", level: 3, ageMin: 7, ageMax: 11, subjectGroupId: ngonNgu.id } }),
      prisma.subject.create({ data: { name: "Tự nhiên & Xã hội", color: "#10B981", description: "TNXH", level: 1, ageMin: 6, ageMax: 9, subjectGroupId: khoaHoc.id } }),
      prisma.subject.create({ data: { name: "Mỹ Thuật", color: "#F97316", description: "Mỹ thuật", level: 1, ageMin: 6, ageMax: 11, subjectGroupId: nghethuat.id } }),
      prisma.subject.create({ data: { name: "Âm nhạc", color: "#EC4899", description: "Âm nhạc", level: 1, ageMin: 6, ageMax: 11, subjectGroupId: nghethuat.id } }),
      prisma.subject.create({ data: { name: "Thể dục", color: "#EAB308", description: "Thể dục", level: 1, ageMin: 6, ageMax: 11, subjectGroupId: theChat.id } }),
      prisma.subject.create({ data: { name: "Tin học", color: "#6B7280", description: "Tin học", level: 2, ageMin: 8, ageMax: 11, subjectGroupId: khoaHoc.id } }),
      prisma.subject.create({ data: { name: "Đạo đức", color: "#92400E", description: "Đạo đức", level: 1, ageMin: 6, ageMax: 11, subjectGroupId: xaHoi.id } }),
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

  const createdSchedules: { id: string; dayOfWeek: number; startTime: string; subjectName: string }[] = [];
  for (const s of scheduleData) {
    const schedule = await prisma.schedule.create({
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
    createdSchedules.push({
      id: schedule.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      subjectName: s.assignmentKey,
    });
  }

  // Create reminders for all schedules (15 minutes before)
  let reminderCount = 0;
  for (const sch of createdSchedules) {
    await prisma.reminder.create({
      data: {
        scheduleId: sch.id,
        minutesBefore: 15,
        isEnabled: true,
      },
    });
    reminderCount++;
  }

  // Create some sample progress records for last week
  const today = new Date();
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7);

  let progressCount = 0;
  const statuses = ["completed", "completed", "completed", "in_progress", "missed"];
  const ratings = [5, 4, 4, 3, null];
  const sampleNotes = [
    "Bé hoàn thành tốt bài tập",
    "Đọc diễn cảm tốt, cần luyện thêm viết",
    "Hoàn thành bài kiểm tra 9/10",
    "Đang làm bài tập về nhà",
    "Nghỉ ốm",
  ];

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const progressDate = new Date(lastMonday);
    progressDate.setDate(lastMonday.getDate() + dayOffset);
    const dayOfWeek = dayOffset + 1; // 1=T2, 2=T3, ...

    const daySchedules = createdSchedules.filter((s) => s.dayOfWeek === dayOfWeek);
    for (let i = 0; i < daySchedules.length; i++) {
      const statusIdx = (dayOffset + i) % statuses.length;
      await prisma.progress.create({
        data: {
          scheduleId: daySchedules[i].id,
          date: progressDate,
          status: statuses[statusIdx],
          rating: ratings[statusIdx],
          notes: sampleNotes[statusIdx],
        },
      });
      progressCount++;
    }
  }

  console.log("Seed data created successfully!");
  console.log(`- 5 subject groups`);
  console.log(`- 2 students (Anvy, Mai)`);
  console.log(`- 1 class (3A)`);
  console.log(`- ${subjects.length} subjects`);
  console.log(`- ${subjects.length} subject assignments for Anvy`);
  console.log(`- ${createdSchedules.length} schedule entries (T2-T6 timetable)`);
  console.log(`- ${reminderCount} reminders`);
  console.log(`- ${progressCount} progress records (last week)`);
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
