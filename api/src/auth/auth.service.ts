import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { DbService } from "../db/db.service";
import type { JwtPayload } from "./jwt.strategy";
import {
  assertValidEmail,
  assertValidIsoDate,
  memberToPublic,
  parseGender,
  type MemberRow,
  type PreferredLanguage,
} from "./member-profile";

export type SignupBody = {
  dialCode: string;
  phone: string;
  password: string;
  surname: string;
  givenName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  preferredLanguage?: PreferredLanguage;
  consentEmail?: boolean;
  consentWhatsapp?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  role?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly jwt: JwtService,
  ) {}

  async memberSignup(body: SignupBody) {
    if (body.role && body.role !== "member") {
      throw new BadRequestException("Public signup creates member accounts only.");
    }
    const surname = (body.surname ?? "").trim();
    const givenName = (body.givenName ?? "").trim();
    const email = (body.email ?? "").trim();
    if (!surname) throw new BadRequestException("Surname is required.");
    if (!givenName) throw new BadRequestException("Given name is required.");
    if (!body.dateOfBirth) throw new BadRequestException("Date of birth is required.");
    try {
      assertValidIsoDate(body.dateOfBirth);
    } catch {
      throw new BadRequestException("Invalid date of birth.");
    }
    const gender = parseGender(body.gender);
    if (!gender) throw new BadRequestException("Gender is required.");
    if (!email) throw new BadRequestException("Email is required.");
    try {
      assertValidEmail(email);
    } catch {
      throw new BadRequestException("Invalid email address.");
    }

    const dialCode = (body.dialCode ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const password = body.password ?? "";
    if (!dialCode || !phone || password.length < 8) {
      throw new BadRequestException("Phone and password (min 8 chars) are required.");
    }

    const staffExists = await this.db.query(`SELECT 1 FROM staff WHERE dial_code = $1 AND phone = $2`, [
      dialCode,
      phone,
    ]);
    if (staffExists.rows.length > 0) {
      throw new ConflictException("This phone number is registered to a staff account.");
    }

    const hash = await bcrypt.hash(password, 10);
    const lang = body.preferredLanguage === "en" || body.preferredLanguage === "zh" ? body.preferredLanguage : null;

    try {
      const { rows } = await this.db.query<MemberRow>(
        `INSERT INTO members (
          dial_code, phone, password_hash, surname, given_name, date_of_birth, gender, email,
          preferred_language, consent_email, consent_whatsapp,
          emergency_contact_name, emergency_contact_phone
        ) VALUES ($1,$2,$3,$4,$5,$6::date,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *`,
        [
          dialCode,
          phone,
          hash,
          surname,
          givenName,
          body.dateOfBirth,
          gender,
          email,
          lang,
          Boolean(body.consentEmail),
          Boolean(body.consentWhatsapp),
          (body.emergencyContactName ?? "").trim() || null,
          (body.emergencyContactPhone ?? "").trim() || null,
        ],
      );
      return this.issueMemberToken(rows[0]);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
        throw new ConflictException("An account with this phone number already exists.");
      }
      throw err;
    }
  }

  async memberLogin(dialCode: string, phone: string, password: string) {
    const { rows } = await this.db.query<MemberRow>(
      `SELECT * FROM members WHERE dial_code = $1 AND phone = $2`,
      [dialCode, phone],
    );
    if (rows.length === 0) {
      throw new UnauthorizedException("Invalid phone number or password.");
    }
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) throw new UnauthorizedException("Invalid phone number or password.");
    return this.issueMemberToken(rows[0]);
  }

  async staffLogin(dialCode: string, phone: string, password: string) {
    const { rows } = await this.db.query<{
      id: string;
      dial_code: string;
      phone: string;
      password_hash: string;
      role: string;
      surname: string;
      given_name: string;
      email: string;
    }>(`SELECT * FROM staff WHERE dial_code = $1 AND phone = $2`, [dialCode, phone]);
    if (rows.length === 0) {
      throw new UnauthorizedException("Invalid phone number or password.");
    }
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) throw new UnauthorizedException("Invalid phone number or password.");
    return this.issueStaffToken(rows[0]);
  }

  async memberMe(memberId: string) {
    const { rows } = await this.db.query<MemberRow>(`SELECT * FROM members WHERE id = $1`, [memberId]);
    if (rows.length === 0) throw new UnauthorizedException();
    return { accountType: "member" as const, ...memberToPublic(rows[0]) };
  }

  async updateMemberProfile(
    memberId: string,
    patch: {
      surname?: string;
      givenName?: string;
      dateOfBirth?: string;
      gender?: string;
      email?: string;
      preferredLanguage?: PreferredLanguage | null;
      consentEmail?: boolean;
      consentWhatsapp?: boolean;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    },
  ) {
    const { rows: existing } = await this.db.query<MemberRow>(`SELECT * FROM members WHERE id = $1`, [memberId]);
    if (existing.length === 0) throw new NotFoundException();

    const surname = patch.surname !== undefined ? patch.surname.trim() : existing[0].surname;
    const givenName = patch.givenName !== undefined ? patch.givenName.trim() : existing[0].given_name;
    if (!surname || !givenName) throw new BadRequestException("Name fields cannot be empty.");

    let dateOfBirth = existing[0].date_of_birth;
    if (patch.dateOfBirth !== undefined) {
      try {
        assertValidIsoDate(patch.dateOfBirth);
      } catch {
        throw new BadRequestException("Invalid date of birth.");
      }
      dateOfBirth = new Date(`${patch.dateOfBirth}T12:00:00Z`);
    }

    let gender = existing[0].gender;
    if (patch.gender !== undefined) {
      const parsed = parseGender(patch.gender);
      if (!parsed) throw new BadRequestException("Invalid gender.");
      gender = parsed;
    }

    let email = existing[0].email;
    if (patch.email !== undefined) {
      email = patch.email.trim();
      if (!email) throw new BadRequestException("Email is required.");
      try {
        assertValidEmail(email);
      } catch {
        throw new BadRequestException("Invalid email address.");
      }
    }

    const preferredLanguage =
      patch.preferredLanguage === undefined
        ? existing[0].preferred_language
        : patch.preferredLanguage === null
          ? null
          : patch.preferredLanguage === "en" || patch.preferredLanguage === "zh"
            ? patch.preferredLanguage
            : existing[0].preferred_language;

    const consentEmail = patch.consentEmail ?? existing[0].consent_email;
    const consentWhatsapp = patch.consentWhatsapp ?? existing[0].consent_whatsapp;
    const emergencyContactName =
      patch.emergencyContactName !== undefined
        ? patch.emergencyContactName.trim() || null
        : existing[0].emergency_contact_name;
    const emergencyContactPhone =
      patch.emergencyContactPhone !== undefined
        ? patch.emergencyContactPhone.trim() || null
        : existing[0].emergency_contact_phone;

    const dobParam =
      dateOfBirth instanceof Date
        ? dateOfBirth.toISOString().slice(0, 10)
        : dateOfBirth
          ? String(dateOfBirth).slice(0, 10)
          : null;

    const { rows } = await this.db.query<MemberRow>(
      `UPDATE members SET
        surname = $2, given_name = $3, date_of_birth = $4::date, gender = $5, email = $6,
        preferred_language = $7, consent_email = $8, consent_whatsapp = $9,
        emergency_contact_name = $10, emergency_contact_phone = $11
       WHERE id = $1 RETURNING *`,
      [
        memberId,
        surname,
        givenName,
        dobParam,
        gender,
        email,
        preferredLanguage,
        consentEmail,
        consentWhatsapp,
        emergencyContactName,
        emergencyContactPhone,
      ],
    );
    return { accountType: "member" as const, ...memberToPublic(rows[0]) };
  }

  private issueMemberToken(row: MemberRow) {
    const payload: JwtPayload = {
      sub: row.id,
      dialCode: row.dial_code,
      phone: row.phone,
      aud: "member",
      role: "member",
    };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: {
        accountType: "member" as const,
        role: "member" as const,
        ...memberToPublic(row),
      },
    };
  }

  private issueStaffToken(row: {
    id: string;
    dial_code: string;
    phone: string;
    role: string;
    surname: string;
    given_name: string;
    email: string;
  }) {
    const role = row.role === "admin" ? "admin" : "staff";
    const payload: JwtPayload = {
      sub: row.id,
      dialCode: row.dial_code,
      phone: row.phone,
      aud: "staff",
      role,
    };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: {
        accountType: "staff" as const,
        dialCode: row.dial_code,
        phone: row.phone,
        role,
        surname: row.surname,
        givenName: row.given_name,
        email: row.email,
      },
    };
  }
}