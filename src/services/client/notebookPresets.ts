import { localApiClient } from "./localApiClient";

export async function fetchNotebookPresets(): Promise<any> {
  const res = await localApiClient.get("/api/db/user-nb-presets");

  return res.data;
}

export async function createNotebookPreset(data: any): Promise<any> {
  const res = await localApiClient.post("/api/db/user-nb-presets", data);

  return res.data;
}

export async function updateNotebookPreset(
  id: string,
  data: any,
): Promise<any> {
  const res = await localApiClient.put(`/api/db/user-nb-presets/${id}`, data);

  return res.data;
}

export async function deleteNotebookPreset(id: string): Promise<any> {
  const res = await localApiClient.delete(`/api/db/user-nb-presets/${id}`);

  return res.data;
}
