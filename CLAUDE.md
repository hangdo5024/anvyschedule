# CLAUDE.md

## Project Overview

**AnvySchedule** is a web application for managing school schedules, student activities, and progress tracking for Vietnamese elementary school students. The UI is fully localized in Vietnamese.

- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui components
- **Database:** SQLite (dev) via Prisma ORM 5.22
- **Validation:** Zod 4.3

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint (next/core-web-vitals + next/typescript)
npm run db:migrate   # Run Prisma migrations (npx prisma migrate dev)
npm run db:reset     # Reset database (npx prisma migrate reset)
npm run db:seed      # Seed sample data (npx tsx prisma/seed.ts)
npm run db:studio    # Open Prisma Studio GUI
```

There is no test framework configured. No test commands exist.

## Environment Variables

Required in `.env`:

```
DATABASE_URL="file:./dev.db"   # SQLite for development
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages + API routes
│   ├── api/                      # RESTful API endpoints
│   │   ├── students/             # Student CRUD
│   │   ├── classes/              # Class CRUD + student enrollment
│   │   ├── subjects/             # Subject CRUD
│   │   ├── assignments/          # Subject-to-student assignment CRUD
│   │   ├── schedules/            # Schedule CRUD + timetable endpoint
│   │   ├── progress/             # Progress tracking + attachments
│   │   ├── reminders/            # Reminder CRUD + upcoming endpoint
│   │   ├── dashboard/            # Dashboard statistics
│   │   ├── history/              # Activity history
│   │   └── upload/               # File upload
│   ├── students/                 # Student pages (list, new, [id], [id]/edit)
│   ├── classes/                  # Class pages
│   ├── subjects/                 # Subject pages
│   ├── assignments/              # Assignment pages
│   ├── schedules/                # Schedule pages + timetable view
│   ├── progress/                 # Progress tracking page
│   ├── history/                  # Activity history page
│   ├── layout.tsx                # Root layout (LayoutShell wrapper)
│   ├── page.tsx                  # Dashboard homepage
│   └── globals.css               # Global CSS + Tailwind + CSS variables
├── components/
│   ├── ui/                       # shadcn/ui base components (button, card, dialog, etc.)
│   ├── layout/                   # Layout components (sidebar, header, notification-banner)
│   ├── dashboard/                # Dashboard widgets
│   ├── students/                 # Student feature components
│   ├── classes/                  # Class feature components
│   ├── subjects/                 # Subject feature components
│   ├── assignments/              # Assignment feature components
│   ├── schedules/                # Schedule + timetable components
│   ├── progress/                 # Progress tracking components
│   └── history/                  # History view components
├── hooks/
│   ├── use-reminders.ts          # Reminder polling + notification dispatch
│   └── use-notifications.ts      # Web Notifications API wrapper
└── lib/
    ├── prisma.ts                 # Prisma singleton instance
    ├── validations.ts            # Zod schemas + exported form types
    ├── constants.ts              # App constants (days, genders, grades, colors, statuses)
    └── utils.ts                  # cn() utility (clsx + tailwind-merge)
prisma/
├── schema.prisma                 # Database schema (8 models)
├── seed.ts                       # Sample data seeder
└── migrations/                   # Migration history
public/uploads/                   # User-uploaded files (local dev storage)
```

## Architecture Patterns

### Server vs Client Components

- **Pages** (`app/*/page.tsx`) are server components by default. They fetch data directly via Prisma and render tables/lists.
- **Forms and interactive components** use `"use client"` directive. They call API routes via `fetch()`.
- The root layout wraps everything in `LayoutShell` (client component) which provides sidebar navigation and header.

### API Routes

All API routes are in `src/app/api/` and follow RESTful conventions:

- `route.ts` files export `GET`, `POST`, `PUT`, `DELETE` functions
- Accept `NextRequest`, return `NextResponse.json()`
- Validate request bodies with Zod `.safeParse()` before processing
- Use HTTP status codes: 200 (OK), 201 (created), 400 (validation error), 404 (not found), 409 (conflict), 500 (server error)
- Check unique constraints before creating records (enrollments, assignments)

### Data Flow

1. Server component page fetches data via Prisma
2. User interacts with client component (form, button)
3. Client component calls API route via `fetch("/api/...")`
4. API route validates with Zod, performs Prisma operation
5. Client uses `router.push()` or `router.refresh()` to update UI

### Database

- **ORM:** Prisma with SQLite (dev). Schema at `prisma/schema.prisma`.
- **Models:** Student, Class, StudentClass (join), Subject, SubjectAssignment (join), Schedule, Progress, Attachment, Reminder
- **IDs:** CUID strings via `@default(cuid())`
- **Cascading deletes:** All foreign keys use `onDelete: Cascade`
- **Unique constraints:** StudentClass(studentId, classId), SubjectAssignment(studentId, classId, subjectId), Progress(scheduleId, date)

### Validation

All input validation uses Zod schemas defined in `src/lib/validations.ts`. Error messages are in Vietnamese. Schemas use:
- `z.coerce.number()` for numeric fields from form inputs
- `.nullish()` for optional fields
- `.min(1, "...")` for required strings

Exported types: `StudentFormData`, `ClassFormData`, `SubjectFormData`, `AssignmentFormData`, `ScheduleFormData`.

## Coding Conventions

### File Naming

- **Components:** kebab-case files (`student-form.tsx`, `delete-class-button.tsx`)
- **Hooks:** kebab-case with `use-` prefix (`use-reminders.ts`)
- **Utilities/lib:** kebab-case (`validations.ts`, `constants.ts`)
- **Pages:** `page.tsx` inside route folders (Next.js convention)
- **API routes:** `route.ts` inside API folders

### TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Interfaces for component props, Zod inference for form data types
- No `any` types; use proper typing

### Component Patterns

```typescript
// Functional components with typed props
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // implementation
}
```

- Named exports (not default exports) for components
- Forms use `useState` for field state + `isSubmitting` loading state
- Delete actions use separate button components with confirmation via `window.confirm()`
- shadcn/ui components in `src/components/ui/` use `forwardRef` and `class-variance-authority`

### Styling

- Tailwind CSS utility classes exclusively (no CSS modules)
- `cn()` helper from `src/lib/utils.ts` for conditional class merging
- CSS variables for theme colors (defined in `globals.css`)
- Mobile-first responsive design with Tailwind breakpoints

### Imports

Order: external packages first, then `@/` aliased imports. No relative imports outside of the same directory.

### Constants

App-wide constants (day names, genders, grade levels, subject colors, progress statuses) are defined in `src/lib/constants.ts` with Vietnamese labels. Always reference these instead of hardcoding values.

## Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/students` | List/create students |
| GET/PUT/DELETE | `/api/students/[id]` | Student detail operations |
| GET/POST | `/api/classes` | List/create classes |
| POST/DELETE | `/api/classes/[id]/students` | Enroll/remove students |
| GET/POST | `/api/subjects` | List/create subjects |
| GET/POST | `/api/assignments` | List/create subject assignments |
| GET/POST | `/api/schedules` | List/create schedules |
| GET | `/api/schedules/timetable` | Timetable calendar data |
| GET/POST | `/api/progress` | List/create progress records |
| POST/DELETE | `/api/progress/[id]/attachments` | Manage file attachments |
| GET/POST | `/api/reminders` | Manage reminders |
| GET | `/api/reminders/upcoming` | Get upcoming reminders for notifications |
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/history` | Activity history log |
| POST | `/api/upload` | File upload (local storage) |

## Localization

The application UI is entirely in Vietnamese. All user-facing strings (labels, error messages, placeholders, validation messages) must be in Vietnamese. Constants in `src/lib/constants.ts` use Vietnamese labels.
