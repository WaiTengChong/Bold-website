import { Controller, Get } from "@nestjs/common";
import { CourtsService } from "./courts.service";

@Controller("courts")
export class CourtsController {
  constructor(private readonly courts: CourtsService) {}

  @Get()
  list() {
    return this.courts.listCourts();
  }
}