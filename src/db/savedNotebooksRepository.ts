import { eq } from "drizzle-orm";

import { savedNotebooks } from "./schema";
import { db } from "./client";

export type SavedNotebook = typeof savedNotebooks.$inferSelect;
export type CreateSavedNotebookData = typeof savedNotebooks.$inferInsert;
export type UpdateSavedNotebookData = Partial<CreateSavedNotebookData>;

export class SavedNotebooksRepository {
  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<SavedNotebook | null> {
    const result = await db
      .select()
      .from(savedNotebooks)
      .where(eq(savedNotebooks.id, id) && eq(savedNotebooks.userId, userId))

      .limit(1);

    return result[0] || null;
  }

  async findByUserId(userId: string): Promise<SavedNotebook[]> {
    return db
      .select()
      .from(savedNotebooks)
      .where(eq(savedNotebooks.userId, userId));
  }

  async create(data: CreateSavedNotebookData): Promise<SavedNotebook> {
    const now = new Date();
    const result = await db
      .insert(savedNotebooks)
      .values({
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return result[0];
  }

  async updateForUser(
    id: string,
    userId: string,
    data: UpdateSavedNotebookData,
  ): Promise<SavedNotebook | null> {
    const now = new Date();
    const result = await db
      .update(savedNotebooks)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(savedNotebooks.id, id) && eq(savedNotebooks.userId, userId))
      .returning();

    return result[0] || null;
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(savedNotebooks)
      .where(eq(savedNotebooks.id, id) && eq(savedNotebooks.userId, userId));

    return result.changes > 0;
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await db
      .delete(savedNotebooks)
      .where(eq(savedNotebooks.userId, userId));

    return result.changes;
  }
}

export const savedNotebooksRepository = new SavedNotebooksRepository();
