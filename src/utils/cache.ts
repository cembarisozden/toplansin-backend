import NodeCache from "node-cache";

export const cache = new NodeCache({
  stdTTL: 60,          // Varsayılan TTL (saniye)
  checkperiod: 120,    // Temizlik kontrol süresi
});


export const cacheOrFetch = async <T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> => {
  const cached = cache.get<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
};

export const clearCache = (key: string) => {
  cache.del(key);
};