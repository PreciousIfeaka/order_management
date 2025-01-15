import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthResponseDto } from "./dtos/authResponse.dto";
import { RegisterUserDto } from "./dtos/register-user.dto";

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async createAccount(payload: RegisterUserDto): Promise<AuthResponseDto> {
    const { message, user } = await this.userService.createUser(payload);
    const access_token = await this.jwtService.signAsync({ sub: user.id, isVerified: user.isVerified });

    return {
      message,
      data: user,
      access_token
    }
  };

  async signIn(email: string, password: string): Promise<AuthResponseDto> {
    const { user } = await this.userService.retrieveUserRecords(email);
    if (!user.isVerified) throw new UnauthorizedException("User account is not verified");

    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword) throw new UnauthorizedException("Invalid user credentials");

    const access_token = await this.jwtService.signAsync({ sub: user.id, isVerified: user.isVerified });

    delete user.password;

    return {
      message: "Successful user signin",
      data: user,
      access_token
    };
  };
}