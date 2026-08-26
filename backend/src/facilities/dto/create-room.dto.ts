import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsInt()
  floorId: number;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(30)
  roomNumber: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  description?: string;
}