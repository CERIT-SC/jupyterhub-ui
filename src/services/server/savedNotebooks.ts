import {
  savedNotebooksRepository,
  CreateSavedNotebookData,
  UpdateSavedNotebookData,
  SavedNotebook,
} from "@/db/savedNotebooksRepository";
import { getUserIdentity } from "@/services/client/jupyterHub";

export class SavedNotebooksService {
  async getNotebooksForCurrentUser(): Promise<SavedNotebook[]> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return savedNotebooksRepository.findByUserId(user.name as string);
  }

  async getNotebookByIdForCurrentUser(
    id: string,
  ): Promise<SavedNotebook | null> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return savedNotebooksRepository.findByIdForUser(id, user.name as string);
  }

  async createNotebookForCurrentUser(
    data: Omit<CreateSavedNotebookData, "userId">,
  ): Promise<SavedNotebook> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return savedNotebooksRepository.create({
      ...data,
      userId: user.name as string,
    });
  }

  async updateNotebookForCurrentUser(
    id: string,
    data: UpdateSavedNotebookData,
  ): Promise<SavedNotebook | null> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return savedNotebooksRepository.updateForUser(
      id,
      user.name as string,
      data,
    );
  }

  async deleteNotebookForCurrentUser(id: string): Promise<void> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    const success = await savedNotebooksRepository.deleteForUser(
      id,
      user.name as string,
    );

    if (!success) {
      throw new Error(`Notebook with id ${id} not found or not owned by user`);
    }
  }

  async deleteAllNotebooksForCurrentUser(): Promise<number> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return savedNotebooksRepository.deleteByUserId(user.name as string);
  }
}

export const savedNotebooksService = new SavedNotebooksService();
