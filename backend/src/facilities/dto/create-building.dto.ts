import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(30)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;
}