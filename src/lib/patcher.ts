export function patch<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
  const originalValue = obj[key];
  obj[key] = value;
  return () => {
    obj[key] = originalValue;
  };
}
