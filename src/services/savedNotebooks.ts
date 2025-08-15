import {
  savedNotebooksRepository,
  CreateSavedNotebookData,
  UpdateSavedNotebookData,
  SavedNotebook,
} from "@/db/savedNotebooksRepository";

export class SavedNotebooksService {
  async getAllNotebooks(): Promise<SavedNotebook[]> {
    return savedNotebooksRepository.findAll();
  }

  async getNotebookById(id: string): Promise<SavedNotebook | null> {
    return savedNotebooksRepository.findById(id);
  }

  async getNotebooksByUserId(userId: string): Promise<SavedNotebook[]> {
    return savedNotebooksRepository.findByUserId(userId);
  }

  async createNotebook(data: CreateSavedNotebookData): Promise<SavedNotebook> {
    return savedNotebooksRepository.create(data);
  }

  async updateNotebook(
    id: string,
    data: UpdateSavedNotebookData,
  ): Promise<SavedNotebook | null> {
    const existingNotebook = await savedNotebooksRepository.findById(id);

    if (!existingNotebook) {
      throw new Error(`Notebook with id ${id} not found`);
    }

    return savedNotebooksRepository.update(id, data);
  }

  async deleteNotebook(id: string): Promise<void> {
    const success = await savedNotebooksRepository.delete(id);

    if (!success) {
      throw new Error(`Notebook with id ${id} not found`);
    }
  }

  async deleteAllUserNotebooks(userId: string): Promise<number> {
    return savedNotebooksRepository.deleteByUserId(userId);
  }
}

export const savedNotebooksService = new SavedNotebooksService();
