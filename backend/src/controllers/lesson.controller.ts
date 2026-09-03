import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';
import Lesson from '../models/lesson.model';
import LessonProgress from '../models/lessonProgress.model';
import Enrollment from '../models/enrollment.model';
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

  // Check if user is the course teacher, admin, or enrolled student
  if (lesson.teacher._id.toString() !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'STUDENT') {
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

// @desc    Mark lesson as viewed by student
// @route   POST /api/lessons/:lessonId/mark-viewed
// @access  Private/Student
export const markLessonViewed = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) {
    return next(new ErrorResponse('Lesson not found', 404));
  }

  // Upsert progress record - mark as viewed
  const progress = await LessonProgress.findOneAndUpdate(
    { student: req.user.id, lesson: lesson._id },
    {
      $set: {
        student: req.user.id,
        lesson: lesson._id,
        course: lesson.course,
        viewed: true,
        viewedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    data: progress,
  });
});

// @desc    Submit lesson answers (auto-graded)
// @route   POST /api/lessons/:lessonId/submit-answers
// @access  Private/Student
// @body    { answers: [{ questionIndex, answer }] }
export const submitLessonAnswers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) {
    return next(new ErrorResponse('Lesson not found', 404));
  }

  const submittedAnswers: Array<{ questionIndex: number; answer: string }> = req.body.answers;
  if (!Array.isArray(submittedAnswers)) {
    return next(new ErrorResponse('Answers array is required', 400));
  }

  // Grade each answer
  const gradedAnswers = submittedAnswers.map((sa) => {
    const question = lesson.questions[sa.questionIndex];
    if (!question) {
      return { questionIndex: sa.questionIndex, answer: sa.answer, correct: false };
    }
    // Compare answer to correctAnswer (case-insensitive, trimmed)
    const isCorrect =
      String(sa.answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    return { questionIndex: sa.questionIndex, answer: sa.answer, correct: isCorrect };
  });

  // Calculate score
  let score = 0;
  let maxScore = 0;
  gradedAnswers.forEach((ga) => {
    const q = lesson.questions[ga.questionIndex];
    if (q) {
      maxScore += q.points;
      if (ga.correct) score += q.points;
    }
  });

  // Upsert progress record with score & answers
  const progress = await LessonProgress.findOneAndUpdate(
    { student: req.user.id, lesson: lesson._id },
    {
      $set: {
        student: req.user.id,
        lesson: lesson._id,
        course: lesson.course,
        viewed: true,
        viewedAt: new Date(),
        score,
        maxScore,
        answers: gradedAnswers,
        submittedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    data: {
      score,
      maxScore,
      answers: gradedAnswers,
      progress,
    },
  });
});

// @desc    Get student's progress for a lesson
// @route   GET /api/lessons/:lessonId/progress
// @access  Private
export const getLessonProgress = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const progress = await LessonProgress.findOne({
    student: req.user.id,
    lesson: req.params.lessonId,
  });

  res.status(200).json({
    success: true,
    data: progress || null,
  });
});

// @desc    Get all students' progress for a course (teacher view)
// @route   GET /api/lessons/course/:courseId/students-progress
// @access  Private/Teacher
export const getCourseStudentsProgress = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const courseId = req.params.courseId;

  // Get all lessons for the course
  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).select('_id title order questions');
  const lessonIds = lessons.map((l) => l._id);

  // Get all progress records for these lessons
  const progressRecords = await LessonProgress.find({
    course: courseId,
    lesson: { $in: lessonIds },
  })
    .populate('student', 'name email avatar')
    .lean();

  // Get all enrolled students
  const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'name email avatar').lean();
  const enrolledStudents = enrollments.map((e) => e.student);

  // Build a map: studentId -> { student, lessons: { lessonId -> { viewed, score, maxScore, submittedAt } } }
  const studentMap: Record<string, any> = {};
  enrolledStudents.forEach((s: any) => {
    studentMap[s._id.toString()] = {
      student: { _id: s._id, name: s.name, email: s.email, avatar: s.avatar },
      lessons: {},
      totalScore: 0,
      totalMaxScore: 0,
      viewedCount: 0,
      submittedCount: 0,
    };
  });

  progressRecords.forEach((pr: any) => {
    const sid = pr.student?._id?.toString() || pr.student?.toString();
    if (!sid || !studentMap[sid]) return;
    const lid = pr.lesson.toString();
    studentMap[sid].lessons[lid] = {
      viewed: pr.viewed,
      score: pr.score,
      maxScore: pr.maxScore,
      submittedAt: pr.submittedAt,
      viewedAt: pr.viewedAt,
    };
    studentMap[sid].totalScore += pr.score || 0;
    studentMap[sid].totalMaxScore += pr.maxScore || 0;
    if (pr.viewed) studentMap[sid].viewedCount += 1;
    if (pr.submittedAt) studentMap[sid].submittedCount += 1;
  });

  const result = Object.values(studentMap);

  res.status(200).json({
    success: true,
    data: {
      lessons: lessons.map((l) => ({ _id: l._id, title: l.title, order: l.order, questionsCount: l.questions?.length || 0 })),
      students: result,
    },
  });
});
