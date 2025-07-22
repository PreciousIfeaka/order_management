import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization"
    ],
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix("/api", { exclude: ["/api", "/"]});

  const configService = app.get(ConfigService);

  const port = configService.get<number>("server.port");
  const be_dev_url: string = configService.get("server.be_dev_url");
  const be_prod_url: string = configService.get("server.be_prod_url");
  const ws_dev_url = be_dev_url.split(":")[1];
  const ws_prod_url = be_prod_url.split(":")[1];

  const config = new DocumentBuilder()
    .setTitle("Order-Chat Management Documentation")
    .setDescription("API For Managing the Order of users Through Chats Interactions with Admins")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(`${be_dev_url}:${port}/`, "Development Server")
    .addServer(`ws:${ws_dev_url}:${port}/`, "WebSocket Dev Server")
    .addServer(`${be_prod_url}`, "Production Server")
    .addServer(`ws:${ws_prod_url}`, "WebSocket Production Server")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(port);

  logger.log(`Server started on port: ${port}`);
}
bootstrap().catch((err) => {
  console.error("Error during bootstrap", err);
  process.exit(1);
});