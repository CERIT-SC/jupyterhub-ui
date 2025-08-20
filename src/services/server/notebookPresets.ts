import {
  notebookPresetsRepository,
  CreateNotebookPresetData,
  UpdateNotebookPresetData,
  NotebookPreset,
} from "@/db/notebooksPresetsRepository";
import { getUserIdentity } from "@/services/client/jupyterHub";

export class NotebookPresetsService {
  async getPresetsForCurrentUser(): Promise<NotebookPreset[]> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return notebookPresetsRepository.findByUserId(user.name as string);
  }

  async getPresetByIdForCurrentUser(
    id: string,
  ): Promise<NotebookPreset | null> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return notebookPresetsRepository.findByIdForUser(id, user.name as string);
  }

  async createPresetForCurrentUser(
    data: Omit<CreateNotebookPresetData, "userId">,
  ): Promise<NotebookPreset> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return notebookPresetsRepository.create({
      ...data,
      userId: user.name as string,
    });
  }

  async updatePresetForCurrentUser(
    id: string,
    data: UpdateNotebookPresetData,
  ): Promise<NotebookPreset | null> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    // Only update if preset belongs to user
    return notebookPresetsRepository.updateForUser(
      id,
      user.name as string,
      data,
    );
  }

  async deletePresetForCurrentUser(id: string): Promise<void> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    const success = await notebookPresetsRepository.deleteForUser(
      id,
      user.name as string,
    );

    if (!success) {
      throw new Error(`Preset with id ${id} not found or not owned by user`);
    }
  }

  async deleteAllPresetsForCurrentUser(): Promise<number> {
    const user = await getUserIdentity();

    if (!user || !user.name) throw new Error("Not authenticated");

    return notebookPresetsRepository.deleteByUserId(user.name as string);
  }
}

export const notebookPresetsService = new NotebookPresetsService();
