import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import authConfig from "../../../config/auth.config";
import { PrismaModule } from "../../prisma/prisma.module";
import { GoogleAuth } from "./google.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: authConfig().jwtSecret,
      signOptions: { expiresIn: authConfig().jwtExpiry },
    }),
    PrismaModule,
  ],
  providers: [AuthService, GoogleAuth],
  controllers: [AuthController],
})
export class AuthModule {}
