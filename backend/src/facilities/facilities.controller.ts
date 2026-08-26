import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { FacilitiesService } from './facilities.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateResourceDto } from './dto/create-resource.dto';

@Controller('facilities')
@UseGuards(JwtAuthGuard)
export class FacilitiesController {
  constructor(
    private readonly facilitiesService: FacilitiesService,
  ) {}

  @Post('buildings')
  createBuilding(@Body() dto: CreateBuildingDto) {
    return this.facilitiesService.createBuilding(dto);
  }

  @Get('buildings')
  getBuildings() {
    return this.facilitiesService.getBuildings();
  }

  @Post('buildings/:id/floors')
  createFloor(
    @Param('id', ParseIntPipe) buildingId: number,
    @Body()
    body: {
      floorNumber: number;
      name?: string;
    },
  ) {
    return this.facilitiesService.createFloor(
      buildingId,
      body.floorNumber,
      body.name,
    );
  }

  @Post('rooms')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.facilitiesService.createRoom(dto);
  }

  @Get('rooms')
  getRooms() {
    return this.facilitiesService.getRooms();
  }

  @Get('rooms/available')
  getAvailableRooms() {
    return this.facilitiesService.getAvailableRooms();
  }

  @Post('resources')
  createResource(@Body() dto: CreateResourceDto) {
    return this.facilitiesService.createResource(dto);
  }

  @Get('resources')
  getResources() {
    return this.facilitiesService.getResources();
  }

  @Get('resources/available')
  getAvailableResources() {
    return this.facilitiesService.getAvailableResources();
  }
}
