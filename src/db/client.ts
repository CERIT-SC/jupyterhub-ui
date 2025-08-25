import assert from "node:assert";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

assert(process.env.DB_FILE_NAME, "DB_FILE_NAME must be set in .env.local");

const sqlite = new Database(process.env.DB_FILE_NAME);

export const db = drizzle(sqlite);
