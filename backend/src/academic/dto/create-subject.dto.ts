import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Semester } from '@prisma/client';

export class CreateSubjectDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  courseId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  credits: number;

  @IsEnum(Semester)
  semester: Semester;

  @IsString()
  @MaxLength(500)
  description?: string;
}