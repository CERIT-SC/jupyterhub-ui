import {
  savedNotebooksRepository,
  CreateSavedNotebookData,
  UpdateSavedNotebookData,
  SavedNotebook,
} from "@/db/savedNotebooksRepository";

export async function getNotebooks(userId: string): Promise<SavedNotebook[]> {
  return savedNotebooksRepository.findByUserId(userId);
}

export async function getNotebookByServerName(
  userId: string,
  servername: string,
): Promise<SavedNotebook | null> {
  return savedNotebooksRepository.findByServerNameForUser(servername, userId);
}

export async function createNotebook(
  userId: string,
  data: CreateSavedNotebookData,
): Promise<SavedNotebook> {

  return savedNotebooksRepository.create(userId, data);
}

export async function updateNotebook(
  userId: string,
  servername: string,
  data: UpdateSavedNotebookData,
): Promise<SavedNotebook | null> {

  return savedNotebooksRepository.updateForUserByServerName(servername, userId, data);
}

export async function deleteNotebook(userId: string, servername: string): Promise<void> {
  const success = await savedNotebooksRepository.deleteForUserByServerName(servername, userId);

  if (!success) {
    throw new Error(`Notebook with name ${servername} not found or not owned by user`);
  }
}

export async function deleteAllNotebooks(userId: string): Promise<number> {

  return savedNotebooksRepository.deleteByUserId(userId);
}
