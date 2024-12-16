import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import * as express from "express";
import * as path from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(express.static("public"));
  app.enableCors({
    credentials: true,
    origin: true,
    exposedHeaders: ["set-cookie"],
  });

  app.useGlobalPipes(new ValidationPipe());
  // Serve static files from the 'uploads' folder

  await app.listen(8080);
}
bootstrap();
