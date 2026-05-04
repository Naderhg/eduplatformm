import express from 'express';
import {
  createComment,
  getCourseComments,
  updateComment,
  deleteComment,
  getCommentStats
} from '../controllers/comment.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/comments
// @desc    Create a comment on a course
router.post('/', createComment);

// @route   GET /api/comments/course/:courseId
// @desc    Get comments for a course
router.get('/course/:courseId', getCourseComments);

// @route   GET /api/comments/course/:courseId/stats
// @desc    Get comment statistics for a course (teacher only)
router.get('/course/:courseId/stats', getCommentStats);

// @route   PUT /api/comments/:id
// @desc    Update a comment
router.put('/:id', updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
router.delete('/:id', deleteComment);

export default router;
