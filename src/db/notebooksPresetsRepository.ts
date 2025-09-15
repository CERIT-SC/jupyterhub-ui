import { console } from "inspector";

import { eq, and } from "drizzle-orm";

import { db } from "./client";
import { notebookPresets } from "./schema";

// Infer types from schema using new Drizzle syntax
export type NotebookPreset = typeof notebookPresets.$inferSelect;
export type CreateNotebookPresetData = Omit<
  typeof notebookPresets.$inferInsert,
  "createdAt" | "updatedAt" | "id" | "userId"
>;
export type UpdateNotebookPresetData = Partial<CreateNotebookPresetData>;

export class NotebookPresetsRepository {
  async findByIdForUser(
    id: number,
    userId: string,
  ): Promise<NotebookPreset | null> {
    console.log("####### findByIdForUser called with:", { id, userId });
    const result = await db
      .select()
      .from(notebookPresets)
      .where(
        and(eq(notebookPresets.id, id), eq(notebookPresets.userId, userId)),
      );

    console.log("####### findByIdForUser:", { id, userId, result });

    return result[0] || null;
  }

  async findByUserId(userId: string): Promise<NotebookPreset[]> {
    return db
      .select()
      .from(notebookPresets)
      .where(eq(notebookPresets.userId, userId));
  }

  async get(id: number, userId: string): Promise<NotebookPreset[]> {
    return db
      .select()
      .from(notebookPresets)
      .where(
        and(eq(notebookPresets.id, id), eq(notebookPresets.userId, userId)),
      );
  }

  async create(
    userId: string,
    data: CreateNotebookPresetData,
  ): Promise<NotebookPreset> {
    const now = new Date();

    const result = await db
      .insert(notebookPresets)
      .values({
        userId: userId,
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return result[0];
  }

  async updateForUser(
    id: number,
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

  async deleteForUser(id: number, userId: string): Promise<boolean> {
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
