import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminGuard } from '../../guards/admin.guard';
import { AuthGuard } from '../../guards/auth.guard';
import { ChatGateWay } from './chat-gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, ChatGateWay, AdminGuard, AuthGuard],
  exports: [ChatRoomService]
})
export class ChatRoomModule {}
