import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../../../app.module";
import { io, Socket } from "socket.io-client";
import { PrismaService } from "../../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { TestLogger } from "../../../utils/test-logger";

describe("ChatRoom e2e Tests", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let clientSocket: Socket;
  let adminSocket: Socket;
  let userId: string;
  let adminId: string;
  let chatRoomId: string;
  let token: string;
  let adminToken: string
  let room;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get<PrismaService>(PrismaService);
    jwt = app.get<JwtService>(JwtService);

    const user = await prisma.user.create({
      data: {
        name: "Precious Ifeaka",
        email: "pIfeaka@example.com",
        password: "password123",
        isVerified: true
      }
    });
    token = jwt.sign({ sub: user.id, isVerified: user.isVerified })
    userId = user.id;


    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "ADMIN",
        isVerified: true
      }
    });

    adminId = admin.id;
    adminToken = jwt.sign({ sub: admin.id, isVerified: admin.isVerified })

    app.useLogger(new TestLogger());
    await app.init();
    app.listen(`${process.env.PORT}`);
    

    const orderDetails = {
      description: "Order description",
      specifications: "Order specifications",
      quantity: 10,
    };

    const orderResponse = await request(app.getHttpServer())
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(orderDetails);

    chatRoomId = orderResponse.body.data.chatRoom.id;
  });

  afterAll(async () => {
    clientSocket?.disconnect();
    adminSocket?.disconnect();
    await prisma.user.deleteMany();
    prisma.$disconnect();
    await app.close();
  });

  it("User should successfully join the chatroom via WebSocket", async () => {
    clientSocket = io(`http://172.24.108.55:${app.getHttpServer().address().port}`, {
      query: { userId },
    });

    const message = await new Promise((resolve, reject) => {
      clientSocket.emit("join_chat_room", { chatRoomId });
      clientSocket.on("joined_room", resolve);
      clientSocket.on("error", reject);
    });

    expect(message).toContain(`chatRoomId: ${chatRoomId}`);
  });

  it("Admin should successfully join the chatroom via WebSocket", async () => {
    adminSocket = io(`http://172.24.108.55:${app.getHttpServer().address().port}`, {
      query: { userId: adminId },
    });

    const message = await new Promise((resolve, reject) => {
      adminSocket.emit("join_chat_room", { chatRoomId });
      adminSocket.on("joined_room", resolve);
      adminSocket.on("error", reject);
    });

    expect(message).toContain(`chatRoomId: ${chatRoomId}`);
  });

  it("User should successfully send a message in the chatroom", async () => {
    const messageContent = "Hello, I have just made an order";
  
    room = await prisma.chatRoom.findFirst({ where: { id: chatRoomId }});

    if (room?.isClosed) {
      const error = await new Promise((resolve, reject) => {
        clientSocket.on("error", reject);
        clientSocket.emit("message", {
          chatRoomId,
          content: messageContent,
        });
      });
      expect(error).toBe("Chat room is closed");
      return;
    }
  
    const message: Record<string, string> = await new Promise((resolve, reject) => {
      clientSocket.on("error", reject);
      clientSocket.emit("message", {
        chatRoomId,
        content: messageContent,
      });
  
      adminSocket.on("new_message", (message) => {
        if (message.senderId === userId) {
          resolve(message);
        }
      });
    });
  
    expect(message.content).toBe(messageContent);
    expect(message.senderId).toBe(userId);
  });
  
  it("Admin should successfully send a message in the chatroom", (done) => {
    const messageContent = "Hi! Okay, let me confirm.";
  
    adminSocket.on("error", (error) => {
      done(error);
    });
  
    adminSocket.emit("message", {
      chatRoomId,
      content: messageContent,
    });
  
    clientSocket.on("new_message", (message) => {
      expect(message.content).toBe(messageContent);
      expect(message.senderId).toBe(adminId);
      done();
    });
  });
  

  it("Admin should close the chatroom", async () => {
    const response = await request(app.getHttpServer())
      .patch(`/chat-rooms/${chatRoomId}/close`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ summary: "Chat completed" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Successfully closed chatRoom");
  });

  it("Closed chatroom should not allow messages", (done) => {
    clientSocket.emit("message", {
      chatRoomId,
      content: "This message should fail",
    });

    clientSocket.on("error", (error) => {
      expect(error).toBe("Error in sending message");
      done();
    });
    clientSocket.on("new_message", () => {
      done(new Error("Message shouldn't be sent"));
    });
  });
});
