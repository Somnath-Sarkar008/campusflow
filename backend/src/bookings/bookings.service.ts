import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto, userId: string) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'End time must be after start time',
      );
    }

    const resource = await this.prisma.resource.findUnique({
      where: { id: dto.resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.status !== 'AVAILABLE') {
      throw new BadRequestException(
        'Resource is not currently available',
      );
    }

    const conflict = await this.prisma.booking.findFirst({
      where: {
        resourceId: dto.resourceId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'Resource is already booked for this time',
      );
    }

    return this.prisma.booking.create({
      data: {
        resourceId: dto.resourceId,
        userId,
        startTime,
        endTime,
        purpose: dto.purpose,
        status: 'PENDING',
      },
      include: {
        resource: {
          include: {
            room: true,
          },
        },
        user: true,
      },
    });
  }

  async findMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        userId,
      },
      include: {
        resource: {
          include: {
            room: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        resource: {
          include: {
            room: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async approve(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending bookings can be approved',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });
  }

  async reject(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending bookings can be rejected',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
    });
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException(
        'You can only cancel your own bookings',
      );
    }

    if (
      booking.status !== 'PENDING' &&
      booking.status !== 'APPROVED'
    ) {
      throw new BadRequestException(
        'This booking cannot be cancelled',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }
}