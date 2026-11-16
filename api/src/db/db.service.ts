import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, type QueryResultRow } from "pg";
import { closePool, getPool } from "../database/pool";

@Injectable()
export class DbService implements OnModuleDestroy {
  pool(): Pool {
    return getPool();
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
    return this.pool().query<T>(text, params);
  }

  async onModuleDestroy(): Promise<void> {
    await closePool();
  }
}