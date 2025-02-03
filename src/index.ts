import "dotenv/config"; 
import connectDB from "../db";
import express, { Application, Express } from "express";
import taskroute from "./ROUTES/taskroute";
import userroute from "./ROUTES/userroute";
import cookieParser from "cookie-parser";
import { createServer } from 'http';
import TaskSocketServer from './socket/TaskSocketServer';
import cors from 'cors';  
const PORT = process.env.PORT || 3000;
const app: Application = express();


const httpServer = createServer(app);


const socketServer = new TaskSocketServer(httpServer);


export { socketServer };


app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


app.use('/tasks/v1', taskroute);
app.use('/user/v1', userroute);


app.use('/', (req: any, res: any) => {
    res.status(200).json({  
        message: "API is working"
    });
});


connectDB()
    .then(() => {
        
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Socket.IO server is ready for connections`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    });


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});