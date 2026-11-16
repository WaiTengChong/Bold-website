import { Module } from "@nestjs/common";
import { CourtsModule } from "../courts/courts.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [CourtsModule],
  controllers: [AdminController],
})
export class AdminModule {}