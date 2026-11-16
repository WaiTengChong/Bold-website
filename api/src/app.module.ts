import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { ContentModule } from "./content/content.module";
import { CourtsModule } from "./courts/courts.module";
import { DbModule } from "./db/db.module";
import { HealthController } from "./health.controller";
import { SettingsModule } from "./settings/settings.module";

@Module({
  imports: [
    DbModule,
    AuthModule,
    CourtsModule,
    BookingsModule,
    ContentModule,
    SettingsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}