import { localApiClient } from "./localApiClient";

export async function fetchSavedNotebooks(): Promise<any> {
  const res = await localApiClient.get("/api/db/user-saved-nb-presets");

  return res.data;
}

export async function createSavedNotebook(data: any): Promise<any> {
  const res = await localApiClient.post("/api/db/user-saved-nb-presets", data);

  return res.data;
}

export async function updateSavedNotebook(id: string, data: any): Promise<any> {
  const res = await localApiClient.put(
    `/api/db/user-saved-nb-presets/${id}`,
    data,
  );

  return res.data;
}

export async function deleteSavedNotebook(id: string): Promise<any> {
  const res = await localApiClient.delete(
    `/api/db/user-saved-nb-presets/${id}`,
  );

  return res.data;
}
