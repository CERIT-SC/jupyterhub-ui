import type {
  SavedNotebook,
  CreateSavedNotebookData,
  UpdateSavedNotebookData,
} from "@/db/savedNotebooksRepository";

import { dbApiClient } from "@/api/local/dbApiClient";

const url = "/user-saved-nb-presets";

export async function fetchSavedNotebooks(): Promise<SavedNotebook[]> {
  const res = await dbApiClient.get<SavedNotebook[]>(url);

  return res.data;
}

export async function createSavedNotebook(
  data: CreateSavedNotebookData,
): Promise<SavedNotebook> {
  const res = await dbApiClient.post<SavedNotebook>(url, data);

  return res.data;
}

export async function updateSavedNotebook(
  id: string,
  data: UpdateSavedNotebookData,
): Promise<SavedNotebook> {
  const res = await dbApiClient.put<SavedNotebook>(`${url}/${id}`, data);

  return res.data;
}

export async function deleteSavedNotebook(
  id: string,
): Promise<{ success: boolean }> {
  const res = await dbApiClient.delete<{ success: boolean }>(`${url}/${id}`);

  return res.data;
}
