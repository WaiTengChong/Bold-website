import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles } from "../auth/auth.guards";
import { RolesGuard } from "../auth/roles.guard";
import { CourtsService } from "../courts/courts.service";
import { DbService } from "../db/db.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    private readonly db: DbService,
    private readonly courts: CourtsService,
  ) {}

  @Get("members")
  async members() {
    const { rows } = await this.db.query<{
      id: string;
      dial_code: string;
      phone: string;
      role: string;
      created_at: Date;
    }>(`SELECT id, dial_code, phone, role, created_at FROM users ORDER BY created_at DESC`);
    return rows.map((r) => ({
      id: r.id,
      dialCode: r.dial_code,
      phone: r.phone,
      role: r.role === "admin" ? "admin" : "member",
      createdAt: r.created_at.toISOString(),
    }));
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