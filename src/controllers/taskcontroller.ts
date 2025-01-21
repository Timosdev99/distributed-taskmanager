import taskmodel from "../MODELS/task";
import { Request, Response } from "express";

export const Createtask = async (req: Request, res: Response) => {

  try {
    const { title, description, status, assignedTo, dueDate } = req.body;
      if(!title) {
        res.status(400).json({message: "please input task "});
        return
      }

       const existingtask = await taskmodel.find({title})
      const task = new taskmodel({
        title: title,
        description: description,
        status: status,  
        assignedTo: assignedTo,
        dueDate: dueDate
      })
       
      await task.save()
  } catch (error) {
    console.error(error)
    res.status(500).json({message: "failed to create task"})
  }

 
}


export const gettask = async (req: Request, res: Response) => {
    const tasks = await taskmodel.find()
    try {
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tasks"});
        console.error(error)
    }
}