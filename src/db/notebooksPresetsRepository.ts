import { randomBytes } from "crypto";

import { eq, and } from "drizzle-orm";

import { db } from "./client";
import { notebookPresets } from "./schema";

// Infer types from schema using new Drizzle syntax
export type NotebookPreset = typeof notebookPresets.$inferSelect;
export type CreateNotebookPresetData = typeof notebookPresets.$inferInsert;
export type UpdateNotebookPresetData = Partial<CreateNotebookPresetData>;

export class NotebookPresetsRepository {
  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<NotebookPreset | null> {
    const result = await db
      .select()
      .from(notebookPresets)
      .where(
        and(eq(notebookPresets.id, id), eq(notebookPresets.userId, userId)),
      )
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
    let attempt = 0;

    while (attempt < 5) {
      try {
        const result = await db
          .insert(notebookPresets)
          .values({
            ...data,
            id: randomBytes(16).toString("hex"),
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return result[0];
      } catch (err: any) {
        // If unique constraint failed, retry
        if (err && err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
          attempt++;
          continue;
        }
        throw err;
      }
    }
    throw new Error(
      "Failed to generate a unique ID for notebook preset after 5 attempts",
    );
  }

  async updateForUser(
    id: string,
    userId: string,
    data: UpdateNotebookPresetData,
  ): Promise<NotebookPreset | null> {
    const now = new Date();

    const result = await db
      .update(notebookPresets)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(
        and(eq(notebookPresets.id, id), eq(notebookPresets.userId, userId)),
      )
      .returning();

    return result[0] || null;
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notebookPresets)
      .where(
        and(eq(notebookPresets.id, id), eq(notebookPresets.userId, userId)),
      );

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
