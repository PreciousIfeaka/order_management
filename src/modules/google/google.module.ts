import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from "./google.controller";
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [ GoogleService ],
  controllers: [ GoogleController ]
})
export class GoogleModule {}
