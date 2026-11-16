import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

function corsOrigins(): string[] | true {
  const raw = process.env.CORS_ORIGINS ?? "http://localhost:4321,http://127.0.0.1:4321";
  if (raw.trim() === "*") return true;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
  });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`BOLD API listening on :${port}/api/v1`);
}

bootstrap();