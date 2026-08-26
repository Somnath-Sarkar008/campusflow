import {
  IsDateString,
  IsInt,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  resourceId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @MinLength(5)
  purpose: string;
}