import {
  savedNotebooksRepository,
  CreateSavedNotebookData,
  UpdateSavedNotebookData,
  SavedNotebook,
} from "@/db/savedNotebooksRepository";
import { getUserIdentity } from "@/services/client/jupyterHub";

export async function getNotebooksForCurrentUser(): Promise<SavedNotebook[]> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.findByUserId(user.name);
}

export async function getNotebookByIdForCurrentUser(
  id: string,
): Promise<SavedNotebook | null> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.findByIdForUser(id, user.name);
}

export async function createNotebookForCurrentUser(
  data: Omit<CreateSavedNotebookData, "userId">,
): Promise<SavedNotebook> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.create({
    ...data,
    userId: user.name,
  });
}

export async function updateNotebookForCurrentUser(
  id: string,
  data: UpdateSavedNotebookData,
): Promise<SavedNotebook | null> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.updateForUser(id, user.name, data);
}

export async function deleteNotebookForCurrentUser(id: string): Promise<void> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  const success = await savedNotebooksRepository.deleteForUser(id, user.name);

  if (!success) {
    throw new Error(`Notebook with id ${id} not found or not owned by user`);
  }
}

export async function deleteAllNotebooksForCurrentUser(): Promise<number> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.deleteByUserId(user.name);
}
