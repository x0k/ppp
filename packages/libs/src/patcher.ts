export function patch<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): Disposable {
  const originalValue = obj[key];
  obj[key] = value;
  return {
    [Symbol.dispose]: () => {
      obj[key] = originalValue;
    },
  };
}
