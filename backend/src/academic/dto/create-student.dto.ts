import { Type } from 'class-transformer';

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { Semester } from '@prisma/client';

export class CreateStudentDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  courseId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  rollNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNo: string;

  @IsInt()
  @Type(() => Number)
  @Min(2000)
  admissionYear: number;

  @IsEnum(Semester)
  currentSemester: Semester;
}