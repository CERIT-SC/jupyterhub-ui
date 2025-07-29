export class ClientStorage<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  save(data: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${this.key} to localStorage:`, error);
    }
  }

  load(): T | null {
    try {
      const stored = localStorage.getItem(this.key);

      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Failed to load ${this.key} from localStorage:`, error);

      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  exists(): boolean {
    return localStorage.getItem(this.key) !== null;
  }
}
