import { redisClient } from "./redisclient";

(async () => {
    await redisClient.connect();
  })();
  

  const streamKey = 'taskStream';
  const consumerGroup = 'taskConsumers';
  const consumerName = `consumer_${process.pid}`;
  
  
  async function createConsumerGroup() {
    try {
      
      await redisClient.xGroupCreate(streamKey, consumerGroup, '$', { MKSTREAM: true });
      console.log(`Consumer group "${consumerGroup}" created.`);
    } catch (err: any) {
      if (err.message.includes("BUSYGROUP")) {
        console.log(`Consumer group "${consumerGroup}" already exists.`);
      } else {
        console.error("Error creating consumer group:", err);
      }
    }
  }
  
  async function startWorker() {
    await createConsumerGroup();
  
    while (true) {
      try {
      
        const response = await redisClient.xReadGroup(
          consumerGroup,
          consumerName,
          { key: streamKey, id: '>' },
          { COUNT: 1, BLOCK: 5000 }
        );
  
        if (response) {
         
          for (const stream of response) {
            for (const message of stream.messages) {
              const messageId = message.id;
              const fields = message.message;
              console.log(`Processing message ${messageId}:`, fields);
  
              
              await processTask(fields);
  
             
              await redisClient.xAck(streamKey, consumerGroup, messageId);
              console.log(`Message ${messageId} acknowledged.`);
            }
          }
        }
      } catch (error) {
        console.error("Worker error:", error);
     
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
  
  
  async function processTask(taskFields: Record<string, string>) {
    console.log("Simulated task processing for:", taskFields.title || taskFields);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  startWorker();