import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      users,
      students,
      departments,
      courses,
      subjects,
      buildings,
      rooms,
      resources,
      bookings,
      attendanceSessions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.studentProfile.count(),
      this.prisma.department.count(),
      this.prisma.course.count(),
      this.prisma.subject.count(),
      this.prisma.building.count(),
      this.prisma.room.count(),
      this.prisma.resource.count(),
      this.prisma.booking.count(),
      this.prisma.attendanceSession.count(),
    ]);

    const [
      pendingBookings,
      approvedBookings,
      availableRooms,
      availableResources,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.booking.count({
        where: { status: 'APPROVED' },
      }),
      this.prisma.room.count({
        where: { status: 'AVAILABLE' },
      }),
      this.prisma.resource.count({
        where: { status: 'AVAILABLE' },
      }),
    ]);

    return {
      users,
      students,
      departments,
      courses,
      subjects,
      buildings,
      rooms,
      resources,
      bookings,
      attendanceSessions,
      pendingBookings,
      approvedBookings,
      availableRooms,
      availableResources,
    };
  }

  async getBookingStats() {
    const [pending, approved, rejected, cancelled, completed] =
      await Promise.all([
        this.prisma.booking.count({
          where: { status: 'PENDING' },
        }),
        this.prisma.booking.count({
          where: { status: 'APPROVED' },
        }),
        this.prisma.booking.count({
          where: { status: 'REJECTED' },
        }),
        this.prisma.booking.count({
          where: { status: 'CANCELLED' },
        }),
        this.prisma.booking.count({
          where: { status: 'COMPLETED' },
        }),
      ]);

    return {
      pending,
      approved,
      rejected,
      cancelled,
      completed,
      total:
        pending +
        approved +
        rejected +
        cancelled +
        completed,
    };
  }

  async getResourceStats() {
    const [available, inUse, maintenance, retired] =
      await Promise.all([
        this.prisma.resource.count({
          where: { status: 'AVAILABLE' },
        }),
        this.prisma.resource.count({
          where: { status: 'IN_USE' },
        }),
        this.prisma.resource.count({
          where: { status: 'MAINTENANCE' },
        }),
        this.prisma.resource.count({
          where: { status: 'RETIRED' },
        }),
      ]);

    return {
      available,
      inUse,
      maintenance,
      retired,
      total: available + inUse + maintenance + retired,
    };
  }
}