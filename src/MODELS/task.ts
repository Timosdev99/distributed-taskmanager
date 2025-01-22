import {model, Schema} from "mongoose"
import { ObjectId } from "mongodb"

interface task {
    _id: ObjectId,
    title: string,
    description: string,
    status: "pending" | "in-progress" | "completed",
    assignedTo: string,
    dueDate: Date 
}

const taskschema = new Schema<task>({

    title: {
        type: String,
        required: true,
    }, 
    description: {
        type:String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending",
      },
      assignedTo: { type: String, required: true },
      dueDate: { type: Date, required: true },  
    },
    { timestamps: true })


    const taskmodel = model<task>("task", taskschema)
    export default taskmodel