
import taskmodel from "../MODELS/task";
import { Request, Response } from "express";

export const Createtask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, assignedTo, dueDate } = req.body;

    if (!title) {
       res.status(400).json({ message: "Task title is required" });
       return
    }

    const task = new taskmodel({
      title,
      description,
      status,
      assignedTo,
      dueDate,
    });

    await task.save();
     res.status(200).json({ message: "Task successfully created" });
     return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create task" });
    return
  }
};

export const gettask = async (req: Request, res: Response) => {
  try {
    const tasks = await taskmodel.find();
     res.status(200).json(tasks);
     return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks" });
    return
  }
};

export const updatetask = async (req: Request, res: Response) => {
  try {
    const { _id, ...updates } = req.body;

    if (!_id) {
      res.status(400).json({ message: "Task ID is required" });
      return
    }

    const updatedTask = await taskmodel.findByIdAndUpdate(_id, updates, {
      new: true,
    });

    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return
    }

    res.status(200).json({
      message: "Task updated successfully",
      updatedTask,
    });
    return
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: "Failed to update task" });
     return
  }
};

export const deleteuser = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;

    if (!_id) {
       res.status(400).json({ message: "Task ID is required" });
       return
    }

    const deletedTask = await taskmodel.findByIdAndDelete(_id);

    if (!deletedTask) {
      res.status(404).json({ message: "Task not found" });
      return
    }

     res.status(200).json({
      message: `Task with ID: ${_id} deleted successfully`,
    });
    return
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: "Failed to delete task" });
     return
  }
};

export const assignuser = async (req: Request, res: Response) => {
  try {
    const { _id, assignedTo } = req.body;

    if (!_id || !assignedTo) {
      res
        .status(400)
        .json({ message: "Task ID and assigned user are required" });
    }

    const task = await taskmodel.findById(_id);

    if (!task) {
       res.status(404).json({ message: "Task not found" });
       return
    }

    task.assignedTo = assignedTo;
    await task.save();

   res.status(200).json({
      message: `Task assigned successfully to user: ${assignedTo}`,
      task,
    });
    return 
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: "Failed to assign task" });
     return 
  }
};
