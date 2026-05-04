import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';
import { generateToken } from '../utils/jwt';
import User from '../models/user.model';
import { enforceSingleDeviceLogin, createSession, cleanupSession } from '../middleware/session.middleware';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return next(new ErrorResponse('Please provide name, email and password', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // Enforce single device login for students
  await enforceSingleDeviceLogin(req, res, async (err?: any) => {
    if (err) return next(err);

    try {
      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'STUDENT',
      });

      // Generate token
      const token = generateToken(user._id.toString());

      // Create session if student
      if (user.role === 'STUDENT') {
        await createSession(user._id.toString(), token, req);
      }

      // Remove password from output
      const userResponse = user.toObject();
      delete userResponse?.password;

      res.status(201).json({
        success: true,
        token,
        user: userResponse,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      return next(new ErrorResponse('Registration failed', 500));
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Enforce single device login for students
  await enforceSingleDeviceLogin(req, res, async (err?: any) => {
    if (err) return next(err);

    try {
      // Generate token
      const token = generateToken(user._id.toString());

      // Create session if student
      if (user.role === 'STUDENT') {
        await createSession(user._id.toString(), token, req);
      }

      // Create user object without password
      const userResponse = user.toObject();
      delete userResponse?.password;

      res.status(200).json({
        success: true,
        token,
        user: userResponse,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return next(new ErrorResponse('Login failed', 500));
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  // Find user in database
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Create user object without password
  const userResponse = user.toObject();
  delete userResponse?.password;

  res.status(200).json({
    success: true,
    data: userResponse,
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token && req.user) {
      // Cleanup session for students
      await cleanupSession(req.user.id, token);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully logged out',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return next(new ErrorResponse('Logout failed', 500));
  }
});

export default {
  register,
  login,
  getMe,
};
