import type {
  SavedNotebook,
  UpdateSavedNotebookData,
} from "@/db/savedNotebooksRepository";

import { dbApiClient } from "@/api/local/dbApiClient";

const url = "/user-nb";

export async function fetchSavedNotebooks(): Promise<SavedNotebook[]> {
  const res = await dbApiClient.get<SavedNotebook[]>(url);

  return res.data;
}

export async function fetchSavedNotebookByServerName(servername: string): Promise<SavedNotebook | null> {
  const params = new URLSearchParams({ name: servername });
  const res = await dbApiClient.get<SavedNotebook | null>(`${url}?${params.toString()}`);

  return res.data;
}

export async function createOrUpdateSavedNotebookByServerName(
  servername: string,
  data: UpdateSavedNotebookData
): Promise<SavedNotebook> {

  const res = await dbApiClient.post<SavedNotebook>(url, { name: servername, ...data });

  return res.data;
}

export async function deleteSavedNotebookByServerName(
  name: string,
): Promise<{ success: boolean }> {
  const params = new URLSearchParams({ name });
  const res = await dbApiClient.delete<{ success: boolean }>(`${url}?${params.toString()}`);

  return res.data;
}
