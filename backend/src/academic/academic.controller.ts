import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { AcademicService } from './academic.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('academic')
@UseGuards(JwtAuthGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // =========================
  // DEPARTMENTS
  // =========================

  @Post('departments')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.academicService.createDepartment(dto);
  }

  @Get('departments')
  getDepartments() {
    return this.academicService.getDepartments();
  }

  // =========================
  // COURSES
  // =========================

  @Post('courses')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.academicService.createCourse(dto);
  }

  @Get('courses')
  getCourses() {
    return this.academicService.getCourses();
  }

  // =========================
  // SUBJECTS
  // =========================

  @Post('subjects')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'FACULTY', 'SUPER_ADMIN')
  createSubject(@Body() dto: CreateSubjectDto) {
    return this.academicService.createSubject(dto);
  }

  @Get('subjects')
  getSubjects() {
    return this.academicService.getSubjects();
  }

  // =========================
  // STUDENTS
  // =========================

  @Post('students')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.academicService.createStudent(dto);
  }

  // GET ALL STUDENTS
  @Get('students')
  getStudents() {
    return this.academicService.getStudents();
  }

  // GET ONE STUDENT
  @Get('students/:id')
  getStudent(@Param('id') id: string) {
    return this.academicService.getStudent(id);
  }

  // =========================
  // ENROLLMENTS
  // =========================

  @Post('enrollments')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'FACULTY', 'SUPER_ADMIN')
  createEnrollment(@Body() dto: CreateEnrollmentDto) {
    return this.academicService.createEnrollment(dto);
  }

  @Get('students/:id/enrollments')
  getStudentEnrollments(@Param('id') id: string) {
    return this.academicService.getStudentEnrollments(id);
  }
}