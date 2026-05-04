import { Router } from 'express';
import {
  getTeacherStudents
} from '../controllers/student.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

// Teacher routes
router.get('/teacher', authorize('TEACHER'), getTeacherStudents);

export default router;