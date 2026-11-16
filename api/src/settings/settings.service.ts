import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

@Injectable()
export class SettingsService {
  constructor(private readonly db: DbService) {}

  async get() {
    const { rows } = await this.db.query<{ guest_booking_enabled: boolean }>(
      `SELECT guest_booking_enabled FROM app_settings WHERE id = 1`,
    );
    return { guestBookingEnabled: rows[0]?.guest_booking_enabled ?? true };
  }

  async patch(guestBookingEnabled: boolean) {
    await this.db.query(`UPDATE app_settings SET guest_booking_enabled = $1 WHERE id = 1`, [
      guestBookingEnabled,
    ]);
    return { guestBookingEnabled };
  }
}