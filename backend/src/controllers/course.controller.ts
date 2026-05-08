import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';
import Course from '../models/course.model';
import Enrollment from '../models/enrollment.model';
import { IUserRequest } from '../types/express';
import mongoose from 'mongoose';
import path from 'path';
import { uploadVideo, uploadThumbnail, uploadMultiple } from '../middleware/upload';

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Teacher
export const createCourse = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    console.log('=== Create Course Request ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    // Debug category string
    if (req.body.category) {
      console.log('Category value:', JSON.stringify(req.body.category));
      console.log('Category length:', req.body.category.length);
console.log(
  'Category char codes:',
  Array.from(req.body.category as string).map((char: string) =>
    char.charCodeAt(0)
  )
);    }
    
    // Add user to req.body
    req.body.teacher = req.user.id;

    // Set default status if not provided
    if (!req.body.status) {
      req.body.status = 'draft';
    }

    // Handle files array if present
    if (req.body.files && Array.isArray(req.body.files)) {
      console.log('Processing files array:', req.body.files);
      console.log('Files array length:', req.body.files.length);
      console.log('First file object:', req.body.files[0]);
      // Files are already uploaded and have URLs, just store them as-is
      req.body.files = req.body.files;
    } else {
      console.log('No files array found in request body');
      console.log('req.body.files type:', typeof req.body.files);
      console.log('req.body.files value:', req.body.files);
      // Initialize files as empty array if not provided
      req.body.files = [];
    }

    console.log('Final course data:', req.body);

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    return next(new ErrorResponse(error.message || 'Failed to create course', 500));
  }
});

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Parse query parameters for pagination
  const page = parseInt((req.query as any).page, 10) || 1;
  const limit = parseInt((req.query as any).limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Build query
  let query: any = {};
  
  // Add filters if provided
  if ((req.query as any).teacherId) {
    query.teacher = (req.query as any).teacherId;
  }
  
  if ((req.query as any).status) {
    query.status = (req.query as any).status;
  }
  
  if ((req.query as any).category) {
    query.category = (req.query as any).category;
  }
  
  // Execute query
  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .skip(startIndex)
    .limit(limit)
    .populate('teacher', 'name email');

  // Calculate pagination
  const endIndex = page * limit;
  const pagination: any = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: courses.length,
    pagination,
    data: courses,
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public (with additional data for authenticated users)
export const getCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'name email role avatar')
    .lean();

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Get students count
  const studentsCount = await Enrollment.countDocuments({ course: req.params.id });
  
  // Get lessons count (assuming you have a Lesson model)
  const lessonsCount = 0; // Update this when you have lessons

  // Format the response
  const formattedCourse = {
    ...course,
    studentsCount,
    lessonsCount,
    files: course.files || []
  };

  res.status(200).json({
    success: true,
    data: formattedCourse,
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Teacher
export const updateCourse = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Make sure user is course owner
  if (course.teacher.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new ErrorResponse('Not authorized to update this course', 403));
  }

  // Only validate the fields being updated
  const updateData: any = {};
  
  // If status is being updated, validate it
  if (req.body.status !== undefined) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(req.body.status)) {
      return next(new ErrorResponse('Invalid status. Must be draft, published, or archived', 400));
    }
    updateData.status = req.body.status;
  }

  // Add other fields if they exist in the request
  if (req.body.title !== undefined) updateData.title = req.body.title;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.category !== undefined) updateData.category = req.body.category;
  if (req.body.level !== undefined) updateData.level = req.body.level;
  if (req.body.duration !== undefined) updateData.duration = req.body.duration;
  if (req.body.requirements !== undefined) updateData.requirements = req.body.requirements;
  if (req.body.learningOutcomes !== undefined) updateData.learningOutcomes = req.body.learningOutcomes;
  if (req.body.thumbnail !== undefined) updateData.thumbnail = req.body.thumbnail;
  if (req.body.videoUrl !== undefined) updateData.videoUrl = req.body.videoUrl;
  if (req.body.files !== undefined) updateData.files = req.body.files;

  // Add updatedAt timestamp
  updateData.updatedAt = new Date();

  course = await Course.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: false, // Don't run validators on partial updates
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher
export const deleteCourse = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Make sure user is course owner or admin
  if (course.teacher.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new ErrorResponse('Not authorized to delete this course', 403));
  }

  await Course.findByIdAndDelete(course._id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get courses by teacher
// @route   GET /api/courses/teacher/:teacherId
// @access  Public
export const getCoursesByTeacher = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  const courses = await Course.find({ teacher: req.params.teacherId }).populate('teacher', 'name email');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
export const enrollInCourse = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: req.user.id,
    course: req.params.id,
  });

  if (existingEnrollment) {
    return next(new ErrorResponse('Already enrolled in this course', 400));
  }

  // Create enrollment
  await Enrollment.create({
    student: req.user.id,
    course: req.params.id,
    teacher: course.teacher,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get enrolled courses for current user
// @route   GET /api/courses/enrolled
// @access  Private/Student
export const getEnrolledCourses = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    // Find all enrollments for the current user
    const enrollments = await Enrollment.find({ student: req.user.id });
    
    // Extract course IDs from enrollments
    const courseIds = enrollments.map(enrollment => enrollment.course);
    
    // Find courses by their IDs and populate teacher info
    // Only return courses that are PUBLISHED (not draft or archived)
    const courses = await Course.find({ 
      _id: { $in: courseIds },
      status: 'published'  // Only return published courses
    })
      .populate('teacher', 'name email');
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error in getEnrolledCourses:', error);
    return next(new ErrorResponse('Failed to fetch enrolled courses', 500));
  }
});

// @desc    Get course details with enrolled students
// @route   GET /api/courses/:id/details
// @access  Private/Teacher
export const getCourseDetails = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    console.log('Request received for course details. ID:', id);
    
    if (!id) {
      console.error('No course ID provided in params');
      return next(new ErrorResponse('Course ID is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid course ID format', 400));
    }

    // Get course details
    const course = await Course.findById(id)
      .populate('teacher', 'name email role avatar');

    if (!course) {
      console.error('Course not found with ID:', id);
      return next(new ErrorResponse('Course not found', 404));
    }

    // Check if user is the course teacher or admin
    if (course.teacher._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      console.error('User not authorized to view this course. User ID:', req.user.id, 'Role:', req.user.role, 'Teacher ID:', course.teacher._id);
      return next(new ErrorResponse('Not authorized to view this course details', 403));
    }

    // Get enrollments separately
    const enrollments = await Enrollment.find({ course: id })
      .populate('student', 'name email avatar')
      .sort({ enrolledAt: -1 });

    // Get students count
    const studentsCount = await Enrollment.countDocuments({ course: id });
    
    // Get lessons count (assuming you have a Lesson model)
    const lessonsCount = 0; // Update this when you have lessons

    // Format the response
    const formattedCourse = {
      ...course.toObject(),
      studentsCount,
      lessonsCount,
      enrollments,
    };

    console.log('Sending course details for ID:', id);
    res.status(200).json({
      success: true,
      data: formattedCourse,
    });
  } catch (error) {
    console.error('Error in getCourseDetails:', error);
    return next(new ErrorResponse('Failed to fetch course details', 500));
  }
});

// @desc    Upload video
// @route   POST /api/courses/upload/video
// @access  Private/Teacher
export const uploadVideoFile = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No video file uploaded', 400));
    }

    // Return the file path that can be stored in database
    const filePath = `/uploads/videos/${req.file.filename}`;
    // Generate secure URL with production backend URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://p01--edu-platform--fnj72wsf9xl6.code.run'
      : `http://localhost:${process.env.PORT || 3000}`;
    const secureUrl = `${baseUrl}/api/files/videos/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        //url: filePath
        url: secureUrl
      }
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc    Upload thumbnail
// @route   POST /api/courses/upload/thumbnail
// @access  Private/Teacher
export const uploadThumbnailFile = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No thumbnail file uploaded', 400));
    }

    // Return the file path that can be stored in database
    const filePath = `/uploads/thumbnails/${req.file.filename}`;
    // Generate secure URL with production backend URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://p01--edu-platform--fnj72wsf9xl6.code.run'
      : `http://localhost:${process.env.PORT || 3000}`;
    const secureUrl = `${baseUrl}/api/files/thumbnails/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        //url: filePath
        url: secureUrl
      }
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc    Upload multiple files
// @route   POST /api/courses/upload/files
// @access  Private/Teacher
export const uploadCourseFiles = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('No files uploaded', 400));
    }

    // Return the file paths that can be stored in database
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://p01--edu-platform--fnj72wsf9xl6.code.run'
      : `http://localhost:${process.env.PORT || 3000}`;
    
    const files = (req.files as Express.Multer.File[]).map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `${baseUrl}/api/files/course/${file.filename}` // Generate full URL for course files
    }));
    
    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message, 500));
  }
});
