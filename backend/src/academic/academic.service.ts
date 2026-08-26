import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(dto: CreateDepartmentDto) {
    try {
      return await this.prisma.department.create({
        data: dto,
      });
    } catch (error) {
      throw new ConflictException('Department name or code already exists');
    }
  }

  async getDepartments() {
    return this.prisma.department.findMany({
      include: {
        courses: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createCourse(dto: CreateCourseDto) {
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    try {
      return await this.prisma.course.create({
        data: dto,
        include: {
          department: true,
        },
      });
    } catch (error) {
      throw new ConflictException('Course code already exists');
    }
  }

  async getCourses() {
    return this.prisma.course.findMany({
      include: {
        department: true,
        subjects: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createSubject(dto: CreateSubjectDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    try {
      return await this.prisma.subject.create({
        data: dto,
        include: {
          course: true,
        },
      });
    } catch (error) {
      throw new ConflictException('Subject code already exists');
    }
  }

  async getSubjects() {
    return this.prisma.subject.findMany({
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createStudent(dto: CreateStudentDto) {
    const [user, course] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: dto.userId },
      }),
      this.prisma.course.findUnique({
        where: { id: dto.courseId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    try {
      return await this.prisma.studentProfile.create({
        data: dto,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          course: true,
        },
      });
    } catch (error) {
      throw new ConflictException(
        'Student profile already exists or roll/registration number is already used',
      );
    }
  }
async getStudents() {
  return this.prisma.studentProfile.findMany({
    include: {
      user: true,
      course: true,
    },
    orderBy: {
      rollNumber: 'asc',
    },
  });
}
  async getStudent(id: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          include: {
            department: true,
          },
        },
        enrollments: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async createEnrollment(dto: CreateEnrollmentDto) {
    const [student, subject] = await Promise.all([
      this.prisma.studentProfile.findUnique({
        where: { id: dto.studentId },
      }),
      this.prisma.subject.findUnique({
        where: { id: dto.subjectId },
      }),
    ]);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (student.courseId !== subject.courseId) {
      throw new ConflictException(
        'Student cannot enroll in a subject outside their course',
      );
    }

    try {
      return await this.prisma.enrollment.create({
        data: dto,
        include: {
          subject: true,
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new ConflictException(
        'Student is already enrolled in this subject for this academic year',
      );
    }
  }

  async getStudentEnrollments(studentId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        subject: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
  }
}