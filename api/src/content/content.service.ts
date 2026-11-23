import { Injectable } from "@nestjs/common";
import { DbService } from "../db/db.service";

@Injectable()
export class ContentService {
  constructor(private readonly db: DbService) {}

  async getSite() {
    const { rows } = await this.db.query<{ payload: unknown }>(`SELECT payload FROM site_content WHERE id = 1`);
    return rows[0]?.payload ?? {};
  }

  async putSite(payload: unknown) {
    await this.db.query(`UPDATE site_content SET payload = $1::jsonb WHERE id = 1`, [JSON.stringify(payload)]);
    return payload;
  }

  async getFacility() {
    const { rows } = await this.db.query<{ payload: unknown }>(`SELECT payload FROM facility_content WHERE id = 1`);
    return rows[0]?.payload ?? {};
  }

  async putFacility(payload: unknown) {
    await this.db.query(`UPDATE facility_content SET payload = $1::jsonb WHERE id = 1`, [JSON.stringify(payload)]);
    return payload;
  }

  async listEvents() {
    const { rows } = await this.db.query<{ id: string; payload: unknown }>(
      `SELECT id, payload FROM content_catalog WHERE kind = 'event' ORDER BY id`,
    );
    return rows.map((r) => ({ id: r.id, ...((r.payload as object) ?? {}) }));
  }

  async listNews() {
    const { rows } = await this.db.query<{ id: string; payload: unknown }>(
      `SELECT id, payload FROM content_catalog WHERE kind = 'news' ORDER BY id`,
    );
    return rows.map((r) => ({ id: r.id, ...((r.payload as object) ?? {}) }));
  }
}