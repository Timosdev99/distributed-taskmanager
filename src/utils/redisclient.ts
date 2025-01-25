import { createClient } from "redis";

export const redisClient = createClient({
  socket: {
    host: /*host endpoint*/,
    port: /*redis port */
  },
  password: /* password */
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));


export const initRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.error("Redis connection failed", error);
    process.exit(1); 
  }
};


initRedis();