import type { SyncStorage } from "@/shared";

export function createSyncStorage<T>(
  storage: Storage,
  key: string,
  defaultValue: T
): SyncStorage<T> {
  return {
    load(): T {
      const stored = storage.getItem(key);
      if (stored === null) {
        return defaultValue;
      }
      return JSON.parse(stored);
    },
    save(data: T): void {
      storage.setItem(key, JSON.stringify(data));
    },
    clear(): void {
      storage.removeItem(key);
    },
  };
}
