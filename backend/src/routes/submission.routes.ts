import { Router } from 'express';
import {
  submitAssignment,
  gradeSubmission,
  getMySubmissions,
  getSubmission,
  getSubmissionByAssignment,
  getAssignmentStats,
  getAssignmentSubmissionsWithRankings,
  getAssignmentPublicRankings
} from '../controllers/submission.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

// Student routes
router.post('/assignment/:assignmentId/submit', authorize('STUDENT'), submitAssignment);
router.get('/my', authorize('STUDENT'), getMySubmissions);
router.get('/assignment/:assignmentId', authorize('STUDENT'), getSubmissionByAssignment);
router.get('/assignment/:assignmentId/public-rankings', authorize('STUDENT'), getAssignmentPublicRankings);
router.get('/:id', getSubmission);

// Teacher routes
router.put('/:id/grade', authorize('TEACHER'), gradeSubmission);
router.get('/assignment/:assignmentId/stats', authorize('TEACHER'), getAssignmentStats);
router.get('/assignment/:assignmentId/rankings', authorize('TEACHER'), getAssignmentSubmissionsWithRankings);

export default router;
