import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import asyncHandler from '../middleware/async';
import ErrorResponse from '../utils/errorResponse';
import Assignment from '../models/assignment.model';
import Submission from '../models/submission.model';
import { AuthRequest } from '../middleware/auth';

// @desc    Get certificate data for a student's assignment
// @route   GET /api/certificates/assignment/:assignmentId
// @access  Private
export const getCertificateData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { assignmentId } = req.params;

  // Fetch assignment with course and teacher populated
  const assignment = await Assignment.findById(assignmentId)
    .populate('course', 'title')
    .populate('teacher', 'name');

  if (!assignment) {
    return next(new ErrorResponse('Assignment not found', 404));
  }

  // Check that certificate is enabled for this assignment
  if (!assignment.certificateEnabled) {
    return next(new ErrorResponse('Certificate is not enabled for this assignment', 400));
  }

  // Fetch the student's submission for this assignment
  const submission = await Submission.findOne({
    assignment: assignmentId,
    student: req.user.id
  }).populate('student', 'name');

  if (!submission) {
    return next(new ErrorResponse('No submission found for this assignment', 404));
  }

  // Check if the submission has been graded
  if (submission.score === undefined || submission.score === null) {
    return next(new ErrorResponse('Submission has not been graded yet', 400));
  }

  // Calculate percentage and validate passing score
  const percentage = (submission.score / assignment.maxScore) * 100;

  if (percentage < assignment.certificatePassingScore) {
    return next(new ErrorResponse('Student did not meet the passing score for the certificate', 400));
  }

  // Generate certificate ID from submission and assignment IDs
  const certificateId = crypto
    .createHash('sha256')
    .update(`${submission._id}-${assignment._id}`)
    .digest('hex')
    .substring(0, 16);

  // Build response data
  const studentDoc = submission.student as any;
  const courseDoc = assignment.course as any;
  const teacherDoc = assignment.teacher as any;

  res.status(200).json({
    success: true,
    data: {
      studentName: studentDoc?.name || 'Unknown Student',
      assignmentTitle: assignment.title,
      courseName: courseDoc?.title || 'Standalone Assignment',
      score: submission.score,
      maxScore: assignment.maxScore,
      percentage: Math.round(percentage * 100) / 100,
      passingScore: assignment.certificatePassingScore,
      teacherName: teacherDoc?.name || 'Unknown Teacher',
      completedDate: submission.gradedAt || submission.submittedAt,
      certificateId
    }
  });
});
