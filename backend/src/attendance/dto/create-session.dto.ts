import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  subjectId: number;

  @IsDateString()
  sessionDate: string;

  @IsOptional()
  @IsString()
  topic?: string;
}