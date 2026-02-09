export type Fetcher = (url: string) => Promise<Response>;

export function createCachedFetch(cache: Cache) {
  return async (url: string, init?: RequestInit) => {
    const request = new Request(url, init);
    const cached = await cache.match(request);
    if (cached) {
      return cached.clone();
    }
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  };
}

export async function cache(prefix: string, version: string) {
  const name = `${prefix}${version}`;
  for (const n of await caches.keys()) {
    if (n.startsWith(prefix) && n !== name) {
      await caches.delete(n);
    }
  }
  return await caches.open(name);
}
