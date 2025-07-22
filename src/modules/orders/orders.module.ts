import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { AdminGuard } from "../../guards/admin.guard";
import { AuthGuard } from "../../guards/auth.guard";
import { ChatRoomModule } from "../chat-room/chat-room.module";

@Module({
  imports: [PrismaModule, ChatRoomModule],
  controllers: [OrdersController],
  providers: [OrdersService, AdminGuard, AuthGuard],
})
export class OrdersModule {}
