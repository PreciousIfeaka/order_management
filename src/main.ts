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
  const be_dev_url: string = app.get<ConfigService>(ConfigService).get("server.be_dev_url");
  const be_prod_url: string = app.get<ConfigService>(ConfigService).get("server.be_prod_url");
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

// function keepAlive(url: string) {
//   https
//     .get(url, (res) => {
//       log.info(`Status: ${res.statusCode}`);
//     })
//     .on("error", (error) => {
//       log.error(`Error: ${error.message}`);
//     });
// }

// cron.schedule("*/5 * * * *", () => {
//   keepAlive("https://petrx-backend.onrender.com");
//   log.info("Pinging the server every 5 minutes");
// });