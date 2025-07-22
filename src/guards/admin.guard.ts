import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.sub;

    const admin = await this.prisma.user.findUnique({
      where: { id: userId, role: Role.ADMIN },
    });

    if (!admin) return false;
    else return true;
  }
}
