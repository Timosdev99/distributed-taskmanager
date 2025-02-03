
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { TaskDocument } from '../MODELS/task';



interface ServerToClientEvents {
    authenticated: (data: { message: string }) => void;
    taskCreated: (data: { message: string; task: TaskDocument }) => void;
    taskUpdated: (data: { message: string; task: TaskDocument; changes: any }) => void;
    newComment: (data: { message: string; taskId: string; comment: any }) => void;
    taskAssigned: (data: { message: string; task: TaskDocument }) => void;
    taskUnassigned: (data: { message: string; task: TaskDocument }) => void;
    mentioned: (data: { message: string; taskId: string; comment: any }) => void;
    userPresenceUpdate: (data: { userId: string; status: 'online' | 'offline' }) => void;
    
    
    userTyping: (data: { userId: string; taskId: string }) => void;
    userStoppedTyping: (data: { userId: string; taskId: string }) => void;
  }
  

interface ClientToServerEvents {
  authenticate: (userId: string) => void;
  joinTask: (taskId: string) => void;
  leaveTask: (taskId: string) => void;
  startTyping: (taskId: string) => void;
  stopTyping: (taskId: string) => void;
}

class TaskSocketServer {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private userSockets: Map<string, Set<string>> = new Map();
  private userPresence: Map<string, 'online' | 'offline'> = new Map();
  
  constructor(server: HTTPServer) {
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
     
      perMessageDeflate: true,
     
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      let authenticatedUserId: string | null = null;

      
      socket.on('authenticate', (userId: string) => {
        authenticatedUserId = userId;
        this.handleUserAuthentication(socket.id, userId);
        
       
        socket.join(`user:${userId}`);
        
        
        this.updateUserPresence(userId, 'online');
        
       
        socket.emit('authenticated', {
          message: 'Successfully connected to task manager'
        });
      });

     
      socket.on('joinTask', (taskId: string) => {
        if (!authenticatedUserId) return;
        
        socket.join(`task:${taskId}`);
        console.log(`Socket ${socket.id} joined task room ${taskId}`);
      });

      socket.on('leaveTask', (taskId: string) => {
        if (!authenticatedUserId) return;
        
        socket.leave(`task:${taskId}`);
        console.log(`Socket ${socket.id} left task room ${taskId}`);
      });

      
      let typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

      socket.on('startTyping', (taskId: string) => {
        if (!authenticatedUserId) return;
        
      
        const existingTimeout = typingTimeouts.get(taskId);
        if (existingTimeout) clearTimeout(existingTimeout);

        
        socket.to(`task:${taskId}`).emit('userTyping', {
          userId: authenticatedUserId,
          taskId
        });

       
        const timeout = setTimeout(() => {
            if (authenticatedUserId) {
                socket.to(`task:${taskId}`).emit('userTyping', {
                  userId: authenticatedUserId,
                  taskId
                });
              }
              
          typingTimeouts.delete(taskId);
        }, 5000);

        typingTimeouts.set(taskId, timeout);
      });

      socket.on('stopTyping', (taskId: string) => {
        if (!authenticatedUserId) return;
        
        const timeout = typingTimeouts.get(taskId);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeouts.delete(taskId);
        }

        socket.to(`task:${taskId}`).emit('userStoppedTyping', {
          userId: authenticatedUserId,
          taskId
        });
      });

     
      socket.on('disconnect', () => {
        if (authenticatedUserId) {
          this.handleDisconnect(socket.id, authenticatedUserId);
          this.updateUserPresence(authenticatedUserId, 'offline');
        }
        
       
        typingTimeouts.forEach(timeout => clearTimeout(timeout));
        typingTimeouts.clear();
      });
    });
  }

  private handleUserAuthentication(socketId: string, userId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socketId);
  }

  private handleDisconnect(socketId: string, userId: string) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  private updateUserPresence(userId: string, status: 'online' | 'offline') {
    this.userPresence.set(userId, status);
    this.io.emit('userPresenceUpdate', { userId, status });
  }

  
  notifyTaskCreated(task: TaskDocument) {
    this.emitToTaskUsers(task, 'taskCreated', {
      message: 'New task created',
      task
    });
  }

  notifyTaskUpdated(task: TaskDocument, changes: any) {
    this.emitToTaskUsers(task, 'taskUpdated', {
      message: 'Task updated',
      task,
      changes
    });
  }

  notifyCommentAdded(task: TaskDocument, comment: any) {
    this.emitToTaskUsers(task, 'newComment', {
      message: 'New comment added',
      taskId: task._id,
      comment
    });

    
    if (comment.mentions?.length) {
      comment.mentions.forEach((userId: string) => {
        this.io.to(`user:${userId}`).emit('mentioned', {
          message: 'You were mentioned in a comment',
          taskId: task._id as string,
          comment
        });
      });
    }
  }

  notifyTaskAssigned(task: TaskDocument, previousAssignee: string | null) {
   
    this.io.to(`user:${task.assignedTo}`).emit('taskAssigned', {
      message: 'New task assigned to you',
      task
    });

   
    if (previousAssignee) {
      this.io.to(`user:${previousAssignee}`).emit('taskUnassigned', {
        message: 'Task has been reassigned',
        task
      });
    }
  }

  private emitToTaskUsers(task: TaskDocument, event: keyof ServerToClientEvents, data: any) {
    
    this.io.to(`task:${task._id}`).emit(event, data);

    
    const relevantUsers = new Set([
      task.assignedTo,
      task.createdBy,
      ...(task.watchers || [])
    ]);

    relevantUsers.forEach(userId => {
      if (userId) {
        this.io.to(`user:${userId}`).emit(event, data);
      }
    });
  }

  
  getUserPresence(userId: string): 'online' | 'offline' {
    return this.userPresence.get(userId) || 'offline';
  }
}

export default TaskSocketServer;