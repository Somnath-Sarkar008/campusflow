import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';

import { CreateBuildingDto } from './dto/create-building.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateResourceDto } from './dto/create-resource.dto';

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async createBuilding(dto: CreateBuildingDto) {
    const existing = await this.prisma.building.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException('Building code already exists');
    }

    return this.prisma.building.create({
      data: dto,
      include: {
        floors: true,
      },
    });
  }

  async getBuildings() {
    return this.prisma.building.findMany({
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                resources: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createFloor(
    buildingId: number,
    floorNumber: number,
    name?: string,
  ) {
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return this.prisma.floor.create({
      data: {
        buildingId,
        floorNumber,
        name,
      },
    });
  }

  async createRoom(dto: CreateRoomDto) {
    const floor = await this.prisma.floor.findUnique({
      where: { id: dto.floorId },
    });

    if (!floor) {
      throw new NotFoundException('Floor not found');
    }

    return this.prisma.room.create({
      data: dto,
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        resources: true,
      },
    });
  }

  async getRooms() {
    return this.prisma.room.findMany({
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        resources: true,
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
  }

  async getAvailableRooms() {
    return this.prisma.room.findMany({
      where: {
        status: 'AVAILABLE',
      },
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        resources: true,
      },
    });
  }

  async createResource(dto: CreateResourceDto) {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.prisma.resource.create({
      data: dto,
      include: {
        room: {
          include: {
            floor: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    });
  }

  async getResources() {
    return this.prisma.resource.findMany({
      include: {
        room: {
          include: {
            floor: {
              include: {
                building: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getAvailableResources() {
    return this.prisma.resource.findMany({
      where: {
        status: 'AVAILABLE',
      },
      include: {
        room: true,
      },
    });
  }
}