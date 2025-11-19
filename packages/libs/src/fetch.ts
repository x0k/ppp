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
