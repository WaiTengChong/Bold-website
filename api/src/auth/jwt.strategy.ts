import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DbService } from "../db/db.service";

export type JwtPayload = {
  sub: string;
  dialCode: string;
  phone: string;
  role: "member" | "admin";
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "bold-dev-jwt-change-me",
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const { rows } = await this.db.query<{ id: string; role: string }>(
      `SELECT id, role FROM users WHERE id = $1`,
      [payload.sub],
    );
    if (rows.length === 0) throw new UnauthorizedException();
    return {
      sub: rows[0].id,
      dialCode: payload.dialCode,
      phone: payload.phone,
      role: rows[0].role === "admin" ? "admin" : "member",
    };
  }
}