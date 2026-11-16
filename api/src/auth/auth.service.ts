import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { DbService } from "../db/db.service";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dialCode: string, phone: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    try {
      const { rows } = await this.db.query<{ id: string; role: string }>(
        `INSERT INTO users (dial_code, phone, password_hash, role)
         VALUES ($1, $2, $3, 'member')
         RETURNING id, role`,
        [dialCode, phone, hash],
      );
      return this.issueToken(rows[0].id, dialCode, phone, rows[0].role);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
        throw new ConflictException("An account with this phone number already exists.");
      }
      throw err;
    }
  }

  async login(dialCode: string, phone: string, password: string) {
    const { rows } = await this.db.query<{ id: string; password_hash: string; role: string }>(
      `SELECT id, password_hash, role FROM users WHERE dial_code = $1 AND phone = $2`,
      [dialCode, phone],
    );
    if (rows.length === 0) {
      throw new UnauthorizedException("Invalid phone number or password.");
    }
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) {
      throw new UnauthorizedException("Invalid phone number or password.");
    }
    return this.issueToken(rows[0].id, dialCode, phone, rows[0].role);
  }

  async me(userId: string) {
    const { rows } = await this.db.query<{ dial_code: string; phone: string; role: string }>(
      `SELECT dial_code, phone, role FROM users WHERE id = $1`,
      [userId],
    );
    if (rows.length === 0) throw new UnauthorizedException();
    return {
      dialCode: rows[0].dial_code,
      phone: rows[0].phone,
      role: rows[0].role === "admin" ? "admin" : "member",
    };
  }

  private issueToken(id: string, dialCode: string, phone: string, role: string) {
    const payload: JwtPayload = {
      sub: id,
      dialCode,
      phone,
      role: role === "admin" ? "admin" : "member",
    };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: { dialCode, phone, role: payload.role },
    };
  }
}