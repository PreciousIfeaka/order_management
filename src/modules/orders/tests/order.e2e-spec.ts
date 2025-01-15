import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { AppModule } from "../../../app.module";
import { JwtService } from "@nestjs/jwt";
import { TestLogger } from "../../../utils/test-logger";

describe("OrdersController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    const user = await prisma.user.create({
      data: {
        name: "Anthony Joshua",
        email: "anthonyjoshua@example.com",
        password: "AJTheBeast",
        isVerified: true
      },
    });

    userToken = jwtService.sign({ sub: user.id, isVerified: true });

    app.useLogger(new TestLogger());
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it("It should successfully create an order", async () => {
    const createOrderDto = {
      description: "Order for testing",
      specifications: "Test specs",
      quantity: 5,
    };

    const response = await request(app.getHttpServer())
      .post("/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send(createOrderDto)
      .expect(201);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Successfully created order and chat room");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data).toHaveProperty("chatRoom");
    expect(response.body.data).toHaveProperty("description", createOrderDto.description);
    expect(response.body.data).toHaveProperty("specifications", createOrderDto.specifications);
    expect(response.body.data).toHaveProperty("quantity", createOrderDto.quantity);
  });

  it("It should successfully retrieve orders for a user", async () => {
    const response = await request(app.getHttpServer())
      .get("/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.message).toBe("Successfully retrieved orders");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("It should successfully retrieve all orders (admin)", async () => {
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: "adminpassword",
        role: "ADMIN",
        isVerified: true
      },
    });

    const adminToken = jwtService.sign({ sub: admin.id, isVerified: true });
    const response = await request(app.getHttpServer())
      .get("/orders/admin")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.message).toBe("Successfully retrieved all orders");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("It should successfully retrieve all orders for a user (admin)", async () => {
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin0@example.com",
        password: "adminpassword",
        role: "ADMIN",
        isVerified: true
      },
    });

    const adminToken = jwtService.sign({ sub: admin.id, isVerified: true });
    const userId = (await jwtService.verifyAsync(userToken)).sub;

    const response = await request(app.getHttpServer())
      .get(`/orders/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body.message).toBe("Successfully retrieved orders");
    expect(Array.isArray(response.body.data)).toBe(true);
  });


  it("It should successfully retrieve an order by id for a user", async () => {
    const userId = (await jwtService.verifyAsync(userToken)).sub;
    const order = await prisma.order.findFirst({
      where: { userId },
    });

    const response = await request(app.getHttpServer())
      .get(`/orders/${order.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.message).toBe("Successfully retrieved order");
    expect(response.body.data.id).toBe(order.id);
  });

  it("It should update an order (admin)", async () => {
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin1@example.com",
        password: "adminpassword",
        role: "ADMIN",
        isVerified: true
      },
    });

    const adminToken = jwtService.sign({ sub: admin.id, isVerified: true });

    const order = await prisma.order.create({
      data: {
        description: "Test order",
        specifications: "Test specs",
        quantity: 5,
        userId: admin.id,
      },
    });

    const updatedOrderDto = {
      description: "Updated order description",
      specifications: "Updated specifications",
      quantity: 10,
    };

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedOrderDto)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Successfully updated order");
    expect(response.body.data.description).toBe(updatedOrderDto.description);
    expect(response.body.data.specifications).toBe(updatedOrderDto.specifications);
    expect(response.body.data.quantity).toBe(updatedOrderDto.quantity);
  });

  it("It should return 404 when trying to retrieve non-existing order", async () => {
    const nonExistentOrderId = "6292f82e-16e4-48b6-8ebd-457f1a74925c";

    const response = await request(app.getHttpServer())
      .get(`/orders/${nonExistentOrderId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(404);

    expect(response.body.message).toBe("Order not found");
  });
});
