import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CourtsModule } from "../courts/courts.module";
import { SettingsModule } from "../settings/settings.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

@Module({
  imports: [AuthModule, CourtsModule, SettingsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}