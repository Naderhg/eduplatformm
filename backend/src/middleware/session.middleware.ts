import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import Session from '../models/session.model';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt';
import crypto from 'crypto';

// Generate device ID from user agent and IP
const generateDeviceId = (userAgent: string, ip: string): string => {
  return crypto.createHash('sha256').update(`${userAgent}-${ip}`).digest('hex').substring(0, 32);
};

// Middleware to enforce single device login for students
export const enforceSingleDeviceLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    // Find user to check role
    const user = await User.findOne({ email });
    
    // Only enforce for students
    if (!user || user.role !== 'STUDENT') {
      return next();
    }

    // Check if user already has ANY active session
    const existingSession = await Session.findOne({ 
      userId: user._id, 
      isActive: true 
    });

    if (existingSession) {
      // Student already has an active session, block new login
      return next(new ErrorResponse('Student accounts can only be logged in on one device at a time. Please logout from your other device first.', 409));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Create session after successful login
export const createSession = async (userId: string, token: string, req: Request) => {
  try {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const deviceId = generateDeviceId(userAgent, ip);

    // Deactivate any existing sessions for this user
    await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Create new session
    const session = await Session.create({
      userId,
      token,
      deviceInfo: {
        userAgent,
        ip,
        deviceId,
      },
      isActive: true,
    });

    // Update user's current session
    await User.findByIdAndUpdate(userId, { currentSession: token });

    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Validate session on each request
export const validateSession = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    // Find session
    const session = await Session.findOne({ 
      token, 
      isActive: true 
    }).populate('userId');

    if (!session) {
      return next();
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to validate student sessions on protected routes
export const validateStudentSession = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    // Find user first
    const user = await User.findById(req.user.id);
    
    // Only validate for students
    if (!user || user.role !== 'STUDENT') {
      return next();
    }

    // Check if session is still active
    const session = await Session.findOne({ 
      userId: user._id,
      token, 
      isActive: true 
    });

    if (!session) {
      return next(new ErrorResponse('Session expired. Please login again.', 401));
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    next();
  } catch (error) {
    next(error);
  }
};

// Cleanup session on logout
export const cleanupSession = async (userId: string, token: string) => {
  try {
    // Deactivate session
    await Session.updateOne(
      { userId, token, isActive: true },
      { isActive: false }
    );

    // Clear user's current session
    await User.findByIdAndUpdate(userId, { currentSession: null });
  } catch (error) {
    console.error('Error cleaning up session:', error);
  }
};
