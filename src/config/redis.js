import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  enableOfflineQueue: true,
  lazyConnect: true,
});

redis.on("connect", () => {
  console.log("[Redis] Connected successfully to Redis server.");
});

redis.on("error", (err) => {
  console.warn("[Redis Warning] Connection error:", err.message);
});

redis.connect().catch((err) => {
  console.warn("[Redis Warning] Could not establish initial connection:", err.message);
});

export default redis;
