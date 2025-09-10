import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { JupyterHubServerOptions } from "@/services/client/jupyterHub";

export const notebookPresets = sqliteTable("notebook_presets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  name: text("name"),
  description: text("description"),

  // Metadata

  // ServerOptions as JSON
  serverOptions: text("server_options", {
    mode: "json",
  }).$type<Partial<JupyterHubServerOptions>>(),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const savedNotebooks = sqliteTable("saved_notebooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  name: text("name").notNull().unique(),

  // ServerOptions as JSON
  serverOptions: text("server_options", {
    mode: "json",
  }).$type<JupyterHubServerOptions>(),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});
