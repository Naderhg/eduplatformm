import { Router } from 'express';
import {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  getAssignmentSubmissions,
  getStudentAssignments,
  getTeacherAssignments
} from '../controllers/assignment.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

// Student routes
router.get('/student', authorize('STUDENT'), getStudentAssignments);

// Teacher routes
router.get('/teacher', authorize('TEACHER'), getTeacherAssignments);

// Assignment CRUD routes
router.post('/', authorize('TEACHER'), createAssignment);
router.get('/course/:courseId', getCourseAssignments);
router.get('/:id', getAssignment);
router.put('/:id', authorize('TEACHER'), updateAssignment);
router.delete('/:id', authorize('TEACHER'), deleteAssignment);

// Assignment specific actions
router.put('/:id/publish', authorize('TEACHER'), publishAssignment);
router.get('/:id/submissions', authorize('TEACHER'), getAssignmentSubmissions);

export default router;
