import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles } from "../auth/auth.guards";
import { RolesGuard } from "../auth/roles.guard";
import { ContentService } from "./content.service";

@Controller("content")
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get("site")
  site() {
    return this.content.getSite();
  }

  @Put("site")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  putSite(@Body() body: unknown) {
    return this.content.putSite(body);
  }

  @Get("facility")
  facility() {
    return this.content.getFacility();
  }

  @Put("facility")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  putFacility(@Body() body: unknown) {
    return this.content.putFacility(body);
  }
}

@Controller()
export class CatalogController {
  constructor(private readonly content: ContentService) {}

  @Get("events")
  events() {
    return this.content.listEvents();
  }

  @Get("news")
  news() {
    return this.content.listNews();
  }
}