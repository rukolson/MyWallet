import redisClient from "../config/redisClient.js";

const WINDOW_SECONDS = 60;    // okno czasowe
const MAX_REQUESTS = 100;     // maksymalna liczba żądań

const rateLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip || "global"; // można też użyć np. userId
    const key = `ratelimit:${identifier}`;

    const current = await redisClient.incr(key); // zwiększamy licznik

    if (current === 1) {
      // pierwszy raz – ustaw TTL
      await redisClient.expire(key, WINDOW_SECONDS);
    }

    if (current > MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    next(error);
  }
};

export default rateLimiter;
