import { createClient } from "redis";

export const redisClient = createClient({
  socket: {
    host: 'redis-19951.c11.us-east-1-3.ec2.redns.redis-cloud.com',
    port: 19951
  },
  password: 'tGTzz5a148WZ21SeWQNn1j52lMS4q0Wn'
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