import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Authorization",
    ],
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix("/api", { exclude: ["/api", "/"]})
  const port = app.get<ConfigService>(ConfigService).get<number>("server.port");
  const be_url: string = app.get<ConfigService>(ConfigService).get("server.be_url");
  const ws_url = be_url.split(":")[1];

  const config = new DocumentBuilder()
    .setTitle("Order-Chat Management Documentation")
    .setDescription("API For Managing the Order of users Through Chats Interactions with Admins")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(`${be_url}:${port}/`, "Local Development Server")
    .addServer(`ws:${ws_url}:${port}/`, "WebSocket Server")
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    }
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  await app.listen(process.env.PORT);

  logger.log(`Server started 🚀 on port: ${port}`);
}
bootstrap().catch((err) => {
  console.error("Error during bootstrap", err);
  process.exit(1);
});