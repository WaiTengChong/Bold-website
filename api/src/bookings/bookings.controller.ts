import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard, OptionalJwtAuthGuard, Roles } from "../auth/auth.guards";
import { RolesGuard } from "../auth/roles.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { BookingsService } from "./bookings.service";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get("slots")
  slots() {
    return { slots: this.bookings.timeSlots() };
  }

  @Get("availability")
  async availability(@Query("date") date: string, @Query("time") time: string) {
    return { date, time, courts: await this.bookings.availability(date, time) };
  }

  @Get("day")
  day(@Query("date") date: string) {
    return this.bookings.dayOccupancy(date);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(
    @Req() req: Request & { user?: JwtPayload | null },
    @Body() body: { date: string; time: string; courtId: number; guestName?: string },
  ) {
    return this.bookings.create(req.user ?? null, body);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  mine(@Req() req: Request & { user: JwtPayload }) {
    return this.bookings.mine(req.user.sub);
  }

  @Post(":id/cancel")
  @UseGuards(JwtAuthGuard)
  cancel(@Req() req: Request & { user: JwtPayload }, @Param("id") id: string) {
    return this.bookings.cancel(req.user, id);
  }

  @Get("admin/overview")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  adminOverview() {
    return this.bookings.adminList();
  }
}