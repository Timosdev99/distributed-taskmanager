
import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteuser,
  assignuser,
  bulkDeleteTasks,
  bulkUpdateTasks,
  addComment,
  addTimeLog,
  getTaskAnalytics,
  getTaskById
} from '../controllers/taskcontroller';

import { authToken } from '../middleware/auth';
import { Admin, ManagerandAdmin } from '../middleware/rbac';

const router = Router();


router.post('/create', authToken, ManagerandAdmin, createTask);
router.get('/all',    getTasks);
router.put('/update',  authToken, ManagerandAdmin, updateTask);
 router.delete('/delete',  authToken, ManagerandAdmin, deleteuser);


router.post('/assign',  authToken, ManagerandAdmin, assignuser);
router.post('/bulk-delete',  authToken, ManagerandAdmin, bulkDeleteTasks);
router.post('/bulk-update',  authToken, ManagerandAdmin, bulkUpdateTasks);


router.post('/comment',  authToken, addComment);
router.post('/time-log',  authToken, addTimeLog);
router.get('/analytics',  authToken, getTaskAnalytics);
router.get("/task/:id",  authToken, getTaskById);

export default router;
   
