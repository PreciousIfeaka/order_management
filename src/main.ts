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
      "Authorization"
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
  const clientId = app.get<ConfigService>(ConfigService).get<string>("auth.google_client_id");
  const clientSecret = app.get<ConfigService>(ConfigService).get<string>("auth.google_oauth_secret");
  const callback_url = app.get<ConfigService>(ConfigService).get<string>("auth.google_callback_url");

  const config = new DocumentBuilder()
    .setTitle("Order-Chat Management Documentation")
    .setDescription("API For Managing the Order of users Through Chats Interactions with Admins")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(`${be_dev_url}:${port}/`, "Development Server")
    .addServer(`ws:${ws_dev_url}:${port}/`, "WebSocket Dev Server")
    .addServer(`${be_prod_url}`, "Production Server")
    .addServer(`ws:${ws_prod_url}`, "WebSocket Production Server")
    .addOAuth2({
      type: "oauth2",
      flows: {
        authorizationCode: {
          authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
          tokenUrl: "https://oauth2.googleapis.com/token",
          scopes: {
            openid: "OpenID Connect",
            email: "Access email",
            profile: "Access profile",
          },
        },
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      oauth2RedirectUrl: callback_url,
      initOAuth: {
        clientId,
        clientSecret,
        scopes: ["email", "profile"]
      },
    },
  });

  await app.listen(process.env.PORT || 3000);

  logger.log(`Server started on port: ${port}`);
}
bootstrap().catch((err) => {
  console.error("Error during bootstrap", err);
  process.exit(1);
});