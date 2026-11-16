import { Module } from "@nestjs/common";
import { CatalogController, ContentController } from "./content.controller";
import { ContentService } from "./content.service";

@Module({
  controllers: [ContentController, CatalogController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}