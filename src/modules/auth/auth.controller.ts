import { Body, Controller, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { LoginDto } from "./dtos/login.dto";
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AuthResponseDto } from "./dtos/authResponse.dto";


@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "User Registration" })
  @ApiResponse({
    status: 201,
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Validation error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status_code: { type: "number", example: 400 },
            message: { type: "array", items: { type: "string" }, example: ["email must be an email"] },
            success: { type: "boolean", example: false },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "User already exists",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status_code: { type: "number", example: 409 },
            message: { type: "string", example: "User already exists." },
            success: { type: "boolean", example: false },
          },
        },
      },
    },
  })
  @Post("register")
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    return await this.authService.createAccount(registerUserDto)
  };

  @ApiOperation({ summary: "User Login" })
  @ApiResponse({
    status: 200,
    description: "User successfully logged in",
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid user credentials or account not verified",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status_code: { type: "number", example: 401 },
            message: { type: "string", example: "Invalid user credentials" },
            success: { type: "boolean", example: false },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Validation error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status_code: { type: "number", example: 400 },
            message: { type: "array", items: { type: "string" }, example: ["password must be a string"] },
            success: { type: "boolean", example: false },
          },
        },
      },
    },
  })
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.signIn(loginDto.email, loginDto.password);
  };

  @ApiOperation({ summary: "Google Auth" })
  @ApiResponse({
    status: 200,
    description: "User successfully signed in with Google",
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid token",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status_code: { type: "number", example: 401 },
            message: { type: "string", example: "Invalid token" },
            success: { type: "boolean", example: false },
          },
        },
      },
    },
  })
  @Post("google-auth")
  async googleSignIn(@Query("token") token: string) {
    return await this.authService.handleSocialAuth(token);
  }
}