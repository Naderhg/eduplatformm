import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createCourse,
  getCourses,
  getCourse,
  getCourseDetails,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrolledCourses,
  getCoursesByTeacher,
  uploadVideoFile,
  uploadThumbnailFile,
  uploadCourseFiles,
} from '../controllers/course.controller';
import { protect, authorize } from '../middleware/auth';
import { uploadVideo, uploadThumbnail, uploadMultiple } from '../middleware/upload';

const router = Router();

// Validation middleware
const validateCourse = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  // The 'category' and 'level' checks are removed for now to allow any string,
  // as the frontend sends different values than what was previously expected.
  // You may want to add more robust validation here later.
  body('category').isString().withMessage('Category must be a string'),
  body('level').isIn(['preparatory', 'secondary']).withMessage('Invalid level'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 week'),
];

// Public routes
router.get('/', getCourses);
router.get('/teacher/:teacherId', getCoursesByTeacher);

// Protected routes (require authentication)
router.use(protect);

// Student routes
router.get('/my-courses', authorize('STUDENT'), getEnrolledCourses);

// Course-specific routes (must come after specific routes)
router.get('/:id', getCourse);
router.get('/:id/details', authorize('TEACHER', 'ADMIN'), getCourseDetails);
router.get('/:id/manage', authorize('TEACHER', 'ADMIN'), getCourse);
router.post('/:id/enroll', authorize('STUDENT'), enrollInCourse);

// Teacher routes
router.post('/', authorize('TEACHER', 'ADMIN'), validateCourse, createCourse);
router.put('/:id', authorize('TEACHER', 'ADMIN'), validateCourse, updateCourse);
router.delete('/:id', authorize('TEACHER', 'ADMIN'), deleteCourse);

// File upload routes
router.post('/upload/video', authorize('TEACHER', 'ADMIN'), uploadVideo.single('video'), uploadVideoFile);
router.post('/upload/thumbnail', authorize('TEACHER', 'ADMIN'), uploadThumbnail.single('thumbnail'), uploadThumbnailFile);
router.post('/upload/files', authorize('TEACHER', 'ADMIN'), uploadMultiple.array('files', 10), uploadCourseFiles);

export default router;
