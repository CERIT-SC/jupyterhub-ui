import {
  notebookPresetsRepository,
  CreateNotebookPresetData,
  UpdateNotebookPresetData,
  NotebookPreset,
} from "@/db/notebooksPresetsRepository";

export async function getPresets(userId: string): Promise<NotebookPreset[]> {
  return notebookPresetsRepository.findByUserId(userId);
}

export async function getPresetById(
  userId: string,
  id: number,
): Promise<NotebookPreset | null> {

  return notebookPresetsRepository.findByIdForUser(id, userId);
}

export async function createPreset(
  userId: string,
  data: CreateNotebookPresetData,
): Promise<NotebookPreset> {
  return notebookPresetsRepository.create(userId, data);
}

export async function updatePreset(
  userId: string,
  id: number,
  data: UpdateNotebookPresetData,
): Promise<NotebookPreset | null> {
  return notebookPresetsRepository.updateForUser(id, userId, data);
}

export async function deletePreset(userId: string, id: number): Promise<void> {
  const success = await notebookPresetsRepository.deleteForUser(id, userId);

  if (!success) {
    throw new Error(`Preset with id ${id} not found or not owned by user`);
  }
}

export async function deleteAllPresets(userId: string): Promise<number> {
  return notebookPresetsRepository.deleteByUserId(userId);
}
