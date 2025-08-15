import { eq } from "drizzle-orm";

import { db } from "./client";
import { notebookPresets } from "./schema";

import { JupyterHubServerOptions } from "@/services/jupyterHub";

export interface NotebookPreset {
  id: string;
  userId: string | null;
  name: string | null;
  description: string | null;
  serverOptions: Partial<JupyterHubServerOptions> | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CreateNotebookPresetData {
  userId: string;
  name: string;
  description?: string;
  serverOptions?: Partial<JupyterHubServerOptions>;
}

export interface UpdateNotebookPresetData {
  name?: string;
  description?: string;
  serverOptions?: Partial<JupyterHubServerOptions>;
}

export class NotebookPresetsRepository {
  async findAll(): Promise<NotebookPreset[]> {
    return db.select().from(notebookPresets);
  }

  async findById(id: string): Promise<NotebookPreset | null> {
    const result = await db
      .select()
      .from(notebookPresets)
      .where(eq(notebookPresets.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findByUserId(userId: string): Promise<NotebookPreset[]> {
    return db
      .select()
      .from(notebookPresets)
      .where(eq(notebookPresets.userId, userId));
  }

  async create(data: CreateNotebookPresetData): Promise<NotebookPreset> {
    const now = new Date();
    const result = await db
      .insert(notebookPresets)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return result[0];
  }

  async update(
    id: string,
    data: UpdateNotebookPresetData,
  ): Promise<NotebookPreset | null> {
    const now = new Date();
    const result = await db
      .update(notebookPresets)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(notebookPresets.id, id))
      .returning();

    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(notebookPresets)
      .where(eq(notebookPresets.id, id));

    return result.changes > 0;
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await db
      .delete(notebookPresets)
      .where(eq(notebookPresets.userId, userId));

    return result.changes;
  }
}

export const notebookPresetsRepository = new NotebookPresetsRepository();
