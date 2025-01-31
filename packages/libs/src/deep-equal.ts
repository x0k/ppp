import { isObject } from './object.js';

export function isDeepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }
  if (isObject(a) && isObject(b)) {
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) {
        return false;
      }
      const { length } = a;
      if (length !== b.length) {
        return false;
      }
      for (let i = length; i-- !== 0; ) {
        if (!isDeepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    if (Array.isArray(b)) {
      return false;
    }
    const aKeys = Object.keys(a);
    let key;
    for (let i = aKeys.length; i-- !== 0; ) {
      key = aKeys[i]!;
      if (
        !isDeepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      ) {
        return false;
      }
    }
    return Object.keys(b).length === aKeys.length;
  }
  return a !== a && b !== b;
}
