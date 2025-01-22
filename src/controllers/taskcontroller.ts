
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




export const bulkDeleteTasks = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
     res.status(400).json({ message: "Task IDs are required in an array" });
     return 
    }

    // Delete tasks
    const result = await taskmodel.deleteMany({ _id: { $in: ids } });

    // Check result
    if (result.deletedCount === 0) {
    res.status(404).json({ message: "No tasks found for deletion" });
    return 
    }

    res.status(200).json({ message: `${result.deletedCount} tasks deleted successfully` });
    return
  } catch (error) {
    console.error(error);
   res.status(500).json({ message: "Failed to delete tasks" });
   return 
  }
};

// Bulk Updating
export const bulkUpdateTasks = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;

    // Validate input
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ message: "Updates are required in an array" });
      return 
    }

    const updateResults = [];

    // Iterate through updates and apply them
    for (const update of updates) {
      const { id, ...fieldsToUpdate } = update;

      if (!id || Object.keys(fieldsToUpdate).length === 0) {
        updateResults.push({ id, success: false, message: "Invalid update format" });
        continue;
      }

      const updatedTask = await taskmodel.findByIdAndUpdate(id, fieldsToUpdate, { new: true });

      if (updatedTask) {
        updateResults.push({ id, success: true, updatedTask });
      } else {
        updateResults.push({ id, success: false, message: "Task not found" });
      }
    }

   res.status(200).json({
      message: "Bulk update operation completed",
      results: updateResults,
    });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update tasks" });
    return 
}
};
