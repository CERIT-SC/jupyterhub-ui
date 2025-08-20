import {
  notebookPresetsRepository,
  CreateNotebookPresetData,
  UpdateNotebookPresetData,
  NotebookPreset,
} from "@/db/notebooksPresetsRepository";
import { getUserIdentity } from "@/services/client/jupyterHub";

export async function getPresetsForCurrentUser(): Promise<NotebookPreset[]> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return notebookPresetsRepository.findByUserId(user.name);
}

export async function getPresetByIdForCurrentUser(
  id: string,
): Promise<NotebookPreset | null> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return notebookPresetsRepository.findByIdForUser(id, user.name);
}

export async function createPresetForCurrentUser(
  data: Omit<CreateNotebookPresetData, "userId">,
): Promise<NotebookPreset> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return notebookPresetsRepository.create({
    ...data,
    userId: user.name,
  });
}

export async function updatePresetForCurrentUser(
  id: string,
  data: UpdateNotebookPresetData,
): Promise<NotebookPreset | null> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return notebookPresetsRepository.updateForUser(id, user.name, data);
}

export async function deletePresetForCurrentUser(id: string): Promise<void> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  const success = await notebookPresetsRepository.deleteForUser(id, user.name);

  if (!success) {
    throw new Error(`Preset with id ${id} not found or not owned by user`);
  }
}

export async function deleteAllPresetsForCurrentUser(): Promise<number> {
  const user = await getUserIdentity();

  if (!user || !user.name) throw new Error("Not authenticated");

  return notebookPresetsRepository.deleteByUserId(user.name);
}
