import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from "googleapis";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GoogleService {
  constructor(private configService: ConfigService, private prismaService: PrismaService, private jwtService: JwtService) {}

  private clientId = this.configService.get<string>("auth.google_client_id");
  private clientSecret = this.configService.get<string>("auth.google_oauth_secret");
  private callback_url = this.configService.get<string>("auth.google_callback_url");

  private oauth2Client = new google.auth.OAuth2(
    this.clientId,
    this.clientSecret,
    this.callback_url
  );

  getAuthUrl():string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"]
    });
  };

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
    const response = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const userInfo = await response.json();

    let user = await this.prismaService.user.findUnique({
      where: { email: userInfo.email },
    });
    

    if (!user && userInfo.email) {
      user = await this.prismaService.user.create({ data: {
        email: userInfo.email,
        isVerified: true,
        name: userInfo.name,
      }});
    } else if (!user.isVerified) throw new UnauthorizedException("User is not verified");

    const access_token = await this.jwtService.signAsync({ sub: user.id, isVerified: user.isVerified });
    const message = "Successful google authentication";

    return { message, data: user, access_token };
  }
}
