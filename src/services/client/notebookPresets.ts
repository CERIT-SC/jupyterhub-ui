import type {
  NotebookPreset,
  CreateNotebookPresetData,
  UpdateNotebookPresetData,
} from "@/db/notebooksPresetsRepository";

import { dbApiClient } from "@/api/local/dbApiClient";

const url = "user-nb-presets";

export async function fetchNotebookPresets(): Promise<NotebookPreset[]> {
  const res = await dbApiClient.get<NotebookPreset[]>(url);

  return res.data;
}

export async function fetchNotebookPresetById(id: number
): Promise<NotebookPreset | null> {
  const params = new URLSearchParams({ id: id.toString() });
  const res = await dbApiClient.get<NotebookPreset | null>(`${url}?${params.toString()}`);

  return res.data;
}

export async function createNotebookPreset(
  data: CreateNotebookPresetData,
): Promise<NotebookPreset> {
  const res = await dbApiClient.post<NotebookPreset>(url, data);

  return res.data;
}

export async function updateNotebookPreset(
  id: number,
  data: UpdateNotebookPresetData,
): Promise<UpdateNotebookPresetData> {
  const params = new URLSearchParams({ id: id.toString() });
  const res = await dbApiClient.put<UpdateNotebookPresetData>(
    `${url}?${params.toString()}`,
    data,
  );

  return res.data;
}

export async function deleteNotebookPreset(
  id: number,
): Promise<{ success: boolean }> {
  const res = await dbApiClient.delete<{ success: boolean }>(`${url}/${id}`);

  return res.data;
}
