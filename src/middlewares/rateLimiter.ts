import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../config/redis";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: { success: false, message: "Too many requests. Please try again later." },
  store: new RedisStore({
    // @ts-expect-error — ioredis compatible
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});


export const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", 
  
  message: { success: false, message: "Too many requests on this endpoint." },
  store: new RedisStore({
    // @ts-expect-error — ioredis compatible
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: "rl:strict:",
  }),
});