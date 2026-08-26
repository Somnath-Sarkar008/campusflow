import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Semester } from '@prisma/client';

export class CreateEnrollmentDto {
  @IsUUID()
  studentId: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  subjectId: number;

  @IsEnum(Semester)
  semester: Semester;

  @IsString()
  @IsNotEmpty()
  academicYear: string;
}