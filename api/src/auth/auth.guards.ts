import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { JwtPayload } from "./jwt.strategy";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const AUDIENCE_KEY = "audience";
export const Audience = (aud: "member" | "staff") => SetMetadata(AUDIENCE_KEY, aud);

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

@Injectable()
export class AudienceGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const aud = this.reflector.getAllAndOverride<"member" | "staff" | undefined>(AUDIENCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!aud) return true;
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;
    if (!user || user.aud !== aud) {
      throw new ForbiddenException(aud === "staff" ? "Staff access required" : "Member access required");
    }
    return true;
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const result = super.canActivate(context) as Promise<boolean> | boolean;
    if (result instanceof Promise) {
      return result.catch(() => true);
    }
    return result;
  }

  handleRequest<TUser>(_err: Error | null, user: TUser): TUser | null {
    return user ?? null;
  }
}

@Injectable()
export class OptionalMemberJwtAuthGuard extends OptionalJwtAuthGuard {
  handleRequest<TUser>(_err: Error | null, user: TUser | null): TUser | null {
    if (!user) return null;
    const payload = user as unknown as JwtPayload;
    if (payload.aud !== "member") return null;
    return user;
  }
}

export const ROLES_KEY = "roles";
export const Roles = (...roles: ("member" | "admin" | "staff")[]) => SetMetadata(ROLES_KEY, roles);