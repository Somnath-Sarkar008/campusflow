import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateBookingDto,
    @Req() req: Request,
  ) {
    const user = req.user as {
      userId: string;
    };

    return this.bookingsService.create(dto, user.userId);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('mine')
  findMine(@Req() req: Request) {
    const user = req.user as {
      userId: string;
    };

    return this.bookingsService.findMyBookings(user.userId);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.bookingsService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.bookingsService.reject(id);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as {
      userId: string;
    };

    return this.bookingsService.cancel(id, user.userId);
  }
}