import { Request, Response, NextFunction } from 'express';
import { IOptionalUserRequest } from '../types/express';
import jwt from 'jsonwebtoken';
import Course from '../models/course.model';
import Enrollment from '../models/enrollment.model';
import User from '../models/user.model';
import ErrorResponse from '../utils/errorResponse';
import path from 'path';
import fs from 'fs';

// @desc    Serve course files securely
// @route   GET /api/files/course/:courseId/:filename
// @access  Private (Teacher of course or Enrolled Student) - supports token via query param
export const serveCourseFile = async (req: IOptionalUserRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId, filename } = req.params;
    const { token } = req.query;
    
    // Try to get user info from request (may not be present for download requests)
    let userId = null;
    let userRole = null;
    
    // Check if user is authenticated via middleware
    if (req.user) {
      userId = req.user.id;
      userRole = req.user.role;
    } else if (token) {
      // For download requests, try to get token from query parameter
      try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          userId = user._id.toString();
          userRole = user.role;
        }
      } catch (error) {
        console.log('Invalid token provided for file access');
      }
    }

    console.log(`=== File Access Request ===`);
    console.log(`User ID: ${userId}`);
    console.log(`User Role: ${userRole}`);
    console.log(`Course ID: ${courseId}`);
    console.log(`Filename: ${filename}`);
    console.log(`Request params:`, req.params);
    console.log(`Request query:`, req.query);

    // If no user authentication, deny access
    if (!userId || !userRole) {
      console.log(`Access denied: No authentication for file ${filename}`);
      return next(new ErrorResponse('Authentication required', 401));
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found:', courseId);
      return next(new ErrorResponse('Course not found', 404));
    }

    console.log(`Course found: ${course.title}`);
    console.log(`Course teacher: ${course.teacher}`);

    // Check if user is teacher
    const isTeacher = course.teacher.toString() === userId;
    console.log(`Is teacher check: ${isTeacher} (user: ${userId}, course.teacher: ${course.teacher})`);

    // Check if user is enrolled in course (for students)
    let isEnrolled = false;
    if (userRole === 'STUDENT') {
      console.log('Checking student enrollment...');
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      });
      isEnrolled = !!enrollment;
      console.log(`Student enrollment found: ${!!enrollment}`);
    }

    // Admins can access all files
    const isAdmin = userRole === 'ADMIN';
    console.log(`Is admin: ${isAdmin}`);

    // Check permissions
    if (!isTeacher && !isEnrolled && !isAdmin) {
      console.log(`=== ACCESS DENIED ===`);
      console.log(`User ${userId} is not teacher, enrolled student, or admin for course ${courseId}`);
      console.log(`Teacher: ${isTeacher}, Enrolled: ${isEnrolled}, Admin: ${isAdmin}`);
      return next(new ErrorResponse('Not authorized to access this file', 403));
    }

    console.log(`=== ACCESS GRANTED ===`);
    console.log(`User ${userId} (${userRole}) granted access to file ${filename} in course ${courseId}`);

    // Handle both old format (full API path) and new format (filename only)
    // Old format: /api/files/course/123/filename.pdf
    // New format: filename.pdf
    let actualFilename = filename;
    if (filename.includes('/')) {
      // Extract filename from full path
      const parts = filename.split('/');
      actualFilename = parts[parts.length - 1];
      console.log(`Extracted actual filename from path: ${actualFilename}`);
    }

    // Construct file path
    const filePath = path.join(__dirname, '../../uploads/files', actualFilename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return next(new ErrorResponse('File not found', 404));
    }

    console.log(`File path: ${filePath}`);
    console.log(`File exists: ${fs.existsSync(filePath)}`);

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

    // Send file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving file:', err);
        return next(new ErrorResponse('Error serving file', 500));
      }
    });
  } catch (error: any) {
    console.error('Error in serveCourseFile:', error);
    return next(new ErrorResponse('Server error', 500));
  }
};

// @desc    Serve course thumbnails
// @route   GET /api/files/thumbnails/:filename
// @access  Public (thumbnails are public)
export const serveThumbnail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/thumbnails', filename);
    
    if (!fs.existsSync(filePath)) {
      return next(new ErrorResponse('Thumbnail not found', 404));
    }

    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.sendFile(filePath);
  } catch (error: any) {
    return next(new ErrorResponse('Server error', 500));
  }
};

// @desc    Serve course videos
// @route   GET /api/files/videos/:filename
// @access  Private (Teacher of course or Enrolled Student) - supports token via query param
export const serveVideo = async (req: IOptionalUserRequest, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const { token } = req.query;
    
    // Try to get user info from request (may not be present for video element requests)
    let userId = null;
    let userRole = null;
    
    // Check if user is authenticated via middleware
    if (req.user) {
      userId = req.user.id;
      userRole = req.user.role;
    } else if (token) {
      // For video element requests, try to get token from query parameter
      try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          userId = user._id.toString();
          userRole = user.role;
        }
      } catch (error) {
        console.log('Invalid token provided for video access');
      }
    }

    console.log(`Video access request: User ${userId} (${userRole}) requesting video ${filename}`);

    // Find course that contains this video
    console.log(`Searching for course with video filename: ${filename}`);
    let course = null;
    
    // Try to find course first
    try {
      course = await Course.findOne({ 
        $or: [
          { videoUrl: `/uploads/videos/${filename}` },
          { videoUrl: filename },
          { videoUrl: `uploads/videos/${filename}` },
          { videoUrl: `http://localhost:3000/uploads/videos/${filename}` },
          { videoUrl: `/api/files/videos/${filename}` },
          { videoUrl: `api/files/videos/${filename}` },
          { videoUrl: `https://deev--edu-platform--fnj72wsf9xl6.code.run/api/files/videos/${filename}` },
          { videoUrl: `https://deev--edu-platform--fnj72wsf9xl6.code.run/uploads/videos/${filename}` }
        ]
      });
    } catch (dbError) {
      console.error('Database error finding course:', dbError);
    }
    
    // If no user authentication, deny access
    if (!userId || !userRole) {
      console.log(`Access denied: No authentication for video ${filename}`);
      return next(new ErrorResponse('Authentication required', 401));
    }

    // Check permissions (same as course files)
    let isTeacher = false;
    const isAdmin = userRole === 'ADMIN';
    let isEnrolled = false;
    
    if (course) {
      isTeacher = course.teacher.toString() === userId;
      
      if (userRole === 'STUDENT') {
        const enrollment = await Enrollment.findOne({
          student: userId,
          course: course._id
        });
        isEnrolled = !!enrollment;
      }
    } else if (userRole === 'TEACHER') {
      // For teachers without course found, allow access (they uploaded it)
      isTeacher = true;
      console.log(`Teacher access granted for video ${filename} (no course found)`);
    }
    
    // If no course found and not teacher/admin, deny access
    if (!course && !isTeacher && !isAdmin) {
      console.log('Course not found for video:', filename);
      console.log('Searching with patterns:');
      console.log('- /uploads/videos/' + filename);
      console.log('- ' + filename);
      console.log('- uploads/videos/' + filename);
      console.log('- http://localhost:3000/uploads/videos/' + filename);
      console.log('- /api/files/videos/' + filename);
      console.log('- api/files/videos/' + filename);
      console.log('- https://deev--edu-platform--fnj72wsf9xl6.code.run/api/files/videos/' + filename);
      return next(new ErrorResponse('Video not found', 404));
    }

    if (!isTeacher && !isEnrolled && !isAdmin) {
      console.log(`Access denied: User ${userId} (${userRole}) is not teacher, enrolled student, or admin for video ${filename}`);
      return next(new ErrorResponse('Not authorized to access this video', 403));
    }

    const filePath = path.join(__dirname, '../../uploads/videos', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log('Video file not found:', filePath);
      return next(new ErrorResponse('Video not found', 404));
    }

    console.log(`Access granted: Serving video ${filePath} to user ${userId}`);

    // Set headers for video streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Prevent download for students - add security headers
    if (userRole === 'STUDENT') {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Disposition', 'inline'); // Force inline display, not download
    } else {
      // Teachers and admins can download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    // Handle range requests for video streaming
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error serving video:', err);
          return next(new ErrorResponse('Error serving video', 500));
        }
      });
    }

  } catch (error: any) {
    console.error('Error in serveVideo:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      filename: req.params?.filename,
      token: req.query?.token ? 'present' : 'missing',
      userId: req.user?.id || 'not authenticated'
    });
    return next(new ErrorResponse('Server error', 500));
  }
};
