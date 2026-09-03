import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  uploadLessonVideo,
  uploadLessonFiles,
  reorderLessons,
} from '../controllers/lesson.controller';
import { protect, authorize } from '../middleware/auth';
import { uploadVideo, uploadMultiple } from '../middleware/upload';

const router = Router();

// Validation middleware
const validateLesson = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('questions.*.text').optional().trim().notEmpty().withMessage('Question text is required'),
  body('questions.*.type').optional().isIn(['mcq', 'truefalse', 'short']).withMessage('Invalid question type'),
  body('questions.*.correctAnswer').optional().notEmpty().withMessage('Correct answer is required'),
  body('questions.*.points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  param('courseId').isMongoId().withMessage('Invalid course ID'),
  param('lessonId').isMongoId().withMessage('Invalid lesson ID'),
];

// All routes are protected
router.use(protect);

// Lesson routes - students can view lessons of enrolled courses
router.get('/course/:courseId', authorize('TEACHER', 'ADMIN', 'STUDENT'), getLessons);
router.get('/course/:courseId/:lessonId', authorize('TEACHER', 'ADMIN', 'STUDENT'), getLesson);
router.post('/course/:courseId', authorize('TEACHER', 'ADMIN'), validateLesson, createLesson);
router.put('/course/:courseId/:lessonId', authorize('TEACHER', 'ADMIN'), validateLesson, updateLesson);
router.delete('/course/:courseId/:lessonId', authorize('TEACHER', 'ADMIN'), deleteLesson);

// File upload routes
router.post('/course/:courseId/:lessonId/upload-video', authorize('TEACHER', 'ADMIN'), uploadVideo.single('video'), uploadLessonVideo);
router.post('/course/:courseId/:lessonId/upload-files', authorize('TEACHER', 'ADMIN'), uploadMultiple.array('files', 10), uploadLessonFiles);

// Reorder lessons
router.put('/course/:courseId/reorder', authorize('TEACHER', 'ADMIN'), reorderLessons);

export default router;
