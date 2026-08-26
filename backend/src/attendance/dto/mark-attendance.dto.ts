import { AttendanceStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class MarkAttendanceDto {
  @IsUUID()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}