# AnvySchedule - Hệ thống Quản lý Lịch học & Sinh hoạt cho Học sinh Tiểu học

## 1. Tổng quan

Hệ thống web giúp quản lý lịch học, sinh hoạt cho học sinh tiểu học với các chức năng:
khai báo học sinh/lớp, phân công môn học, lập lịch, xem thời khóa biểu, theo dõi tiến độ,
nhắc nhở và xem lịch sử.

---

## 2. Tech Stack

| Thành phần   | Công nghệ                          |
| ------------ | ---------------------------------- |
| Framework    | Next.js 14 (App Router)            |
| Ngôn ngữ     | TypeScript                         |
| UI Library   | Tailwind CSS + shadcn/ui           |
| Database     | SQLite (dev) / PostgreSQL (prod)   |
| ORM          | Prisma                             |
| Calendar     | @fullcalendar/react                |
| File Upload  | Local storage (dev) / S3 (prod)    |
| Notification | Web Push API + Service Worker      |
| State        | React Server Components + Zustand  |
| Validation   | Zod                                |

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│  Student     │       │  StudentClass    │       │   Class     │
│─────────────│       │──────────────────│       │─────────────│
│ id (PK)     │──┐    │ id (PK)          │   ┌──│ id (PK)     │
│ full_name   │  └───>│ student_id (FK)  │   │  │ name        │
│ date_of_birth│      │ class_id (FK)    │<──┘  │ grade_level │
│ gender      │       │ enrolled_at      │       │ academic_year│
│ avatar_url  │       │ UNIQUE(student,  │       │ description │
│ parent_name │       │        class)    │       │ created_at  │
│ parent_phone│       └──────────────────┘       │ updated_at  │
│ notes       │                                   └─────────────┘
│ created_at  │
│ updated_at  │
└─────────────┘
        │
        │       ┌──────────────────────────┐       ┌─────────────┐
        │       │  SubjectAssignment       │       │  Subject    │
        │       │──────────────────────────│       │─────────────│
        └──────>│ id (PK)                  │<──────│ id (PK)     │
                │ student_id (FK)          │       │ name        │
        ┌──────>│ class_id (FK)            │       │ description │
        │       │ subject_id (FK)          │       │ color       │
        │       │ UNIQUE(student, class,   │       │ icon        │
        │       │        subject)          │       │ created_at  │
        │       │ created_at               │       │ updated_at  │
        │       └──────────────────────────┘       └─────────────┘
        │                   │
        │                   │
        │       ┌───────────────────────────┐
        │       │  Schedule                 │
        │       │───────────────────────────│
        │       │ id (PK)                   │
        │       │ subject_assignment_id (FK)│
        │       │ day_of_week (0-6)         │
        │       │ start_time                │
        │       │ end_time                  │
        │       │ location                  │
        │       │ teacher_name              │
        │       │ recurrence (weekly|once)  │
        │       │ effective_from            │
        │       │ effective_until           │
        │       │ is_active                 │
        │       │ notes                     │
        │       │ created_at                │
        │       │ updated_at                │
        │       └───────────────────────────┘
        │                   │
        │                   ├──────────────────────┐
        │                   │                      │
        │       ┌───────────────────┐  ┌───────────────────┐
        │       │  Progress         │  │  Reminder         │
        │       │───────────────────│  │───────────────────│
        │       │ id (PK)           │  │ id (PK)           │
        │       │ schedule_id (FK)  │  │ schedule_id (FK)  │
        │       │ date              │  │ minutes_before    │
        │       │ status            │  │ is_enabled        │
        │       │ notes             │  │ created_at        │
        │       │ rating            │  │ updated_at        │
        │       │ created_at        │  └───────────────────┘
        │       │ updated_at        │
        │       └───────────────────┘
        │                   │
        │       ┌───────────────────┐
        │       │  Attachment       │
        │       │───────────────────│
        │       │ id (PK)           │
        │       │ progress_id (FK)  │
        │       │ type (image|file| │
        │       │   video_link)     │
        │       │ url               │
        │       │ file_name         │
        │       │ file_size         │
        │       │ created_at        │
        │       └───────────────────┘
```

### 3.2 Prisma Schema

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Student {
  id           String    @id @default(cuid())
  fullName     String
  dateOfBirth  DateTime?
  gender       String?   // "male" | "female"
  avatarUrl    String?
  parentName   String?
  parentPhone  String?
  notes        String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  classes      StudentClass[]
  assignments  SubjectAssignment[]
}

model Class {
  id           String    @id @default(cuid())
  name         String               // "3A", "4B"
  gradeLevel   Int                  // 1-5
  academicYear String               // "2025-2026"
  description  String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  students     StudentClass[]
  assignments  SubjectAssignment[]
}

model StudentClass {
  id         String   @id @default(cuid())
  studentId  String
  classId    String
  enrolledAt DateTime @default(now())

  student    Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  class      Class    @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@unique([studentId, classId])
}

model Subject {
  id          String   @id @default(cuid())
  name        String               // "Toán", "Tiếng Việt"
  description String?
  color       String   @default("#3B82F6")  // hex color cho calendar
  icon        String?              // icon name
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assignments SubjectAssignment[]
}

// KEY: (subject, student, class) - Phân công môn học
model SubjectAssignment {
  id        String   @id @default(cuid())
  studentId String
  classId   String
  subjectId String
  createdAt DateTime @default(now())

  student   Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  class     Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  subject   Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  schedules Schedule[]

  @@unique([studentId, classId, subjectId])
}

model Schedule {
  id                    String   @id @default(cuid())
  subjectAssignmentId   String
  dayOfWeek             Int      // 0=CN, 1=T2, 2=T3, ..., 6=T7
  startTime             String   // "07:30"
  endTime               String   // "08:15"
  location              String?
  teacherName           String?
  recurrence            String   @default("weekly") // "weekly" | "once"
  effectiveFrom         DateTime
  effectiveUntil        DateTime?
  isActive              Boolean  @default(true)
  notes                 String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  subjectAssignment     SubjectAssignment @relation(fields: [subjectAssignmentId], references: [id], onDelete: Cascade)
  progresses            Progress[]
  reminders             Reminder[]
}

model Progress {
  id          String   @id @default(cuid())
  scheduleId  String
  date        DateTime            // ngày cụ thể
  status      String   @default("pending") // "pending"|"completed"|"in_progress"|"missed"
  notes       String?
  rating      Int?     // 1-5 sao
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  schedule    Schedule    @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  attachments Attachment[]

  @@unique([scheduleId, date])
}

model Attachment {
  id         String   @id @default(cuid())
  progressId String
  type       String   // "image" | "file" | "video_link"
  url        String
  fileName   String?
  fileSize   Int?
  createdAt  DateTime @default(now())

  progress   Progress @relation(fields: [progressId], references: [id], onDelete: Cascade)
}

model Reminder {
  id            String   @id @default(cuid())
  scheduleId    String
  minutesBefore Int      @default(15) // nhắc trước bao nhiêu phút
  isEnabled     Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  schedule      Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
}
```

---

## 4. Cấu trúc thư mục

```
anvyschedule/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                  # Dữ liệu mẫu
│   └── migrations/
├── public/
│   ├── uploads/                 # File đính kèm (dev)
│   └── sw.js                   # Service worker cho notification
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Dashboard
│   │   ├── globals.css
│   │   ├── students/
│   │   │   ├── page.tsx         # Danh sách học sinh
│   │   │   ├── new/page.tsx     # Thêm học sinh
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Chi tiết học sinh
│   │   │       └── edit/page.tsx
│   │   ├── classes/
│   │   │   ├── page.tsx         # Danh sách lớp
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Chi tiết lớp + danh sách HS
│   │   │       └── edit/page.tsx
│   │   ├── subjects/
│   │   │   ├── page.tsx         # Danh sách môn học
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── assignments/
│   │   │   └── page.tsx         # Phân công môn học cho HS+Lớp
│   │   ├── schedules/
│   │   │   ├── page.tsx         # Quản lý lịch học
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/edit/page.tsx
│   │   │   └── timetable/
│   │   │       └── page.tsx     # Thời khóa biểu (tuần/ngày)
│   │   ├── progress/
│   │   │   ├── page.tsx         # Cập nhật tiến độ
│   │   │   └── [id]/page.tsx    # Chi tiết tiến độ + đính kèm
│   │   ├── history/
│   │   │   └── page.tsx         # Xem lịch sử
│   │   └── api/
│   │       ├── students/
│   │       │   ├── route.ts     # GET (list), POST (create)
│   │       │   └── [id]/route.ts # GET, PUT, DELETE
│   │       ├── classes/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── students/route.ts  # Quản lý HS trong lớp
│   │       ├── subjects/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── assignments/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── schedules/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── timetable/route.ts  # GET timetable theo filter
│   │       ├── progress/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── attachments/route.ts  # Upload file
│   │       ├── history/route.ts
│   │       ├── reminders/
│   │       │   └── route.ts
│   │       └── upload/route.ts          # File upload endpoint
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── nav-links.tsx
│   │   ├── students/
│   │   │   ├── student-form.tsx
│   │   │   ├── student-list.tsx
│   │   │   └── student-card.tsx
│   │   ├── classes/
│   │   │   ├── class-form.tsx
│   │   │   └── class-list.tsx
│   │   ├── subjects/
│   │   │   ├── subject-form.tsx
│   │   │   └── subject-badge.tsx
│   │   ├── schedules/
│   │   │   ├── schedule-form.tsx
│   │   │   ├── timetable-week.tsx   # Bảng TKB tuần
│   │   │   ├── timetable-day.tsx    # Bảng TKB ngày
│   │   │   └── schedule-card.tsx
│   │   ├── progress/
│   │   │   ├── progress-form.tsx
│   │   │   ├── progress-card.tsx
│   │   │   └── attachment-upload.tsx
│   │   ├── dashboard/
│   │   │   ├── today-schedule.tsx
│   │   │   ├── week-overview.tsx
│   │   │   ├── task-summary.tsx
│   │   │   └── stats-cards.tsx
│   │   └── common/
│   │       ├── data-table.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── date-picker.tsx
│   │       └── file-upload.tsx
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── utils.ts             # Utility functions
│   │   ├── validations.ts       # Zod schemas
│   │   └── constants.ts         # Hằng số (ngày tuần, trạng thái...)
│   ├── hooks/
│   │   ├── use-reminders.ts     # Hook quản lý nhắc nhở
│   │   └── use-notifications.ts # Hook Web Push
│   └── types/
│       └── index.ts             # TypeScript types
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 5. API Design

### 5.1 Students (Học sinh)

| Method | Endpoint              | Mô tả                    |
| ------ | --------------------- | ------------------------- |
| GET    | /api/students         | Danh sách học sinh        |
| POST   | /api/students         | Thêm học sinh             |
| GET    | /api/students/:id     | Chi tiết học sinh         |
| PUT    | /api/students/:id     | Cập nhật học sinh         |
| DELETE | /api/students/:id     | Xóa học sinh              |

### 5.2 Classes (Lớp học)

| Method | Endpoint                      | Mô tả                     |
| ------ | ----------------------------- | -------------------------- |
| GET    | /api/classes                  | Danh sách lớp              |
| POST   | /api/classes                  | Thêm lớp                  |
| GET    | /api/classes/:id              | Chi tiết lớp               |
| PUT    | /api/classes/:id              | Cập nhật lớp               |
| DELETE | /api/classes/:id              | Xóa lớp                   |
| POST   | /api/classes/:id/students     | Thêm học sinh vào lớp      |
| DELETE | /api/classes/:id/students/:sid| Xóa học sinh khỏi lớp      |

### 5.3 Subjects (Môn học)

| Method | Endpoint              | Mô tả                    |
| ------ | --------------------- | ------------------------- |
| GET    | /api/subjects         | Danh sách môn học         |
| POST   | /api/subjects         | Thêm môn học              |
| PUT    | /api/subjects/:id     | Cập nhật môn học          |
| DELETE | /api/subjects/:id     | Xóa môn học               |

### 5.4 SubjectAssignment (Phân công môn - KEY: student+class+subject)

| Method | Endpoint               | Mô tả                              |
| ------ | ---------------------- | ----------------------------------- |
| GET    | /api/assignments       | DS phân công (filter: student, class)|
| POST   | /api/assignments       | Phân công môn cho HS+Lớp            |
| DELETE | /api/assignments/:id   | Xóa phân công                       |

**POST /api/assignments body:**
```json
{
  "studentId": "abc123",
  "classId": "class456",
  "subjectId": "subj789"
}
```

### 5.5 Schedules (Lịch học)

| Method | Endpoint                    | Mô tả                              |
| ------ | --------------------------- | ----------------------------------- |
| GET    | /api/schedules              | DS lịch (filter: student, class)    |
| POST   | /api/schedules              | Tạo lịch học                        |
| PUT    | /api/schedules/:id          | Cập nhật lịch                       |
| DELETE | /api/schedules/:id          | Xóa lịch                            |
| GET    | /api/schedules/timetable    | Lấy TKB (query: studentId, week)    |

**POST /api/schedules body:**
```json
{
  "subjectAssignmentId": "assign123",
  "dayOfWeek": 1,
  "startTime": "07:30",
  "endTime": "08:15",
  "location": "Phòng 3A",
  "teacherName": "Cô Hoa",
  "recurrence": "weekly",
  "effectiveFrom": "2025-09-01",
  "effectiveUntil": "2026-05-31"
}
```

**GET /api/schedules/timetable query:**
```
?studentId=abc123&classId=class456&weekStart=2025-09-15
```

**Response:**
```json
{
  "student": { "id": "abc123", "fullName": "Nguyễn Văn A" },
  "class": { "id": "class456", "name": "3A" },
  "weekStart": "2025-09-15",
  "timetable": {
    "monday": [
      {
        "id": "sch1",
        "subject": { "name": "Toán", "color": "#3B82F6" },
        "startTime": "07:30",
        "endTime": "08:15",
        "teacherName": "Cô Hoa",
        "location": "Phòng 3A",
        "progress": { "status": "completed", "rating": 4 }
      }
    ],
    "tuesday": [...],
    ...
  }
}
```

### 5.6 Progress (Tiến độ)

| Method | Endpoint                            | Mô tả                     |
| ------ | ----------------------------------- | -------------------------- |
| GET    | /api/progress                       | DS tiến độ (filter: date)  |
| POST   | /api/progress                       | Tạo/cập nhật tiến độ      |
| PUT    | /api/progress/:id                   | Cập nhật tiến độ           |
| POST   | /api/progress/:id/attachments       | Upload đính kèm           |
| DELETE | /api/progress/:id/attachments/:aid  | Xóa đính kèm              |

**POST /api/progress body:**
```json
{
  "scheduleId": "sch123",
  "date": "2025-09-15",
  "status": "completed",
  "notes": "Bé làm bài tốt, hoàn thành 10/10 bài tập",
  "rating": 5
}
```

### 5.7 History (Lịch sử)

| Method | Endpoint        | Mô tả                                    |
| ------ | --------------- | ----------------------------------------- |
| GET    | /api/history    | Lịch sử (filter: studentId, from, to)    |

### 5.8 Reminders (Nhắc nhở)

| Method | Endpoint             | Mô tả                    |
| ------ | -------------------- | ------------------------- |
| GET    | /api/reminders       | DS nhắc nhở              |
| POST   | /api/reminders       | Tạo nhắc nhở             |
| PUT    | /api/reminders/:id   | Cập nhật nhắc nhở        |
| DELETE | /api/reminders/:id   | Xóa nhắc nhở             |

### 5.9 Dashboard

| Method | Endpoint             | Mô tả                                        |
| ------ | -------------------- | --------------------------------------------- |
| GET    | /api/dashboard       | Tổng hợp: lịch hôm nay, tuần, thống kê       |

**GET /api/dashboard query:**
```
?studentId=abc123&date=2025-09-15
```

**Response:**
```json
{
  "today": {
    "date": "2025-09-15",
    "totalSchedules": 6,
    "completed": 3,
    "inProgress": 1,
    "pending": 2,
    "missed": 0,
    "schedules": [...]
  },
  "week": {
    "weekStart": "2025-09-15",
    "weekEnd": "2025-09-21",
    "totalSchedules": 30,
    "completed": 15,
    "completionRate": 50
  },
  "upcomingReminders": [...]
}
```

---

## 6. Thiết kế UI / Wireframes

### 6.1 Layout chung

```
┌──────────────────────────────────────────────────────┐
│  🎒 AnvySchedule           [Chọn học sinh ▼]  [👤]  │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  📊 Dashboard   │                                    │
│  👦 Học sinh    │         MAIN CONTENT               │
│  🏫 Lớp học    │                                     │
│  📚 Môn học    │                                     │
│  📋 Phân công  │                                     │
│  📅 Lịch học   │                                     │
│  ├─ Thời khóa  │                                    │
│  📈 Tiến độ    │                                     │
│  🕐 Lịch sử   │                                     │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  © AnvySchedule 2025                                 │
└──────────────────────────────────────────────────────┘
```

### 6.2 Dashboard

```
┌─────────────────────────────────────────────────────┐
│  Dashboard - Nguyễn Văn Anvy - Lớp 3A              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Hôm nay  │ │ Đã xong  │ │ Còn lại  │ │ Bỏ lỡ  │ │
│  │    6      │ │    3     │ │    2     │ │   1    │ │
│  │  tiết    │ │  tiết    │ │  tiết    │ │  tiết  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│  Lịch hôm nay (Thứ 2, 15/09/2025)                  │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✅ 07:30-08:15  Toán       Cô Hoa  ⭐⭐⭐⭐⭐ │    │
│  │ ✅ 08:20-09:05  Tiếng Việt Cô Mai  ⭐⭐⭐⭐  │    │
│  │ ✅ 09:20-10:05  Anh Văn    Thầy Nam ⭐⭐⭐   │    │
│  │ 🔄 10:10-10:55  Mỹ Thuật  Cô Lan          │    │
│  │ ⏳ 13:30-14:15  Thể dục   Thầy Bình       │    │
│  │ ⏳ 14:20-15:05  Đạo đức   Cô Hương        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Tổng quan tuần                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  T2 ████████░░  80%                         │    │
│  │  T3 ██████░░░░  60%                         │    │
│  │  T4 ░░░░░░░░░░   0%  (chưa đến)            │    │
│  │  T5 ░░░░░░░░░░   0%                         │    │
│  │  T6 ░░░░░░░░░░   0%                         │    │
│  │  T7 ░░░░░░░░░░   0%                         │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 6.3 Thời khóa biểu tuần

```
┌──────────────────────────────────────────────────────────────┐
│  Thời khóa biểu    [◀ Tuần trước]  15-21/09/2025  [Tuần sau ▶] │
│  [Xem tuần]  [Xem ngày]    Học sinh: [Anvy ▼]  Lớp: [3A ▼]  │
├──────────┬────────┬────────┬────────┬────────┬────────┬──────┤
│ Giờ      │ Thứ 2  │ Thứ 3  │ Thứ 4  │ Thứ 5  │ Thứ 6  │ T7  │
├──────────┼────────┼────────┼────────┼────────┼────────┼──────┤
│ 07:30    │░░Toán░░│Tiếng V │░░Toán░░│Tiếng V │░░Toán░░│      │
│ 08:15    │░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│      │
├──────────┼────────┼────────┼────────┼────────┼────────┼──────┤
│ 08:20    │Tiếng V │Anh Văn │Tiếng V │░░Toán░░│Tiếng V │      │
│ 09:05    │░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│      │
├──────────┼────────┼────────┼────────┼────────┼────────┼──────┤
│ 09:20    │Anh Văn │TNXH   │Anh Văn │TNXH   │Mỹ Thuật│      │
│ 10:05    │░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│      │
├──────────┼────────┼────────┼────────┼────────┼────────┼──────┤
│ 10:10    │Mỹ Thuật│Âm nhạc │Thể dục │Tin học │Đạo đức │      │
│ 10:55    │░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│░░░░░░░░│      │
├──────────┼────────┼────────┼────────┼────────┼────────┼──────┤
│ 13:30    │Thể dục │        │        │Âm nhạc │        │Piano │
│ 14:15    │░░░░░░░░│        │        │░░░░░░░░│        │░░░░░░│
├──────────┼────────┼────────┼────────┼────────┼────────┼──────┤
│ 14:20    │Đạo đức │        │        │        │        │      │
│ 15:05    │░░░░░░░░│        │        │        │        │      │
└──────────┴────────┴────────┴────────┴────────┴────────┴──────┘

Mỗi ô hiển thị: tên môn (màu theo subject.color), trạng thái (icon)
Click vào ô → mở chi tiết + cập nhật tiến độ
```

### 6.4 Form khai báo lịch học

```
┌──────────────────────────────────────────┐
│  Thêm lịch học                           │
├──────────────────────────────────────────┤
│                                          │
│  Học sinh:   [Chọn học sinh      ▼]      │
│  Lớp:        [Chọn lớp          ▼]      │
│  Môn học:    [Chọn môn học       ▼]      │
│                                          │
│  ─── Thông tin lịch ───                  │
│                                          │
│  Thứ:        [Thứ 2             ▼]      │
│  Giờ bắt đầu: [07:30]                   │
│  Giờ kết thúc: [08:15]                   │
│  Địa điểm:    [Phòng 3A          ]      │
│  Giáo viên:   [Cô Hoa            ]      │
│  Lặp lại:    [Hàng tuần         ▼]      │
│  Từ ngày:    [01/09/2025]                │
│  Đến ngày:   [31/05/2026]                │
│  Ghi chú:    [                   ]       │
│                                          │
│  ─── Nhắc nhở ───                        │
│  [✓] Nhắc trước [15] phút               │
│                                          │
│         [Hủy]  [Lưu lịch học]            │
└──────────────────────────────────────────┘
```

### 6.5 Cập nhật tiến độ

```
┌──────────────────────────────────────────────┐
│  Cập nhật tiến độ                            │
│  Toán - Thứ 2, 15/09/2025 - 07:30-08:15     │
│  Học sinh: Nguyễn Văn Anvy - Lớp 3A         │
├──────────────────────────────────────────────┤
│                                              │
│  Trạng thái:                                 │
│  [● Hoàn thành] [○ Đang học] [○ Bỏ lỡ]     │
│                                              │
│  Đánh giá:  ⭐⭐⭐⭐☆  (4/5)                 │
│                                              │
│  Ghi chú:                                   │
│  ┌────────────────────────────────────────┐  │
│  │ Bé hoàn thành tốt bài tập phép cộng   │  │
│  │ trong phạm vi 1000. Cần luyện thêm    │  │
│  │ phép trừ có nhớ.                       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Đính kèm:                                  │
│  ┌────────────────────────────────────────┐  │
│  │  📷 bai_tap_toan.jpg     [Xóa]        │  │
│  │  📄 ket_qua.pdf          [Xóa]        │  │
│  │  🎥 https://youtube/...  [Xóa]        │  │
│  │                                        │  │
│  │  [+ Thêm ảnh] [+ Thêm file] [+ Link]  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│           [Hủy]    [Lưu tiến độ]             │
└──────────────────────────────────────────────┘
```

### 6.6 Xem lịch sử

```
┌─────────────────────────────────────────────────────┐
│  Lịch sử học tập                                    │
│  Học sinh: [Anvy ▼]  Từ: [01/09] Đến: [15/09]      │
│  Lớp: [3A ▼]  Môn: [Tất cả ▼]  Trạng thái: [▼]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  15/09/2025 - Thứ 2                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ ✅ 07:30 Toán      Cô Hoa   ⭐⭐⭐⭐⭐  📎3      │ │
│  │    "Hoàn thành xuất sắc bài kiểm tra"         │ │
│  │ ✅ 08:20 Tiếng Việt Cô Mai  ⭐⭐⭐⭐   📎1      │ │
│  │    "Đọc diễn cảm tốt"                         │ │
│  │ ❌ 13:30 Thể dục   Thầy Bình                  │ │
│  │    "Nghỉ ốm"                                   │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  12/09/2025 - Thứ 6                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ ✅ 07:30 Toán      Cô Hoa   ⭐⭐⭐⭐   📎2      │ │
│  │ ...                                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  [Trang 1/5]  [◀] [1] [2] [3] [4] [5] [▶]         │
└─────────────────────────────────────────────────────┘
```

---

## 7. Luồng xử lý chính (Flows)

### 7.1 Flow: Khai báo ban đầu

```
Tạo Lớp học → Tạo Học sinh → Gán HS vào Lớp
     → Tạo Môn học → Phân công Môn cho (HS + Lớp)
          → Tạo Lịch học cho từng phân công
```

### 7.2 Flow: Xem thời khóa biểu

```
Chọn Học sinh + Lớp + Tuần
  → GET /api/schedules/timetable?studentId=...&classId=...&weekStart=...
  → Render bảng TKB với FullCalendar hoặc custom grid
  → Mỗi ô hiển thị: môn (màu), giờ, GV, trạng thái tiến độ
  → Click ô → Popup cập nhật tiến độ
```

### 7.3 Flow: Nhắc nhở

```
Client load → Register Service Worker
  → Mỗi phút kiểm tra lịch sắp tới
  → So sánh current time vs schedule.startTime - reminder.minutesBefore
  → Nếu match → Push browser notification
  → Click notification → Mở trang cập nhật tiến độ
```

### 7.4 Flow: Cập nhật tiến độ

```
Chọn tiết học (từ Dashboard/TKB)
  → Hiển thị form Progress
  → Chọn trạng thái + đánh giá sao + ghi chú
  → Upload ảnh/file hoặc thêm link video
  → POST /api/progress (upsert theo scheduleId + date)
  → Cập nhật trạng thái trên Dashboard/TKB
```

---

## 8. Nhắc nhở (Notification System)

### Cơ chế

1. **Service Worker** đăng ký khi app load
2. **Client-side timer** (setInterval mỗi 60s) kiểm tra lịch sắp tới
3. So sánh thời gian hiện tại với `schedule.startTime - reminder.minutesBefore`
4. Gửi browser notification qua `Notification API`
5. Lưu trạng thái đã nhắc vào localStorage để tránh nhắc lặp

```typescript
// Pseudo-code
async function checkReminders() {
  const now = new Date();
  const schedules = await fetch('/api/schedules/timetable?date=today');

  for (const schedule of schedules) {
    for (const reminder of schedule.reminders) {
      const remindAt = subMinutes(schedule.startTime, reminder.minutesBefore);
      const alreadyNotified = localStorage.getItem(`notified-${schedule.id}-${today}`);

      if (now >= remindAt && now < schedule.startTime && !alreadyNotified) {
        new Notification(`${schedule.subject.name} sắp bắt đầu!`, {
          body: `${schedule.startTime} - ${schedule.teacherName} - ${schedule.location}`,
          icon: '/icon.png'
        });
        localStorage.setItem(`notified-${schedule.id}-${today}`, 'true');
      }
    }
  }
}

setInterval(checkReminders, 60_000);
```

---

## 9. Seed Data (Dữ liệu mẫu)

```
Lớp: 3A (Khối 3, 2025-2026)
Học sinh: Nguyễn Văn Anvy

Môn học:
  - Toán (màu xanh dương)
  - Tiếng Việt (màu đỏ)
  - Tiếng Anh (màu tím)
  - Tự nhiên & Xã hội (màu xanh lá)
  - Mỹ Thuật (màu cam)
  - Âm nhạc (màu hồng)
  - Thể dục (màu vàng)
  - Tin học (màu xám)
  - Đạo đức (màu nâu)

Lịch mẫu: TKB chuẩn lớp 3 (sáng 4 tiết, chiều 1-2 tiết, T2-T6)
```

---

## 10. Phân giai đoạn phát triển

### Giai đoạn 1 - Nền tảng (Core)
- [x] Thiết kế database schema
- [ ] Setup Next.js + Prisma + Tailwind + shadcn/ui
- [ ] CRUD Học sinh
- [ ] CRUD Lớp học + gán HS vào lớp
- [ ] CRUD Môn học
- [ ] Phân công môn cho (HS + Lớp)

### Giai đoạn 2 - Lịch học
- [ ] CRUD Lịch học
- [ ] Thời khóa biểu tuần (bảng grid)
- [ ] Thời khóa biểu ngày
- [ ] Filter theo HS, Lớp

### Giai đoạn 3 - Tiến độ & Dashboard
- [ ] Dashboard tổng quan
- [ ] Cập nhật tiến độ (status, rating, notes)
- [ ] Upload ảnh, file đính kèm
- [ ] Thêm link video
- [ ] Thống kê hoàn thành theo ngày/tuần

### Giai đoạn 4 - Nhắc nhở & Lịch sử
- [ ] Service Worker + Notification API
- [ ] Cấu hình nhắc nhở cho từng lịch
- [ ] Xem lịch sử với filter & phân trang
- [ ] Export lịch sử (tùy chọn)
