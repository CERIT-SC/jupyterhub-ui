import assert from "assert";

import { defineConfig } from "drizzle-kit";

assert(process.env.DB_FILE_NAME, "DB_FILE_NAME must be set in .env.local");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME,
  },
});
