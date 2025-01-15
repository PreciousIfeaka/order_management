import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { User, Role } from "@prisma/client";
import { RegisterUserDto } from "../auth/dtos/register-user.dto";

@Injectable()
export class UserService {
  constructor( private prisma: PrismaService, private configService: ConfigService) {}
  async createUser(createUserPayload: RegisterUserDto): Promise<{
    message: string,
    user: Partial<User>
  }> {
    const findUser = await this.prisma.user.findUnique({
      where: { email: createUserPayload.email },
    });
    if (findUser) throw new ConflictException("User already exists.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserPayload.password, salt);
    createUserPayload.password = hashedPassword;

    const adminSecretVal = this.configService.get("auth.adminSecret");
    const role = createUserPayload.admin_secret && adminSecretVal === createUserPayload.admin_secret ? Role.ADMIN : Role.USER;

    delete createUserPayload.admin_secret;
    
    const user = await this.prisma.user.create({ data: { ...createUserPayload, role, isVerified: true } }) as User;
    const { password, ...rest } = user;
    
    return {
      message: "Successfully created user",
      user: rest
    };
  };

  async retrieveUserRecords(email: string): Promise<{
    message: string,
    user: Partial<User>
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    if (!user) throw new UnauthorizedException("Invalid user credentials");

    return {
      message: "Successfully retrieved user",
      user
    };
  };
};