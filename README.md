<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=38&duration=2800&pause=900&color=2563EB&center=true&vCenter=true&width=900&lines=CampusFlow;Smart+Campus+Management+Platform;One+Campus.+One+Flow.+One+Dashboard."
alt="CampusFlow animated title" />

<p>🎓 A full-stack campus management platform for academics, attendance, facilities, bookings and role-based administration.</p>

<p>
  <a href="https://github.com/Somnath-Sarkar008/campusflow"><img src="https://img.shields.io/github/stars/Somnath-Sarkar008/campusflow?style=for-the-badge" alt="GitHub stars" /></a>
  <a href="https://github.com/Somnath-Sarkar008/campusflow"><img src="https://img.shields.io/github/forks/Somnath-Sarkar008/campusflow?style=for-the-badge" alt="GitHub forks" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-Ready-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
</p>

<p>
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#deployment">Deployment</a>
</p>

</div>

---

## ✨ What is CampusFlow?

**CampusFlow** is a centralized campus management system designed to bring everyday academic and operational workflows into one modern platform.

Instead of treating attendance, room/resource management, bookings and academic information as separate systems, CampusFlow connects them through a single role-aware backend and dashboard experience.

> **Built as an industry-style full-stack project with a modular NestJS API, PostgreSQL + Prisma data layer, JWT authentication and a Next.js frontend.**

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Supported roles: Student, Faculty, Technician, Security, Admin and Super Admin
- Protected API routes

### 🎓 Academic Management
- Departments and courses
- Subjects and semester organization
- Student profiles
- Enrollment tracking
- Academic-year support

### 📊 Attendance
- Attendance sessions by subject
- Present / absent / late / excused states
- Student attendance records
- Attendance history and dashboard-ready data

### 🏢 Facilities & Resources
- Building and floor hierarchy
- Room management
- Classroom, lab, seminar hall and auditorium support
- Resource inventory
- Resource availability and maintenance states

### 📅 Smart Bookings
- Resource booking workflow
- Pending / approved / rejected / cancelled / completed states
- Booking ownership
- Time-based booking records
- Conflict-aware data model

### 📈 Dashboard
- Centralized campus information
- Role-aware application modules
- API-driven data for scalable dashboard experiences

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS, Lucide React |
| API | NestJS 11, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | JWT, Passport, bcrypt |
| Validation | class-validator, class-transformer |
| HTTP Client | Axios |
| Tooling | ESLint, Prettier, Jest |

## 🏗️ Architecture

```mermaid
flowchart LR
    U[👤 User] --> FE[Next.js Frontend]
    FE -->|REST + JWT| API[NestJS API]
    API --> AUTH[Authentication & RBAC]
    API --> MOD[Application Modules]
    MOD --> A[Academic]
    MOD --> AT[Attendance]
    MOD --> F[Facilities]
    MOD --> B[Bookings]
    MOD --> D[Dashboard]
    API --> P[Prisma ORM]
    P --> DB[(PostgreSQL)]
```

### Backend modules

```text
backend/
├── src/
│   ├── auth/          # authentication + JWT
│   ├── users/         # user management
│   ├── academic/      # departments, courses, subjects, students
│   ├── attendance/    # sessions + attendance records
│   ├── facilities/    # buildings, rooms, resources
│   ├── bookings/      # resource booking workflows
│   ├── dashboard/     # dashboard APIs
│   └── common/        # shared infrastructure / Prisma
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## 🗄️ Data Model

The PostgreSQL schema is designed around connected campus entities:

**Users → Roles → Student Profiles → Courses → Subjects → Enrollments → Attendance**

and

**Buildings → Floors → Rooms → Resources → Bookings**

This keeps academic and facility workflows normalized while leaving room for future modules.

## ⚙️ Getting Started

### 1. Clone

```bash
git clone https://github.com/Somnath-Sarkar008/campusflow.git
cd campusflow
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/campusflow"
JWT_SECRET="replace-with-a-long-random-secret"
FRONTEND_URL="http://localhost:3001"
PORT=3000
```

Then:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
npm run start:dev
```

The API runs at:

```text
http://localhost:3000/api
```

### 3. Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

## 🔑 Environment Variables

Never commit real secrets.

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | JWT signing secret |
| `FRONTEND_URL` | Backend | Allowed frontend origin |
| `PORT` | Backend | API port |
| `NEXT_PUBLIC_API_URL` | Frontend | Public API base URL |

## 🚢 Deployment

CampusFlow is structured for a split production deployment:

```text
                 ┌──────────────────────┐
                 │   Next.js Frontend   │
                 │       Vercel         │
                 └──────────┬───────────┘
                            │ HTTPS / REST
                            ▼
                 ┌──────────────────────┐
                 │    NestJS Backend    │
                 │ Render / Railway     │
                 └──────────┬───────────┘
                            │ Prisma
                            ▼
                 ┌──────────────────────┐
                 │   Managed PostgreSQL │
                 │   Neon / Supabase    │
                 └──────────────────────┘
```

### Production variables

**Frontend**

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

**Backend**

```env
DATABASE_URL=YOUR_MANAGED_POSTGRES_CONNECTION_STRING
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN
PORT=10000
```

After configuring the production database, run the Prisma deployment migration command:

```bash
npx prisma migrate deploy
```

## 🛡️ Production Checklist

- [ ] Configure managed PostgreSQL
- [ ] Set a strong production `JWT_SECRET`
- [ ] Set production `FRONTEND_URL`
- [ ] Set frontend `NEXT_PUBLIC_API_URL`
- [ ] Run `npm run build` for both applications
- [ ] Run Prisma migrations with `npx prisma migrate deploy`
- [ ] Verify authentication and role permissions
- [ ] Verify CORS from the deployed frontend
- [ ] Test bookings and attendance end-to-end
- [ ] Confirm no `.env` files or credentials are committed

## 📌 Roadmap

- [ ] Notifications and announcements
- [ ] Email verification / password recovery
- [ ] Advanced analytics
- [ ] Calendar integration
- [ ] QR-based attendance
- [ ] Real-time booking updates
- [ ] Audit logs
- [ ] PWA / mobile-first enhancements

## 👨‍💻 Author

**Somnath Sarkar**

B.Tech CSE · Full-Stack Development · AI/ML · Blockchain

[![GitHub](https://img.shields.io/badge/GitHub-Somnath--Sarkar008-181717?style=for-the-badge&logo=github)](https://github.com/Somnath-Sarkar008)

---

<div align="center">

### 🌱 Built to make campus operations flow better.

⭐ If CampusFlow is useful or interesting, consider giving the repository a star.

</div>
