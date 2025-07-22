import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import authConfig from '../config/auth.config';
import serverConfig from '../config/server.config';
import * as Joi from "joi";
import { GlobalExceptionFilter } from './exception-filter/http.exception-filter';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ChatRoomModule } from './modules/chat-room/chat-room.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    {
      provide: "CONFIG",
      useClass: ConfigService
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
       new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
       }),
     },
     {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
     },
    Logger,
    AppService
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, serverConfig],
      envFilePath: [".env.test", ".env"],
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        NODE_ENV: Joi.string().valid("development", "production", "test").required()
      })
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    ChatRoomModule,
  ]
})
export class AppModule {}
