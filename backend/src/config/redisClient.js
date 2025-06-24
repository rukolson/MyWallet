import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true, 
    keepAlive: 5000,
    reconnectStrategy: () => 1000, 
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClient.connect();
console.log("Connected to Azure Redis");

setInterval(async () => {
  try {
    await redisClient.ping();
    console.log("Redis ping OK");
  } catch (err) {
    console.error("Redis ping failed:", err);
  }
}, 1000 * 60 * 5); 

export default redisClient;
