import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';
import Comment from '../models/comment.model';
import Course from '../models/course.model';
import Enrollment from '../models/enrollment.model';
import { IUserRequest } from '../types/express';

// @desc    Create a comment on a course
// @route   POST /api/comments
// @access  Private (Student or Teacher)
export const createComment = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    const { content, courseId, parentCommentId } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }

    // Check if user has access to comment on this course
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!isTeacher && !isEnrolled) {
      return next(new ErrorResponse('You must be enrolled in this course to comment', 403));
    }

    // Validate parent comment if this is a reply
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return next(new ErrorResponse('Parent comment not found', 404));
      }
      if (parentComment.course.toString() !== courseId) {
        return next(new ErrorResponse('Parent comment does not belong to this course', 400));
      }
    }

    // Create comment
    const comment = await Comment.create({
      content,
      course: courseId,
      author: req.user.id,
      parentComment: parentCommentId || null,
    });

    // Populate author and course info
    await comment.populate([
      { path: 'author', select: 'name email avatar role' },
      { path: 'course', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message || 'Failed to create comment', 500));
  }
});

// @desc    Get comments for a course
// @route   GET /api/comments/course/:courseId
// @access  Private (Student or Teacher)
export const getCourseComments = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }

    // Check if user has access to view comments
    const isTeacher = course.teacher.toString() === req.user.id;
    const isEnrolled = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (!isTeacher && !isEnrolled) {
      return next(new ErrorResponse('You must be enrolled in this course to view comments', 403));
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      course: courseId,
      parentComment: null
    })
    .populate('author', 'name email avatar role')
    .sort({ createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id
        })
        .populate('author', 'name email avatar role')
        .sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.status(200).json({
      success: true,
      count: commentsWithReplies.length,
      data: commentsWithReplies,
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message || 'Failed to fetch comments', 500));
  }
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Comment author only)
export const updateComment = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(new ErrorResponse('Comment not found', 404));
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this comment', 403));
    }

    // Update comment
    comment.content = content;
    await comment.save();

    // Populate author info
    await comment.populate('author', 'name email avatar role');

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message || 'Failed to update comment', 500));
  }
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author or course teacher)
export const deleteComment = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(new ErrorResponse('Comment not found', 404));
    }

    // Get course to check if user is teacher
    const course = await Course.findById(comment.course);
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }

    // Check if user is the author or the course teacher
    const isAuthor = comment.author.toString() === req.user.id;
    const isTeacher = course.teacher.toString() === req.user.id;

    if (!isAuthor && !isTeacher) {
      return next(new ErrorResponse('Not authorized to delete this comment', 403));
    }

    // Delete comment and its replies
    await Comment.deleteMany({
      $or: [
        { _id: req.params.id },
        { parentComment: req.params.id }
      ]
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message || 'Failed to delete comment', 500));
  }
});

// @desc    Get comment statistics for a course
// @route   GET /api/comments/course/:courseId/stats
// @access  Private (Teacher only)
export const getCommentStats = asyncHandler(async (req: IUserRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;

    // Validate course exists and user is teacher
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorResponse('Course not found', 404));
    }

    if (course.teacher.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view comment statistics', 403));
    }

    // Get statistics
    const totalComments = await Comment.countDocuments({ course: courseId });
    const totalReplies = await Comment.countDocuments({ 
      course: courseId, 
      isReply: true 
    });
    const topLevelComments = totalComments - totalReplies;

    res.status(200).json({
      success: true,
      data: {
        totalComments,
        totalReplies,
        topLevelComments
      },
    });
  } catch (error: any) {
    return next(new ErrorResponse(error.message || 'Failed to fetch comment statistics', 500));
  }
});
