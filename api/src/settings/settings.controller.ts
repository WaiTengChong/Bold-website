import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { Audience, AudienceGuard, JwtAuthGuard, Roles } from "../auth/auth.guards";
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
  @UseGuards(JwtAuthGuard, AudienceGuard, RolesGuard)
  @Audience("staff")
  @Roles("staff")
  patch(@Body() body: { guestBookingEnabled?: boolean }) {
    if (typeof body.guestBookingEnabled !== "boolean") {
      return this.settings.get();
    }
    return this.settings.patch(body.guestBookingEnabled);
  }
}