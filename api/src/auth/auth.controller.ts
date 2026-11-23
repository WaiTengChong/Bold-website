import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Audience, AudienceGuard, JwtAuthGuard } from "./auth.guards";
import { AuthService, type SignupBody } from "./auth.service";
import type { JwtPayload } from "./jwt.strategy";
import type { PreferredLanguage } from "./member-profile";

type PhoneLoginBody = { dialCode: string; phone: string; password: string };

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup")
  signup(@Body() body: SignupBody) {
    return this.auth.memberSignup(body);
  }

  @Post("login")
  login(@Body() body: PhoneLoginBody) {
    return this.auth.memberLogin(body.dialCode, body.phone, body.password);
  }

  @Post("staff/login")
  staffLogin(@Body() body: PhoneLoginBody) {
    return this.auth.staffLogin(body.dialCode, body.phone, body.password);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout() {
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, AudienceGuard)
  @Audience("member")
  me(@Req() req: Request & { user: JwtPayload }) {
    return this.auth.memberMe(req.user.sub);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard, AudienceGuard)
  @Audience("member")
  patchMe(
    @Req() req: Request & { user: JwtPayload },
    @Body()
    body: {
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
    return this.auth.updateMemberProfile(req.user.sub, body);
  }
}