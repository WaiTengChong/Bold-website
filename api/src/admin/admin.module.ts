import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CourtsModule } from "../courts/courts.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [AuthModule, CourtsModule],
  controllers: [AdminController],
})
export class AdminModule {}