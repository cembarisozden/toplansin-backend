"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheOrFetch = exports.cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
exports.cache = new node_cache_1.default({
    stdTTL: 60, // Varsayılan TTL (saniye)
    checkperiod: 120, // Temizlik kontrol süresi
});
const cacheOrFetch = async (key, ttl, fetchFn) => {
    const cached = exports.cache.get(key);
    if (cached)
        return cached;
    const data = await fetchFn();
    exports.cache.set(key, data, ttl);
    return data;
};
exports.cacheOrFetch = cacheOrFetch;
const clearCache = (key) => {
    exports.cache.del(key);
};
exports.clearCache = clearCache;
//# sourceMappingURL=cache.js.map