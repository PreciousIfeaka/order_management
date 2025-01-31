import { Controller, Get, Res, Query, UseInterceptors, Redirect } from '@nestjs/common';
import { GoogleService } from './google.service';
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

@ApiTags("GoogleAuth")
@Controller("/auth/google")
export class GoogleController {
  constructor(private readonly googleAuthService: GoogleService) {}

  @ApiOperation({ summary: 'Redirect to Google OAuth2 login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth2 login page' })
  @Get("")
  @Redirect()
  async googleAuth(@Res() res: Response) {
    const authUrl = this.googleAuthService.getAuthUrl();
    return { url: authUrl, statusCode: 302 }
  }

  @ApiOperation({ summary: 'Handle Google OAuth2 callback' })
  @ApiQuery({ name: 'code', description: 'Authorization code from Google' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens' })
  @Get("/callback")
  async googleAuthCallback(@Query("code") code: string) {
    const user = await this.googleAuthService.getTokens(code);
    return { user };
  }
}
