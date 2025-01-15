import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderState, Role } from '@prisma/client';

@Injectable()
export class ChatRoomService {
  constructor(private prisma: PrismaService) {}

  async createChatRoom(orderId: string) {
    const chatRoom = await this.prisma.chatRoom.create({
      data: { orderId }
    });
    
    return {
      message: "Successfully created chat room",
      data: chatRoom
    };
  }

  async sendMessage(userId: string, chatRoomId: string, content: string) {
    if (!content) throw new BadRequestException("Chat content cannot be empty");
    const { data } = await this.findChatRoom(chatRoomId, userId);
    const chatRoom = data
    if (!chatRoom || chatRoom.isClosed) throw new BadRequestException("Chat room is closed");

    const text = await this.prisma.message.create({
      data: {
        senderId: userId,
        chatRoomId,
        content
      }
    });
    return {
      message: "Successfully sent message",
      data: text
    }
  }

  async findChatRoom(roomId: string, userId: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { order: true }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (chatRoom.order.userId !== userId && user.role !== Role.ADMIN )
      throw new UnauthorizedException("Unauthorized user for this chat room");

    if (!chatRoom) throw new NotFoundException("Chat room not found");

    return {
      message: "Successfully retrieved chat room details",
      data: chatRoom
    }
  }

  async closeChatRoom(roomId: string, updateChatRoomDto: UpdateChatRoomDto) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { order: true }
    });

    if (room.isClosed) throw new BadRequestException("Chat room is already closed");

    const updatedRoom = await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { 
        ...updateChatRoomDto,
        isClosed: true,
        order: {
          update: {
            where: { id: room.order.id},
            data: { state: OrderState.PROCESSING }
          }
        }
      }
    });

    return {
      message: "Successfully closed chatRoom",
      data: updatedRoom
    }
  };

  async getChatHistory(roomId: string, userId: string) {
    const { data } = await this.findChatRoom(roomId, userId);
    const chats = await this.prisma.message.findMany({
      where: { chatRoomId: roomId },
      orderBy: { timestamp: "asc" },
    });

    return {
      message: "Successfully retrieved chat history",
      chats,
      summary: data.summary
    };
  };

  async validateUser(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
