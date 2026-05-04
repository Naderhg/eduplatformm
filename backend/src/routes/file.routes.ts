import { Router } from 'express';
import {
  serveCourseFile,
  serveThumbnail,
  serveVideo
} from '../controllers/file.controller';
import { protect } from '../middleware/auth';
import { addVideoSecurityHeaders, videoRateLimit } from '../middleware/videoSecurity';

const router = Router();

// Apply authentication middleware to all routes except thumbnails and videos
router.use('/thumbnails', (req, res, next) => {
  // Thumbnails are public, skip auth
  next();
});

router.use('/videos', (req, res, next) => {
  // Videos need special handling - we'll check auth in the controller
  next();
});

router.use('/course', (req, res, next) => {
  // Course files need special handling - we'll check auth in the controller
  next();
});

// Public route for thumbnails
router.get('/thumbnails/:filename', serveThumbnail);

// Video route with security middleware
router.get('/videos/:filename', videoRateLimit, addVideoSecurityHeaders, serveVideo);

// Course file route with custom authentication handling (must be before protect middleware)
router.get('/course/:courseId/:filename', serveCourseFile);

// Protected routes for other file operations
router.use(protect);

export default router;
