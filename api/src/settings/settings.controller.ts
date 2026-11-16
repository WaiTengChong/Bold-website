import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles } from "../auth/auth.guards";
import { RolesGuard } from "../auth/roles.guard";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  patch(@Body() body: { guestBookingEnabled?: boolean }) {
    if (typeof body.guestBookingEnabled !== "boolean") {
      return this.settings.get();
    }
    return this.settings.patch(body.guestBookingEnabled);
  }
}