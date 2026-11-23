import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DbService } from "../db/db.service";

export type JwtPayload = {
  sub: string;
  dialCode: string;
  phone: string;
  aud: "member" | "staff";
  role: "member" | "admin" | "staff";
};

type JwtClaims = JwtPayload & { aud?: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "bold-dev-jwt-change-me",
    });
  }

  async validate(payload: JwtClaims): Promise<JwtPayload> {
    const aud = payload.aud === "staff" ? "staff" : payload.aud === "member" ? "member" : null;
    if (!aud) throw new UnauthorizedException("Invalid token audience");

    if (aud === "member") {
      const { rows } = await this.db.query<{ id: string }>(`SELECT id FROM members WHERE id = $1`, [payload.sub]);
      if (rows.length === 0) throw new UnauthorizedException();
      return {
        sub: rows[0].id,
        dialCode: payload.dialCode,
        phone: payload.phone,
        aud: "member",
        role: "member",
      };
    }

    const { rows } = await this.db.query<{ id: string; role: string }>(
      `SELECT id, role FROM staff WHERE id = $1`,
      [payload.sub],
    );
    if (rows.length === 0) throw new UnauthorizedException();
    const role = rows[0].role === "admin" ? "admin" : "staff";
    return {
      sub: rows[0].id,
      dialCode: payload.dialCode,
      phone: payload.phone,
      aud: "staff",
      role,
    };
  }
}