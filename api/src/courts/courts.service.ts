import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

@Injectable()
export class CourtsService {
  constructor(private readonly db: DbService) {}

  async listCourts() {
    const { rows } = await this.db.query<{ id: number; in_maintenance: boolean }>(
      `SELECT id, in_maintenance FROM courts ORDER BY id`,
    );
    return rows.map((r) => ({
      id: r.id,
      inMaintenance: r.in_maintenance,
    }));
  }

  async setMaintenance(courtId: number, inMaintenance: boolean) {
    await this.db.query(`UPDATE courts SET in_maintenance = $2 WHERE id = $1`, [courtId, inMaintenance]);
    return { id: courtId, inMaintenance };
  }

  async maintenanceSet(): Promise<Set<number>> {
    const { rows } = await this.db.query<{ id: number }>(
      `SELECT id FROM courts WHERE in_maintenance = true`,
    );
    return new Set(rows.map((r) => r.id));
  }
}