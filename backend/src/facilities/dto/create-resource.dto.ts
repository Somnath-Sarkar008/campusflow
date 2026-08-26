import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @IsInt()
  roomId: number;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsEnum(ResourceType)
  type: ResourceType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @IsOptional()
  @IsString()
  description?: string;
}