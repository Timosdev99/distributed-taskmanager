import { Request, Response } from "express";
import TaskModel, { TaskDocument } from "../MODELS/task";
import { setCache, deleteCache, getCache } from "../utils/caching";
import mongoose from "mongoose";
import { error } from "console";
import { promisify } from "util";


interface CreateTaskRequest {
  title: string;
  description: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo: string;
  dueDate: Date;
  estimatedHours?: number;
  tags?: string[];
  category?: string;
  watchers?: string[];
}

interface UpdateTaskRequest {
  _id: string;
  title?: string;
  description?: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
  category?: string;
  completionPercentage?: number;
}

interface TaskFilters {
  limit: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  tags?: string[];
  category?: string;
}





export const createTask = async (req: Request<{}, {}, CreateTaskRequest>, res: Response) => {
  try {
    const {
      title,
      description,
      status = "pending",
      priority = "medium",
      assignedTo,
      dueDate,
      estimatedHours,
      tags,
      category,
      watchers
    } = req.body;

    if (!title || !description || !assignedTo || !dueDate) {
     res.status(400).json({
        message: "Required fields missing: title, description, assignedTo, and dueDate are required"
      });
      return 
    }

    const task = new TaskModel({
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate: new Date(dueDate),
      estimatedHours,
      tags: tags || [],
      category,
      watchers: watchers || [],
      createdBy: 'system', 
      completionPercentage: 0,
      lastActivityAt: new Date()
    });

    await task.save();
    res.status(201).json({
      message: "Task successfully created",
      task
    });
    return 
  } catch (error) {
    console.error(error);
   res.status(500).json({ message: "Failed to create task" });
   return 
  }
};




export const getAllTask = async(req: Request, res: Response) => {
    try {
        const alltasks = await TaskModel.find()
                       .sort({ lastActivityAt: -1 })

                       res.status(200).json({
                        alltasks,
                        count: alltasks.length
                      });
                      return
                    } catch (error) {
                      console.error(error);
                     res.status(500).json({ message: "Failed to fetch tasks" });
                     return 
                    }
}




export const getTasks = async (req: Request<{}, {}, {}, TaskFilters>, res: Response) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      dueBefore,
      dueAfter,
      tags,
      category
    } = req.query;
   
    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (dueBefore || dueAfter) {
      filter.dueDate = {};
      if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
      if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
    }

    const tasks = await TaskModel
      .find(filter)
      .sort({ lastActivityAt: -1 })
      .limit(parseInt(req.query.limit as string) || 50);

    res.status(200).json({
      tasks,
      count: tasks.length
    });
    return
  } catch (error) {
    console.error(error);
   res.status(500).json({ message: "Failed to fetch tasks" });
   return 
  }
};

export const updateTask = async (req: Request<{}, {}, UpdateTaskRequest>, res: Response) => {
  try {
    const { _id, ...updates } = req.body;

    if (!_id) {
     res.status(400).json({ message: "Task ID is required" });
     return
    }
 
    
    if (updates.status === 'completed') {
      const currentTask = await TaskModel.findById(_id);
      if (currentTask?.completionPercentage !== 100) {
        updates.completionPercentage = 100;
      }
    }


    const updatedTask = await TaskModel.findByIdAndUpdate(
      _id,
      {
        ...updates,
        lastActivityAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return 
    }
     
    deleteCache(_id);
    setCache(_id, updatedTask);
   
    
     res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask
    });
    return
  } catch (error) {
    console.error(error);
   res.status(500).json({ message: "Failed to update task" });
   return 
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { taskId, content, mentions } = req.body;

    if (!taskId || !content) {
      res.status(400).json({ message: "Task ID and comment content are required" });
      return
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
       res.status(404).json({ message: "Task not found" });
       return
    }

    task.comments.push({
      content,
      author:  'system',
      createdAt: new Date(),
      mentions: mentions || []
    });

    task.lastActivityAt = new Date();
    await task.save();

    res.status(200).json({
      message: "Comment added successfully",
      task
    });
    return
  } catch (error) {
    console.error(error);
   res.status(500).json({ message: "Failed to add comment" });
   return 
  }
};

export const addTimeLog = async (req: Request, res: Response) => {
  try {
    const { taskId, startTime, endTime, description } = req.body;

    if (!taskId || !startTime) {
     res.status(400).json({ message: "Task ID and start time are required" });
     return 
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
    res.status(404).json({ message: "Task not found" });
    return 
    }

    task.timeLogs.push({
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      loggedBy:  'system',
      description
    });

    task.lastActivityAt = new Date();
    await task.save();

    res.status(200).json({
      message: "Time log added successfully",
      task
    });
    return 
  } catch (error) {
    console.error(error);
   res.status(500).json({ message: "Failed to add time log" });
   return 
  }
};


export const getTaskAnalytics = async (req: Request, res: Response) => {
  try {
    const totalTasks = await TaskModel.countDocuments();
    const completedTasks = await TaskModel.countDocuments({ status: 'completed' });
    const overdueTasks = await TaskModel.countDocuments({
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });

    const tasksByStatus = await TaskModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByPriority = await TaskModel.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

     res.status(200).json({
      analytics: {
        totalTasks,
        completedTasks,
        overdueTasks,
        tasksByStatus: Object.fromEntries(
          tasksByStatus.map(item => [item._id, item.count])
        ),
        tasksByPriority: Object.fromEntries(
          tasksByPriority.map(item => [item._id, item.count])
        )
      }
    });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch task analytics" });
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
  
      const deletedTask = await TaskModel.findByIdAndDelete(_id);
  
      if (!deletedTask) {
        res.status(404).json({ message: "Task not found" });
        return
      }
  
      deleteCache(_id);

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
  
      const task = await TaskModel.findById(_id);
  
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
  
      
      const result = await TaskModel.deleteMany({ _id: { $in: ids } });
  
      
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
  
  
  export const bulkUpdateTasks = async (req: Request, res: Response) => {
    try {
      const { updates } = req.body;
  
      
      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({ message: "Updates are required in an array" });
        return 
      }
  
      const updateResults = [];
  
      
      for (const update of updates) {
        const { id, ...fieldsToUpdate } = update;
  
        if (!id || Object.keys(fieldsToUpdate).length === 0) {
          updateResults.push({ id, success: false, message: "Invalid update format" });
          continue;
        }
  
        const updatedTask = await TaskModel.findByIdAndUpdate(id, fieldsToUpdate, { new: true });
  
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
  
  
  export const getTaskById = async (req: Request, res: Response) => {
    try {

        const {id} = req.params
        if(!id) {
            res.status(404).json({message: "id is required"})
            return
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid user ID format" });
            return;
          }

          const cachedTask = await getCache(id) ;
          if (cachedTask) {
           res.status(200).json({
              message: "Task retrieved from cache",
              task: JSON.parse(cachedTask),
            });
            return 
          }


        const task = await TaskModel.findById(id)
        if (!task) {
            res.status(404).json({message: "user not found"})
        }

        try {
            await setCache(id, task);
        } catch (cacheError) {
            console.error("Cache write error:", cacheError);
        }

        res.status(200).json({message: "user succesfully gotten",
            task
        })
        return
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get tasks by id" });
        return
        
    }
  }