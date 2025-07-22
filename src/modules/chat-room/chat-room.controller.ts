import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ChatRoomService } from "./chat-room.service";
import { UpdateChatRoomDto } from "./dto/update-chat-room.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { AuthGuard } from "../../guards/auth.guard";
import { AdminGuard } from "../../guards/admin.guard";
import { ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";

@ApiSecurity("bearer")
@Controller("chat-rooms")
@UseGuards(AuthGuard)
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @ApiOperation({ summary: "Send a message in a chat room" })
  @ApiResponse({
    status: 201,
    description: "Message sent successfully",
    schema: {
      example: {
        message: "Successfully sent message",
        data: {
          senderId: "user123",
          chatRoomId: "room456",
          content: "Hello!",
          timestamp: "2025-01-03T12:34:56.789Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Chat room is closed or invalid input",
  })
  @ApiResponse({ status: 404, description: "Chat room not found" })
  @Post("/:roomId/message")
  async sendMessage(
    @Body() body: SendMessageDto,
    @Param("roomId") roomId: string,
    @Req() request,
  ) {
    const userId = request.user.sub;
    return await this.chatRoomService.sendMessage(userId, roomId, body.message);
  }

  @ApiOperation({ summary: "Retrieve chat room details" })
  @ApiResponse({
    status: 200,
    description: "Chat room retrieved successfully",
    schema: {
      example: {
        message: "Successfully retrieved chat room details",
        data: {
          id: "room456",
          isClosed: false,
          order: {
            id: "order789",
            userId: "user123",
            description: "Order details here",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Unauthorized user for this chat room",
  })
  @ApiResponse({ status: 404, description: "Chat room not found" })
  @Get("/:roomId")
  async findChatRoom(@Param("roomId") roomId: string, @Req() request) {
    const userId = request.user.sub;
    return await this.chatRoomService.findChatRoom(roomId, userId);
  }

  @ApiOperation({ summary: "Get chat history" })
  @ApiResponse({
    status: 200,
    description: "Chat history retrieved successfully",
    schema: {
      example: {
        message: "Successfully retrieved chat history",
        chats: [
          {
            id: "msg001",
            senderId: "user123",
            content: "Hi there!",
            timestamp: "2025-01-03T12:34:56.789Z",
          },
          {
            id: "msg002",
            senderId: "user456",
            content: "Hello!",
            timestamp: "2025-01-03T12:35:56.789Z",
          },
        ],
        summary: "Chat summary here",
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Unauthorized user for this chat room",
  })
  @ApiResponse({ status: 404, description: "Chat room not found" })
  @Get("/:roomId/history")
  async getChatHistory(@Param("roomId") roomId: string, @Req() request) {
    const userId = request.user.sub;
    return await this.chatRoomService.getChatHistory(roomId, userId);
  }

  @ApiOperation({ summary: "Close a chat room" })
  @ApiResponse({
    status: 200,
    description: "Chat room closed successfully",
    schema: {
      example: {
        message: "Successfully closed chat room",
        data: {
          id: "room456",
          isClosed: true,
          summary: "The order has been reviewed.",
          order: {
            id: "order789",
            state: "PROCESSING",
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Chat room is already closed" })
  @ApiResponse({ status: 404, description: "Chat room not found" })
  @Patch("/:roomId/close")
  @UseGuards(AdminGuard)
  async closeChatRoom(
    @Body() body: UpdateChatRoomDto,
    @Param("roomId") roomId: string,
  ) {
    return await this.chatRoomService.closeChatRoom(roomId, body);
  }
}
