import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';
import Lesson from '../models/lesson.model';
import mongoose from 'mongoose';
import { uploadVideo, uploadMultiple } from '../middleware/upload';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

// @desc    Create a lesson
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Teacher
export const createLesson = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Add user and course to req.body
  req.body.teacher = req.user.id;
  req.body.course = req.params.courseId;

  const lesson = await Lesson.create(req.body);

  res.status(201).json({
    success: true,
    data: lesson,
  });
});

// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Private/Teacher
export const getLessons = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const lessons = await Lesson.find({ course: req.params.courseId })
    .populate('teacher', 'name email')
    .sort({ order: 1 });

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons,
  });
});

// @desc    Get single lesson
// @route   GET /api/courses/:courseId/lessons/:lessonId
// @access  Private/Teacher
export const getLesson = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.lessonId)
    .populate('teacher', 'name email');

  if (!lesson) {
    return next(new ErrorResponse('Lesson not found', 404));
  }

  // Check if user is the course teacher or admin
  if (lesson.teacher._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new ErrorResponse('Not authorized to view this lesson', 403));
  }

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

// @desc    Update lesson
// @route   PUT /api/courses/:courseId/lessons/:lessonId
// @access  Private/Teacher
export const updateLesson = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(new ErrorResponse('Lesson not found', 404));
  }

  // Check if user is the course teacher or admin
  if (lesson.teacher.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new ErrorResponse('Not authorized to update this lesson', 403));
  }

  lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

// @desc    Delete lesson
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Private/Teacher
export const deleteLesson = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    return next(new ErrorResponse('Lesson not found', 404));
  }

  // Check if user is the course teacher or admin
  if (lesson.teacher.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new ErrorResponse('Not authorized to delete this lesson', 403));
  }

  await lesson.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload lesson video
// @route   POST /api/courses/:courseId/lessons/:lessonId/upload-video
// @access  Private/Teacher
export const uploadLessonVideo = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No video file uploaded', 400));
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'education-platform/lesson-videos',
      public_id: `lesson-video-${Date.now()}`,
    });

    // Delete local file after upload
    const fs = require('fs');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Update lesson with video URL
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      { videoUrl: result.secure_url },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return next(new ErrorResponse('Lesson not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        filename: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: result.secure_url
      }
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return next(new ErrorResponse(error.message || 'Failed to upload video', 500));
  }
});

// @desc    Upload lesson files
// @route   POST /api/courses/:courseId/lessons/:lessonId/upload-files
// @access  Private/Teacher
export const uploadLessonFiles = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('No files uploaded', 400));
    }

    const fs = require('fs');
    const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'education-platform/lesson-files',
        public_id: `lesson-file-${Date.now()}-${file.originalname}`,
      });

      // Delete local file after upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        name: file.originalname,
        url: result.secure_url,
        size: file.size,
        type: file.mimetype
      };
    });

    const files = await Promise.all(uploadPromises);

    // Update lesson with new files
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      { $push: { files: files } },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return next(new ErrorResponse('Lesson not found', 404));
    }

    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return next(new ErrorResponse(error.message || 'Failed to upload files', 500));
  }
});

// @desc    Update lesson order
// @route   PUT /api/courses/:courseId/lessons/reorder
// @access  Private/Teacher
export const reorderLessons = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { lessons } = req.body; // Array of { id, order }

  if (!Array.isArray(lessons)) {
    return next(new ErrorResponse('Lessons array is required', 400));
  }

  // Update each lesson's order
  const updatePromises = lessons.map(({ id, order }) =>
    Lesson.findByIdAndUpdate(id, { order })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    data: {},
  });
});
