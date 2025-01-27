import { createClient } from "redis";

export const redisClient = createClient({
  socket: {
    socket: {
        host: yourhostenpoint ,
        port: yourresdisportnumber
      },
      password: yourpassword
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