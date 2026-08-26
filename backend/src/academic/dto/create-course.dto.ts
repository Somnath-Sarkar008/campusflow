import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  departmentId: number;

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
  duration: number;
}