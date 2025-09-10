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

export async function getNotebookByServerNameForCurrentUser(
  servername: string,
): Promise<SavedNotebook | null> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.findByServerNameForUser(servername, user.name);
}

export async function createNotebookForCurrentUser(
  data: CreateSavedNotebookData,
): Promise<SavedNotebook> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.create(user.name, data);
}

export async function updateNotebookForCurrentUser(
  servername: string,
  data: UpdateSavedNotebookData,
): Promise<SavedNotebook | null> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.updateForUserByServerName(servername, user.name, data);
}

export async function deleteNotebookForCurrentUser(servername: string): Promise<void> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  const success = await savedNotebooksRepository.deleteForUserByServerName(servername, user.name);

  if (!success) {
    throw new Error(`Notebook with name ${servername} not found or not owned by user`);
  }
}

export async function deleteAllNotebooksForCurrentUser(): Promise<number> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return savedNotebooksRepository.deleteByUserId(user.name);
}
