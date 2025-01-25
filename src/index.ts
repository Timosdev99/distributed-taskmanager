import "dotenv/config"; 
import connectDB from "../db";
import express, { Application, Express } from "express";
import taskroute from "./ROUTES/taskroute"
import userroute from "./ROUTES/userroute"
 const PORT = 3000
const app: Application = express();

app.use(express.json())

app.use('/tasks/v1', taskroute)
app.use('user/v1', userroute)

app.use('/', (req: any, res: any) => {
     res.status(201).json({
        message: "API is working"
     })
})

connectDB().then(() => {
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}).catch(error => {
    console.error('Failed to connect to database', error);
    process.exit(1);
});