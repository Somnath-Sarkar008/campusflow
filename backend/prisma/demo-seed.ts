import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { RoleName, Semester, AttendanceStatus, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const students = [
  ['Arjun', 'Das', 'arjun.das@campusflow.local', 'CSE-001', 'REG-2026-001'],
  ['Ananya', 'Roy', 'ananya.roy@campusflow.local', 'CSE-002', 'REG-2026-002'],
  ['Riya', 'Sen', 'riya.sen@campusflow.local', 'CSE-003', 'REG-2026-003'],
  ['Aditya', 'Ghosh', 'aditya.ghosh@campusflow.local', 'CSE-004', 'REG-2026-004'],
  ['Priya', 'Mukherjee', 'priya.mukherjee@campusflow.local', 'CSE-005', 'REG-2026-005'],
  ['Sayan', 'Mitra', 'sayan.mitra@campusflow.local', 'CSE-006', 'REG-2026-006'],
  ['Ishita', 'Paul', 'ishita.paul@campusflow.local', 'CSE-007', 'REG-2026-007'],
  ['Rahul', 'Bose', 'rahul.bose@campusflow.local', 'CSE-008', 'REG-2026-008'],
  ['Sneha', 'Dutta', 'sneha.dutta@campusflow.local', 'CSE-009', 'REG-2026-009'],
  ['Kunal', 'Chatterjee', 'kunal.chatterjee@campusflow.local', 'CSE-010', 'REG-2026-010'],
  ['Meera', 'Nair', 'meera.nair@campusflow.local', 'CSE-011', 'REG-2026-011'],
  ['Vivek', 'Sharma', 'vivek.sharma@campusflow.local', 'CSE-012', 'REG-2026-012'],
] as const;

async function main() {
  console.log('🌱 Adding realistic CampusFlow demo data...');

  const role = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.STUDENT } });
  const faculty = await prisma.user.findUniqueOrThrow({ where: { email: 'faculty@campusflow.local' } });
  const passwordHash = await bcrypt.hash('CampusFlow@123', 12);

  const cse = await prisma.department.upsert({ where: { code: 'CSE' }, update: {}, create: { name: 'Computer Science & Engineering', code: 'CSE', description: 'Computing, software engineering and intelligent systems.' } });
  const ece = await prisma.department.upsert({ where: { code: 'ECE' }, update: {}, create: { name: 'Electronics & Communication Engineering', code: 'ECE', description: 'Electronics, communication and embedded systems.' } });
  const aiml = await prisma.department.upsert({ where: { code: 'AIML' }, update: {}, create: { name: 'Artificial Intelligence & Machine Learning', code: 'AIML', description: 'Applied AI, machine learning and data-driven systems.' } });

  const cseCourse = await prisma.course.upsert({ where: { code: 'BTECH-CSE' }, update: {}, create: { departmentId: cse.id, name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE', duration: 4 } });
  const aimlCourse = await prisma.course.upsert({ where: { code: 'BTECH-AIML' }, update: {}, create: { departmentId: aiml.id, name: 'B.Tech Artificial Intelligence & ML', code: 'BTECH-AIML', duration: 4 } });
  const eceCourse = await prisma.course.upsert({ where: { code: 'BTECH-ECE' }, update: {}, create: { departmentId: ece.id, name: 'B.Tech Electronics & Communication', code: 'BTECH-ECE', duration: 4 } });

  const subjectDefs = [
    ['Data Structures & Algorithms', 'CSE-301', 4, Semester.SEMESTER_3, cseCourse.id],
    ['Database Management Systems', 'CSE-401', 4, Semester.SEMESTER_4, cseCourse.id],
    ['Operating Systems', 'CSE-402', 4, Semester.SEMESTER_4, cseCourse.id],
    ['Computer Networks', 'CSE-501', 4, Semester.SEMESTER_5, cseCourse.id],
    ['Web Technology', 'CSE-502', 3, Semester.SEMESTER_5, cseCourse.id],
    ['Artificial Intelligence', 'AIML-401', 4, Semester.SEMESTER_4, aimlCourse.id],
    ['Machine Learning', 'AIML-501', 4, Semester.SEMESTER_5, aimlCourse.id],
    ['Digital Signal Processing', 'ECE-401', 4, Semester.SEMESTER_4, eceCourse.id],
  ] as const;
  const subjects = [];
  for (const [name, code, credits, semester, courseId] of subjectDefs) {
    subjects.push(await prisma.subject.upsert({ where: { code }, update: {}, create: { name, code, credits, semester, courseId } }));
  }

  for (let i = 0; i < students.length; i++) {
    const [firstName, lastName, email, rollNumber, registrationNo] = students[i];
    const user = await prisma.user.upsert({ where: { email }, update: { firstName, lastName, emailVerified: true }, create: { email, passwordHash, firstName, lastName, emailVerified: true } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
    const courseId = i < 10 ? cseCourse.id : i === 10 ? aimlCourse.id : eceCourse.id;
    const semester = i % 2 === 0 ? Semester.SEMESTER_5 : Semester.SEMESTER_4;
    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: { courseId, rollNumber, registrationNo, admissionYear: 2024, currentSemester: semester },
      create: { userId: user.id, courseId, rollNumber, registrationNo, admissionYear: 2024, currentSemester: semester },
    });
    for (const subject of subjects.filter((s) => s.courseId === courseId).slice(0, 5)) {
      await prisma.enrollment.upsert({ where: { studentId_subjectId_academicYear: { studentId: profile.id, subjectId: subject.id, academicYear: '2026-27' } }, update: {}, create: { studentId: profile.id, subjectId: subject.id, semester, academicYear: '2026-27' } });
    }
  }

  const rooms = await prisma.room.findMany({ include: { resources: true } });
  const bookingRooms = ['101', '201', 'SH-01', '102', '202'].map((number) => rooms.find((r) => r.roomNumber === number)).filter(Boolean) as typeof rooms;
  const resources = bookingRooms.flatMap((r) => r.resources).slice(0, 5);

  const now = new Date();
  const bookingData = [
    ['Data Structures Lecture', 1, BookingStatus.APPROVED],
    ['DBMS Practical', 1, BookingStatus.APPROVED],
    ['AI & ML Guest Lecture', 2, BookingStatus.PENDING],
    ['Operating Systems Lecture', 3, BookingStatus.APPROVED],
    ['Web Development Lab', 4, BookingStatus.APPROVED],
    ['Faculty Meeting', 1, BookingStatus.PENDING],
  ] as const;
  for (let i = 0; i < bookingData.length; i++) {
    const [purpose, startHour, status] = bookingData[i];
    const resource = resources[i % Math.max(resources.length, 1)];
    if (!resource) continue;
    const start = new Date(now); start.setDate(now.getDate() + Math.floor(i / 2)); start.setHours(startHour + 8, 0, 0, 0);
    const end = new Date(start); end.setHours(start.getHours() + 1);
    const existing = await prisma.booking.findFirst({ where: { purpose, resourceId: resource.id } });
    if (!existing) await prisma.booking.create({ data: { resourceId: resource.id, userId: faculty.id, startTime: start, endTime: end, purpose, status } });
  }

  const attendanceSubjects = subjects.filter((s) => ['CSE-301', 'CSE-401', 'CSE-402'].includes(s.code));
  const profiles = await prisma.studentProfile.findMany({ where: { courseId: cseCourse.id }, take: 10 });
  for (let i = 0; i < attendanceSubjects.length; i++) {
    const date = new Date(now); date.setDate(now.getDate() - i - 1); date.setHours(0, 0, 0, 0);
    const session = await prisma.attendanceSession.upsert({
      where: { subjectId_sessionDate: { subjectId: attendanceSubjects[i].id, sessionDate: date } },
      update: {},
      create: { subjectId: attendanceSubjects[i].id, markedById: faculty.id, sessionDate: date, topic: ['Arrays & Graphs', 'Normalization & SQL', 'Processes & Scheduling'][i] },
    });
    for (let j = 0; j < profiles.length; j++) {
      const status = j % 9 === 0 ? AttendanceStatus.ABSENT : j % 7 === 0 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
      await prisma.attendanceRecord.upsert({ where: { sessionId_studentId: { sessionId: session.id, studentId: profiles[j].id } }, update: { status }, create: { sessionId: session.id, studentId: profiles[j].id, status } });
    }
  }

  console.log('✅ Demo data added: students, academics, enrollments, bookings and attendance.');
}

main().catch((error) => { console.error('❌ Demo seed failed:', error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
