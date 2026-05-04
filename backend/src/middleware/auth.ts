import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import ErrorResponse from '../utils/errorResponse';
import { validateStudentSession } from './session.middleware';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

// Protect routes
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization?.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Add user to request object
    req.user = {
      id: user._id.toString(),
      role: user.role
    };

    // Validate session for students
    if (user.role === 'STUDENT') {
      await validateStudentSession(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
