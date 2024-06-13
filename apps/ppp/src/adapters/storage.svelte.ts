import type { SyncStorage } from "@/shared";

export interface StorageState<T> {
  value: T;
}

export function reactive<T>(storage: SyncStorage<T>): StorageState<T> {
  let value = $state(storage.load());
  return {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
      storage.save(newValue);
    },
  };
}
