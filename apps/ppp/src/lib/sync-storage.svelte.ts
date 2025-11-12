export interface SyncStorage<T> {
  load(): T
  save(data: T): void
  clear(): void
}

export function immediateSave<T>(storage: SyncStorage<T>, value: () => T) {
  $effect(() => {
    storage.save(value());
  });
}

export function debouncedSave<T>(
  storage: SyncStorage<T>,
  value: () => T,
  debounce: number
) {
  let callbackId: NodeJS.Timeout;
  $effect(() => {
    clearTimeout(callbackId);
    const newValue = value();
    callbackId = setTimeout(() => {
      storage.save(newValue);
    }, debounce);
    return () => {
      clearTimeout(callbackId);
    };
  });
}
