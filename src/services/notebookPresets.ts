import {
  notebookPresetsRepository,
  CreateNotebookPresetData,
  UpdateNotebookPresetData,
  NotebookPreset,
} from "@/db/notebooksPresetsRepository";

export class NotebookPresetsService {
  async getAllPresets(): Promise<NotebookPreset[]> {
    return notebookPresetsRepository.findAll();
  }

  async getPresetById(id: string): Promise<NotebookPreset | null> {
    return notebookPresetsRepository.findById(id);
  }

  async getPresetsByUserId(userId: string): Promise<NotebookPreset[]> {
    return notebookPresetsRepository.findByUserId(userId);
  }

  async createPreset(data: CreateNotebookPresetData): Promise<NotebookPreset> {
    return notebookPresetsRepository.create(data);
  }

  async updatePreset(
    id: string,
    data: UpdateNotebookPresetData,
  ): Promise<NotebookPreset | null> {
    const existingPreset = await notebookPresetsRepository.findById(id);

    if (!existingPreset) {
      throw new Error(`Preset with id ${id} not found`);
    }

    return notebookPresetsRepository.update(id, data);
  }

  async deletePreset(id: string): Promise<void> {
    const success = await notebookPresetsRepository.delete(id);

    if (!success) {
      throw new Error(`Preset with id ${id} not found`);
    }
  }

  async deleteAllUserPresets(userId: string): Promise<number> {
    return notebookPresetsRepository.deleteByUserId(userId);
  }
}

export const notebookPresetsService = new NotebookPresetsService();
