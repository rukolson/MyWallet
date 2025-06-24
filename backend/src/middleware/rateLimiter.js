import redisClient from "../config/redisClient.js";

const WINDOW_SECONDS = 60;    
const MAX_REQUESTS = 100;     

const rateLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip || "global"; 
    const key = `ratelimit:${identifier}`;

    const current = await redisClient.incr(key); 

    if (current === 1) {
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
