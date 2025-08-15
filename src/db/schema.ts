import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { JupyterHubServerOptions } from "@/services/jupyterHub";

export const notebookPresets = sqliteTable(
  "notebook_presets",
  {
    id: text("id").primaryKey(),
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
  },
  (table) => ({
    userIdIndex: index("notebook_presets_user_id_idx").on(table.userId),
  }),
);

export const savedNotebooks = sqliteTable(
  "saved_notebooks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),

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
  },
  (table) => ({
    userIdIndex: index("notebook_presets_user_id_idx").on(table.userId),
  }),
);
