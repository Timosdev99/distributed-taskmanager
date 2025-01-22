import { model, Schema, Document } from "mongoose";
import { ObjectId } from "mongodb";


interface Comment {
  content: string;
  author: string;
  createdAt: Date;
  mentions: string[];
}

interface Attachment {
  filename: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileSize: number;
  fileType: string;
}

interface TimeLog {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  loggedBy: string;
  description?: string;
}


interface ITask {
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string;
  createdBy: string;
  dueDate: Date;
  estimatedHours?: number;
  tags: string[];
  parentTaskId?: ObjectId;
  subtaskIds: ObjectId[];
  watchers: string[];
  comments: Comment[];
  attachments: Attachment[];
  timeLogs: TimeLog[];
  completionPercentage: number;
  lastActivityAt: Date;
  category?: string;
}


export interface TaskDocument extends ITask, Document {}

const CommentSchema = new Schema<Comment>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  mentions: [{ type: String }]
});

const AttachmentSchema = new Schema<Attachment>({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true }
});

const TimeLogSchema = new Schema<TimeLog>({
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  loggedBy: { type: String, required: true },
  description: { type: String }
});

const TaskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true
    },
    assignedTo: { 
      type: String, 
      required: true,
      index: true 
    },
    createdBy: {
      type: String,
      required: true,
      index: true
    },
    dueDate: { 
      type: Date, 
      required: true,
      index: true 
    },
    estimatedHours: {
      type: Number
    },
    tags: [{
      type: String,
      index: true
    }],
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true
    },
    subtaskIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    watchers: [{
      type: String,
      index: true
    }],
    comments: [CommentSchema],
    attachments: [AttachmentSchema],
    timeLogs: [TimeLogSchema],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      index: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


TaskSchema.pre<TaskDocument>('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});


TaskSchema.pre<TaskDocument>('save', function(next) {
  this.timeLogs.forEach(log => {
    if (log.endTime && log.startTime) {
      log.duration = (log.endTime.getTime() - log.startTime.getTime()) / (1000 * 60 * 60);
    }
  });
  next();
});


TaskSchema.virtual('isOverdue').get(function(this: TaskDocument) {
  return this.status !== 'completed' && this.dueDate < new Date();
});

const TaskModel = model<TaskDocument>('Task', TaskSchema);
export default TaskModel;