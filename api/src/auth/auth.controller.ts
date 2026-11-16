import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./auth.guards";
import type { JwtPayload } from "./jwt.strategy";

type SignBody = { dialCode: string; phone: string; password: string };

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup")
  signup(@Body() body: SignBody) {
    return this.auth.signup(body.dialCode, body.phone, body.password);
  }

  @Post("login")
  login(@Body() body: SignBody) {
    return this.auth.login(body.dialCode, body.phone, body.password);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout() {
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: JwtPayload }) {
    return this.auth.me(req.user.sub);
  }
}