import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./auth.guards";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<("member" | "admin" | "staff")[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;
    if (!user) throw new ForbiddenException();

    const staffRole = user.aud === "staff" && (user.role === "admin" || user.role === "staff");
    const ok = roles.some((r) => {
      if (r === "member") return user.aud === "member";
      if (r === "staff") return staffRole;
      if (r === "admin") return user.aud === "staff" && user.role === "admin";
      return false;
    });
    if (!ok) throw new ForbiddenException("Insufficient permissions");
    return true;
  }
}