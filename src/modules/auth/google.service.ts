import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { IGoogleAuth } from "./interfaces/google-auth.interface";

@Injectable()
export class GoogleAuth implements IGoogleAuth {
  private readonly logger = new Logger(GoogleAuth.name);

  async verifyToken(
    token: string,
  ): Promise<{ email: string; firstName?: string; lastName?: string }> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`,
      );
      if (!response.ok) {
        throw new UnauthorizedException("Invalid Google token");
      }
      const data = await response.json();
      const { email, given_name, family_name } = data;
      if (!email) {
        throw new UnauthorizedException("Email not found in Google token");
      }
      return {
        email,
        firstName: given_name,
        lastName: family_name ?? given_name,
      };
    } catch (error) {
      this.logger.error("Error verifying Google token:", error);
      throw new UnauthorizedException("Failed to verify Google token");
    }
  }
}
