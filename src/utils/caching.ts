import { promisify } from "util";
import { redisClient } from "../utils/redisclient"; 

const delAsync = promisify(redisClient.del).bind(redisClient);


export const deleteCache = async (_id: string) => {
    try {
        const response = await delAsync(`task:${_id}`);
        if (response === 0) {
            console.log('Cache not found for task', _id);
        } else {
            console.log('Cache for task', _id, 'was successfully deleted');
        }
    } catch (err) {
        console.log('Unable to delete cache', err);
    }
};


export const setCache = async (_id: string, updatedTask: any) => {
    try {
        if (!updatedTask) {
            console.error('Updated task is undefined or null');
            return;
        }

        

        await redisClient.setEx(`task:${_id}`, 3600, JSON.stringify(updatedTask));
        console.log(`Cache for task ${_id} set with expiry`);
    } catch (err) {
        console.error('Failed to set cache for task', _id, err);
    }
};


export const getCache = async (id: string): Promise<string | null> => {
    try {
        const cachedData = await redisClient.get(`task:${id}`);
        return cachedData;  
    } catch (error) {
        console.error("Failed to get cache:", error);
        return null; 
    }
};
