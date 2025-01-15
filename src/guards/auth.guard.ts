import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext):Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;
    if (!authorization || !authorization.startsWith("Bearer "))
      throw new UnauthorizedException("Invalid Token");

    const token = authorization.split(" ")[1];

    try {
      const decoded = await this.jwtService.verifyAsync(token);
      if (!decoded.isVerified) throw new UnauthorizedException("User is unverified")
      request.user = decoded;
    } catch {
      throw new UnauthorizedException("Unauthorized user");
    }
    return true;
  };
};