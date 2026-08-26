import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  @Post('sessions')
  createSession(
    @Body() dto: CreateSessionDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };

return this.attendanceService.createSession(
  dto,
  user.userId,
);
  }

  @Post('sessions/:id/records')
  markAttendance(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: MarkAttendanceDto,
  ) {
    return this.attendanceService.markAttendance(
      sessionId,
      dto,
    );
  }

  @Get('sessions/:id')
  getSession(
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    return this.attendanceService.getSession(sessionId);
  }

  @Get('student/:id')
  getStudentAttendance(
    @Param('id') studentId: string,
  ) {
    return this.attendanceService.getStudentAttendance(
      studentId,
    );
  }

  @Get('subject/:id')
  getSubjectAttendance(
    @Param('id', ParseIntPipe) subjectId: number,
  ) {
    return this.attendanceService.getSubjectAttendance(
      subjectId,
    );
  }
}