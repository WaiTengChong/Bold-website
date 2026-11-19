import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Audience, AudienceGuard, JwtAuthGuard, Roles } from "../auth/auth.guards";
import { assertValidEmail, memberToPublic, type MemberRow } from "../auth/member-profile";
import { RolesGuard } from "../auth/roles.guard";
import { CourtsService } from "../courts/courts.service";
import { DbService } from "../db/db.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, AudienceGuard, RolesGuard)
@Audience("staff")
@Roles("staff")
export class AdminController {
  constructor(
    private readonly db: DbService,
    private readonly courts: CourtsService,
  ) {}

  @Get("members")
  async members() {
    const { rows } = await this.db.query<MemberRow>(`SELECT * FROM members ORDER BY created_at DESC`);
    return rows.map((r) => memberToPublic(r));
  }

  @Get("staff")
  @Roles("admin")
  async staffList() {
    const { rows } = await this.db.query<{
      id: string;
      dial_code: string;
      phone: string;
      surname: string;
      given_name: string;
      email: string;
      role: string;
      created_at: Date;
    }>(`SELECT id, dial_code, phone, surname, given_name, email, role, created_at FROM staff ORDER BY created_at DESC`);
    return rows.map((r) => ({
      id: r.id,
      dialCode: r.dial_code,
      phone: r.phone,
      surname: r.surname,
      givenName: r.given_name,
      email: r.email,
      role: r.role === "admin" ? "admin" : "staff",
      createdAt: r.created_at.toISOString(),
    }));
  }

  @Post("staff")
  @Roles("admin")
  async createStaff(
    @Body()
    body: {
      dialCode: string;
      phone: string;
      password: string;
      surname: string;
      givenName: string;
      email: string;
      role?: "admin" | "staff";
    },
  ) {
    const dialCode = (body.dialCode ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const password = body.password ?? "";
    const surname = (body.surname ?? "").trim();
    const givenName = (body.givenName ?? "").trim();
    const email = (body.email ?? "").trim();
    if (!dialCode || !phone || password.length < 8) {
      throw new BadRequestException("Dial code, phone, and password (min 8 chars) are required.");
    }
    if (!surname || !givenName) throw new BadRequestException("Name is required.");
    if (!email) throw new BadRequestException("Email is required.");
    try {
      assertValidEmail(email);
    } catch {
      throw new BadRequestException("Invalid email address.");
    }
    const role = body.role === "admin" ? "admin" : "staff";

    const memberExists = await this.db.query(`SELECT 1 FROM members WHERE dial_code = $1 AND phone = $2`, [
      dialCode,
      phone,
    ]);
    if (memberExists.rows.length > 0) {
      throw new ConflictException("This phone number is registered to a member account.");
    }

    const hash = await bcrypt.hash(password, 10);
    try {
      const { rows } = await this.db.query<{
        id: string;
        dial_code: string;
        phone: string;
        surname: string;
        given_name: string;
        email: string;
        role: string;
        created_at: Date;
      }>(
        `INSERT INTO staff (dial_code, phone, password_hash, surname, given_name, email, role)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id, dial_code, phone, surname, given_name, email, role, created_at`,
        [dialCode, phone, hash, surname, givenName, email, role],
      );
      const r = rows[0];
      return {
        id: r.id,
        dialCode: r.dial_code,
        phone: r.phone,
        surname: r.surname,
        givenName: r.given_name,
        email: r.email,
        role: r.role === "admin" ? "admin" : "staff",
        createdAt: r.created_at.toISOString(),
      };
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
        throw new ConflictException("A staff account with this phone number already exists.");
      }
      throw err;
    }
  }

  @Patch("courts/:id/maintenance")
  setMaintenance(@Param("id") id: string, @Body() body: { inMaintenance: boolean }) {
    const courtId = Number.parseInt(id, 10);
    return this.courts.setMaintenance(courtId, Boolean(body.inMaintenance));
  }

  /** Optional: accept base64/data URL images under 200KB — stored inline in CMS payload */
  @Post("media")
  uploadMedia(@Body() body: { dataUrl: string; maxBytes?: number }) {
    const max = body.maxBytes ?? 200_000;
    if (!body.dataUrl?.startsWith("data:image/")) {
      return { ok: false, error: "Choose an image file" };
    }
    if (body.dataUrl.length > max * 1.4) {
      return { ok: false, error: "Image must be under 200KB for this demo store" };
    }
    return { ok: true, src: body.dataUrl };
  }
}