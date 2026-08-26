import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(dto: CreateSessionDto, userId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return this.prisma.attendanceSession.create({
      data: {
        subjectId: dto.subjectId,
        markedById: userId,
        sessionDate: new Date(dto.sessionDate),
        topic: dto.topic,
      },
      include: {
        subject: true,
      },
    });
  }

  async markAttendance(
    sessionId: number,
    dto: MarkAttendanceDto,
  ) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    const student = await this.prisma.studentProfile.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: dto.studentId,
        },
      },
      update: {
        status: dto.status,
      },
      create: {
        sessionId,
        studentId: dto.studentId,
        status: dto.status,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getStudentAttendance(studentId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
      },
      include: {
        session: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        session: {
          sessionDate: 'desc',
        },
      },
    });

    const total = records.length;

    const present = records.filter(
      (r) => r.status === 'PRESENT',
    ).length;

    const late = records.filter(
      (r) => r.status === 'LATE',
    ).length;

    const absent = records.filter(
      (r) => r.status === 'ABSENT',
    ).length;

    const excused = records.filter(
      (r) => r.status === 'EXCUSED',
    ).length;

    const percentage =
      total > 0
        ? ((present + late * 0.5) / total) * 100
        : 0;

    return {
      studentId,
      totalSessions: total,
      present,
      late,
      absent,
      excused,
      attendancePercentage: Number(percentage.toFixed(2)),
      lowAttendance: percentage < 75,
      records,
    };
  }

  async getSubjectAttendance(subjectId: number) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        session: {
          subjectId,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    const students = new Map<string, any>();

    for (const record of records) {
      if (!students.has(record.studentId)) {
        students.set(record.studentId, {
          studentId: record.studentId,
          name: `${record.student.user.firstName} ${record.student.user.lastName}`,
          rollNumber: record.student.rollNumber,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
        });
      }

      const student = students.get(record.studentId);

      student.total++;

      if (record.status === 'PRESENT') student.present++;
      if (record.status === 'LATE') student.late++;
      if (record.status === 'ABSENT') student.absent++;
      if (record.status === 'EXCUSED') student.excused++;
    }

    return Array.from(students.values()).map((student) => {
      const percentage =
        student.total > 0
          ? ((student.present + student.late * 0.5) /
              student.total) *
            100
          : 0;

      return {
        ...student,
        attendancePercentage: Number(percentage.toFixed(2)),
        lowAttendance: percentage < 75,
      };
    });
  }

  async getSession(sessionId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        subject: true,
        records: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    return session;
  }
}