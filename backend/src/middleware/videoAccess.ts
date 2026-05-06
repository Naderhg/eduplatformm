import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IOptionalUserRequest } from '../types/express';
import Course from '../models/course.model';
import Enrollment from '../models/enrollment.model';
import User from '../models/user.model';
import ErrorResponse from '../utils/errorResponse';

// Middleware to check if user can access video (streaming only for students)
export const checkVideoAccess = async (req: IOptionalUserRequest, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const { token } = req.query;
    
    // Get user info
    let userId = null;
    let userRole = null;
    
    if (req.user) {
      userId = req.user.id;
      userRole = req.user.role;
    } else if (token) {
      try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          userId = user._id.toString();
          userRole = user.role;
        }
      } catch (error) {
        return next(new ErrorResponse('Invalid authentication', 401));
      }
    }

    if (!userId || !userRole) {
      return next(new ErrorResponse('Authentication required', 401));
    }

    // Find course that contains this video
    const course = await Course.findOne({ 
      $or: [
        { videoUrl: `/uploads/videos/${filename}` },
        { videoUrl: filename },
        { videoUrl: `uploads/videos/${filename}` },
        { videoUrl: `http://localhost:3000/uploads/videos/${filename}` },
        { videoUrl: `/api/files/videos/${filename}` },
        { videoUrl: `api/files/videos/${filename}` },
        { videoUrl: `https://backend-crimson-skylark-5998.fly.dev/api/files/videos/${filename}` }
      ]
    });

    if (!course) {
      return next(new ErrorResponse('Video not found', 404));
    }

    // Check permissions
    const isTeacher = course.teacher.toString() === userId;
    const isAdmin = userRole === 'ADMIN';
    
    let isEnrolled = false;
    if (userRole === 'STUDENT') {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: course._id
      });
      isEnrolled = !!enrollment;
    }

    if (!isTeacher && !isEnrolled && !isAdmin) {
      return next(new ErrorResponse('Not authorized to access this video', 403));
    }

    // Add user info to request for use in controller
    req.user = { id: userId, role: userRole } as any;
    req.course = course;
    req.isTeacher = isTeacher;
    req.isAdmin = isAdmin;
    req.isEnrolled = isEnrolled;

    next();
  } catch (error: any) {
    return next(new ErrorResponse('Server error', 500));
  }
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      course?: any;
      isTeacher?: boolean;
      isAdmin?: boolean;
      isEnrolled?: boolean;
    }
  }
}
