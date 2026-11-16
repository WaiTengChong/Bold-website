import { ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

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

export const ROLES_KEY = "roles";
export const Roles = (...roles: ("member" | "admin")[]) => SetMetadata(ROLES_KEY, roles);