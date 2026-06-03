import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

// Helper wrapper agar mudah dipakai di model
export const cache = {
  //Ambil dari cache. Jika miss, jalankan fetcher lalu simpan hasilnya.
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 60,
  ): Promise<T> {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`Cache HIT: ${key}`);
      return JSON.parse(cached) as T;
    }
    console.log(`Cache MISS: ${key}`);
    const data = await fetcher();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  },

  async delPattern(pattern: string): Promise<void> {
    const stream = redis.scanStream({
      match: pattern,
      count: 100, 
    });

    for await (const resultKeys of stream) {
      if (resultKeys.length > 0) {
        await redis.del(...resultKeys);
      }
    }
  },
};

export default redis;
