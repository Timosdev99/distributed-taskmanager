
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

const router = Router();


router.post('/create', createTask);
router.get('/all', getTasks);
router.put('/update', updateTask);
 router.delete('/delete', deleteuser);


router.post('/assign', assignuser);
router.post('/bulk-delete', bulkDeleteTasks);
router.post('/bulk-update', bulkUpdateTasks);


router.post('/comment', addComment);
router.post('/time-log', addTimeLog);
router.get('/analytics', getTaskAnalytics);
router.get("/task/:id", getTaskById);

export default router;

