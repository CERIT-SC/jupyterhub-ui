import { eq } from "drizzle-orm";

import { savedNotebooks } from "./schema";
import { db } from "./client";

export type SavedNotebook = typeof savedNotebooks.$inferSelect;
export type CreateSavedNotebookData = Omit<typeof savedNotebooks.$inferInsert, "createdAt" | "updatedAt" | "userId" | "id">;
export type UpdateSavedNotebookData = Partial<Omit<CreateSavedNotebookData, "name">>;

export class SavedNotebooksRepository {
  async findByServerNameForUser(
    servername: string,
    userId: string,
  ): Promise<SavedNotebook | null> {
    const result = await db
      .select()
      .from(savedNotebooks)
      .where(eq(savedNotebooks.userId, userId) && eq(savedNotebooks.name, servername))
      .limit(1);

    return result[0] || null;
  }

  async findByUserId(userId: string): Promise<SavedNotebook[]> {
    return db
      .select()
      .from(savedNotebooks)
      .where(eq(savedNotebooks.userId, userId));
  }

  async get(userId: string, servername: string): Promise<SavedNotebook[]> {
    return db
      .select()
      .from(savedNotebooks)
      .where(eq(savedNotebooks.userId, userId) && eq(savedNotebooks.name, servername));
  }

  async create(userId: string, data: CreateSavedNotebookData): Promise<SavedNotebook> {
    const now = new Date();
    const result = await db
      .insert(savedNotebooks)
      .values({
        userId: userId,
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return result[0];
  }

  async updateForUserByServerName(
    servername: string,
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
      .where(eq(savedNotebooks.name, servername) && eq(savedNotebooks.userId, userId))
      .returning();

    return result[0] || null;
  }


  async deleteForUserByServerName(name: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(savedNotebooks)
      .where(eq(savedNotebooks.name, name) && eq(savedNotebooks.userId, userId));

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
