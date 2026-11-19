import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CourtsService } from "../courts/courts.service";
import { DbService } from "../db/db.service";
import { SettingsService } from "../settings/settings.service";
import type { JwtPayload } from "../auth/jwt.strategy";

const SLOT_HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

export type BookingRow = {
  id: string;
  member_id: string | null;
  guest_name: string;
  court_id: number;
  booking_date: Date;
  booking_time: string;
  status: string;
  payment_status: string;
  created_at: Date;
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: DbService,
    private readonly courts: CourtsService,
    private readonly settings: SettingsService,
  ) {}

  timeSlots() {
    return SLOT_HOURS;
  }

  async availability(date: string, time: string) {
    const maintenance = await this.courts.maintenanceSet();
    const { rows } = await this.db.query<{ court_id: number }>(
      `SELECT court_id FROM bookings
       WHERE booking_date = $1::date AND booking_time = $2 AND status = 'active'`,
      [date, time],
    );
    const taken = new Set(rows.map((r) => r.court_id));
    return [1, 2, 3, 4, 5, 6, 7, 8].map((id) => ({
      courtId: id,
      available: !maintenance.has(id) && !taken.has(id),
      inMaintenance: maintenance.has(id),
    }));
  }

  async create(
    user: JwtPayload | null,
    body: { date: string; time: string; courtId: number; guestName?: string },
  ) {
    const { guestBookingEnabled } = await this.settings.get();
    if (user?.aud === "staff") {
      throw new ForbiddenException("Staff accounts cannot create member bookings.");
    }
    if (!user && !guestBookingEnabled) {
      throw new ForbiddenException("Guest booking is disabled.");
    }
    const guestName = (body.guestName ?? "").trim();
    if (!user && !guestName) {
      throw new BadRequestException("guestName is required for guest bookings.");
    }
    if (!SLOT_HOURS.includes(body.time)) {
      throw new BadRequestException("Invalid time slot.");
    }
    const maintenance = await this.courts.maintenanceSet();
    if (maintenance.has(body.courtId)) {
      throw new BadRequestException("Court is in maintenance.");
    }

    const id = `bp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const label =
      guestName ||
      (user ? `+${user.dialCode} ${user.phone}` : "Guest");

    try {
      const { rows } = await this.db.query<BookingRow>(
        `INSERT INTO bookings (id, member_id, guest_name, court_id, booking_date, booking_time, status, payment_status)
         VALUES ($1, $2, $3, $4, $5::date, $6, 'active', 'awaiting_payment')
         RETURNING *`,
        [id, user?.aud === "member" ? user.sub : null, label, body.courtId, body.date, body.time],
      );
      return this.toPublic(rows[0]);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
        throw new ConflictException("This court and time slot is already booked.");
      }
      throw err;
    }
  }

  async mine(userId: string) {
    const { rows } = await this.db.query<BookingRow>(
      `SELECT * FROM bookings WHERE member_id = $1 AND status = 'active' ORDER BY booking_date, booking_time`,
      [userId],
    );
    return rows.map((r) => this.toPublic(r));
  }

  async adminList() {
    const { rows } = await this.db.query<BookingRow>(
      `SELECT * FROM bookings WHERE status = 'active' ORDER BY created_at DESC`,
    );
    return rows.map((r) => this.toPublic(r));
  }

  async cancel(user: JwtPayload, bookingId: string) {
    const { rows } = await this.db.query<BookingRow>(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
    if (rows.length === 0) throw new NotFoundException("Booking not found");
    const row = rows[0];
    const canAdmin = user.aud === "staff" && user.role === "admin";
    const isOwner = user.aud === "member" && row.member_id === user.sub;
    if (!canAdmin && !isOwner) throw new ForbiddenException();
    if (row.status === "cancelled") return this.toPublic(row);

    const { rows: updated } = await this.db.query<BookingRow>(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [bookingId],
    );
    return this.toPublic(updated[0]);
  }

  async dayOccupancy(date: string) {
    const { rows } = await this.db.query<{ court_id: number; booking_time: string }>(
      `SELECT court_id, booking_time FROM bookings
       WHERE booking_date = $1::date AND status = 'active'`,
      [date],
    );
    return rows.map((r) => ({ courtId: r.court_id, time: r.booking_time }));
  }

  private toPublic(row: BookingRow) {
    const date =
      row.booking_date instanceof Date
        ? row.booking_date.toISOString().slice(0, 10)
        : String(row.booking_date).slice(0, 10);
    return {
      id: row.id,
      date,
      time: row.booking_time,
      courtId: row.court_id,
      guestLabel: row.guest_name,
      status: row.status,
      paymentStatus: row.payment_status,
      createdAt: row.created_at.toISOString(),
      memberId: row.member_id,
    };
  }
}