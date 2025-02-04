import { redisClient } from "./redisclient";

export async function publishTaskToStream(taskData: Record<string, any>): Promise<string> {
    const flatData: string[] = [];
    for (const [key, value] of Object.entries(taskData)) {
        flatData.push(key, typeof value === 'string' ? value : JSON.stringify(value));
    }

    const messageId = await redisClient.sendCommand([
        "XADD",
        "taskStream",
        "MAXLEN",
        "~", 
        "1000",
        "*",
        ...flatData
    ]);

    console.log("Task published with message ID:", messageId);
    return messageId as string;
}
