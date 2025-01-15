import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../../app.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { TestLogger } from "../../../utils/test-logger";


describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleReference: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleReference.createNestApplication();
    prisma = moduleReference.get<PrismaService>(PrismaService);

    app.useLogger(new TestLogger());
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    prisma.$disconnect();
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("It should register a new user", async () => {
      const registerPayload = {
        name: "Anthony Joshua",
        email: "anthonyjoshua@example.com",
        password: "AJTheBeast@1",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerPayload)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Successfully created user");
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("name", registerPayload.name);
      expect(response.body.data).toHaveProperty("email", registerPayload.email);
      expect(response.body.data).toHaveProperty("role", "USER");
      expect(response.body.data).toHaveProperty("isVerified", true);
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");
      expect(response.body.data).toHaveProperty("deletedAt");
      expect(response.body).toHaveProperty("access_token");
    });

    it("It should successfully register an admin", async () => {
      const registerPayload = {
        name: "Anthony Joshua",
        email: "aj@example.com",
        password: "AJTheBeast@1",
        admin_secret: `${process.env.ADMIN_SECRET}`
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerPayload)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Successfully created user");
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("name", registerPayload.name);
      expect(response.body.data).toHaveProperty("email", registerPayload.email);
      expect(response.body.data).toHaveProperty("role", "ADMIN");
      expect(response.body.data).toHaveProperty("isVerified", true);
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");
      expect(response.body.data).toHaveProperty("deletedAt");
      expect(response.body).toHaveProperty("access_token");
    });

    it("It should not register a user with an existing email", async () => {
      const registerPayload = {
        name: "Anthony Joshua",
        email: "anthonyjoshua@example.com",
        password: "AJTheBeast@1",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerPayload)
        .expect(409);

      expect(response.body).toHaveProperty("message", "User already exists.");
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("POST /auth/login", () => {
    it("It should login a user with valid credentials", async () => {
      const loginPayload = {
        email: "anthonyjoshua@example.com",
        password: "AJTheBeast@1",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(loginPayload)
        .expect(201);

        expect(response.body).toHaveProperty("message", "Successful user signin");
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("name", "Anthony Joshua");
        expect(response.body.data).toHaveProperty("email", loginPayload.email);
        expect(response.body.data).toHaveProperty("role", "USER");
        expect(response.body.data).toHaveProperty("isVerified", true);
        expect(response.body.data).toHaveProperty("createdAt");
        expect(response.body.data).toHaveProperty("updatedAt");
        expect(response.body.data).toHaveProperty("deletedAt");
        expect(response.body).toHaveProperty("access_token");
    });

    it("It should not login a user with invalid password", async () => {
      const loginPayload = {
        email: "anthonyjoshua@example.com",
        password: "wrongPassword",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(loginPayload)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Invalid user credentials");
    });

    it("It should not login a user with invalid email", async () => {
      const loginPayload = {
        email: "wrongemail@example.com",
        password: "AJTheBeast@1",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(loginPayload)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Invalid user credentials");
    });

    it("should not login a user that is not verified", async () => {
      const unverifiedUser = await prisma.user.create({
        data: {
          name: "Alex Pereira",
          email: "alexp@example.com",
          password: "AlexTheBeast@1",
          isVerified: false,
        },
      });

      const loginPayload = {
        email: unverifiedUser.email,
        password: "AlexTheBeast@1",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send(loginPayload)
        .expect(401);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "User account is not verified");
    });
  });
});
