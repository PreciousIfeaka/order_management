import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { ChatRoomService } from "./chat-room.service";
import { Socket, Server } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateWay.name);

  constructor(private chatRoomService: ChatRoomService) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId;
    const user = await this.chatRoomService.validateUser(userId);

    if (!user) client.disconnect(true);
    client.join(`user:${userId}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId;

    client.leave(`user:${userId}`);
  }

  @SubscribeMessage("join_chat_room")
  async handleJoinChatRoom(client: Socket, payload: { chatRoomId: string }) {
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId;

    const { data } = await this.chatRoomService.findChatRoom(
      payload.chatRoomId,
      userId,
    );
    if (!data) {
      client.emit("error", "Access denied to chat room");
      return;
    }

    client.join(`room:${payload.chatRoomId}`);
    client.emit("joined_room", `chatRoomId: ${payload.chatRoomId}`);
  }

  @SubscribeMessage("message")
  async handleMessages(
    client: Socket,
    payload: { chatRoomId: string; content: string },
  ) {
    try {
      const userId = Array.isArray(client.handshake.query.userId)
        ? client.handshake.query.userId[0]
        : client.handshake.query.userId;

      const { data } = await this.chatRoomService.sendMessage(
        userId,
        payload.chatRoomId,
        payload.content,
      );
      delete data.id;
      this.server.to(`room:${payload.chatRoomId}`).emit("new_message", data);
    } catch (error) {
      client.emit("error", "Error in sending message");
      this.logger.log(`Error in handleMessages: ${error}`);
    }
  }
}
