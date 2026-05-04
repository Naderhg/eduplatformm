import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/assignment.model';
import Submission from '../models/submission.model';
import { AuthRequest } from '../middleware/auth';

// @desc    Submit assignment
// @route   POST /api/assignments/:assignmentId/submit
// @access   Private (Enrolled students only)
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { mcqAnswers, essayAnswers, content, attachmentUrl } = req.body;

    // Get assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if assignment is published and available
    if (assignment.status !== 'published') {
      return res.status(400).json({ message: 'Assignment is not published' });
    }

    if (assignment.availableFrom && new Date() < new Date(assignment.availableFrom)) {
      return res.status(400).json({ 
        message: 'Assignment is not yet available',
        availableFrom: assignment.availableFrom
      });
    }

    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed' });
    }

    // Check if student is enrolled in course (only for course assignments)
    if (assignment.course) {
      const Enrollment = mongoose.model('Enrollment');
      const enrollment = await Enrollment.findOne({
        student: req.user!.id,
        course: assignment.course
      });
      
      if (!enrollment) {
        return res.status(403).json({ message: 'Student is not enrolled in this course' });
      }
    }
    // If no course (standalone assignment), allow access without enrollment check

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user!.id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Validate submission based on assignment type
    if (assignment.type === 'mcq' && (!mcqAnswers || mcqAnswers.length === 0)) {
      return res.status(400).json({ message: 'MCQ answers are required' });
    }

    if (assignment.type === 'essay' && (!essayAnswers || essayAnswers.length === 0) && !content) {
      return res.status(400).json({ message: 'Essay answers are required' });
    }

    if (assignment.type === 'mixed' && 
        ((!mcqAnswers || mcqAnswers.length === 0) || 
         (!essayAnswers || essayAnswers.length === 0))) {
      return res.status(400).json({ message: 'Both MCQ and essay answers are required for mixed assignments' });
    }

    // Process MCQ answers for auto-grading
    let processedMCQAnswers: any[] = [];
    let mcqScore = 0;

    if (mcqAnswers && assignment.questions.mcq) {
      processedMCQAnswers = mcqAnswers.map((answer: any) => {
        const question = assignment.questions.mcq?.find((q: any) => q._id.toString() === answer.questionId);
        
        if (!question) {
          throw new Error(`MCQ question with ID ${answer.questionId} not found`);
        }

        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        const points = isCorrect ? question.points : 0;
        
        if (isCorrect) {
          mcqScore += points;
        }

        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          points
        };
      });
    }

    // Process essay answers
    let processedEssayAnswers: any[] = [];
    
    if (essayAnswers && assignment.questions.essay) {
      processedEssayAnswers = essayAnswers.map((answer: any) => {
        const question = assignment.questions.essay?.find((q: any) => q._id.toString() === answer.questionId);
        
        if (!question) {
          throw new Error(`Essay question with ID ${answer.questionId} not found`);
        }

        const wordCount = answer.answer.split(/\s+/).filter((word: string) => word.length > 0).length;
        
        // Check word limit if specified
        if (question.maxWords && wordCount > question.maxWords) {
          throw new Error(`Essay answer exceeds word limit of ${question.maxWords} words`);
        }

        return {
          questionId: answer.questionId,
          answer: answer.answer,
          wordCount,
          points: 0 // Essay questions need manual grading
        };
      });
    }

    // Calculate total score
    let totalScore = mcqScore;
    let autoGraded = false;

    if (assignment.type === 'mcq') {
      totalScore = mcqScore;
      autoGraded = true;
    } else if (assignment.type === 'mixed') {
      totalScore = mcqScore; // Only MCQ portion is auto-graded
      autoGraded = false; // Still needs manual grading for essay portion
    }

    // Create submission
    const submission = new Submission({
      assignment: assignmentId,
      student: req.user!.id,
      mcqAnswers: processedMCQAnswers,
      essayAnswers: processedEssayAnswers,
      content, // For backward compatibility
      attachmentUrl,
      score: autoGraded ? totalScore : undefined,
      maxScore: assignment.maxScore,
      autoGraded,
      gradedAt: autoGraded ? new Date() : undefined
    });

    const savedSubmission = await submission.save();
    await savedSubmission.populate('student', 'name email');
    await savedSubmission.populate('assignment', 'title dueDate maxScore');

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: savedSubmission,
      score: autoGraded ? totalScore : 'Pending manual grading'
    });

  } catch (error: any) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ 
      message: 'Server error while submitting assignment',
      error: error.message 
    });
  }
};

// @desc    Grade submission (for essay questions)
// @route   PUT /api/submissions/:id/grade
// @access   Private (Assignment teacher only)
export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { score, feedback, essayGrades } = req.body;

    console.log('=== Grade Submission Request ===');
    console.log('Request body:', { score, feedback, essayGrades });
    console.log('Submission ID:', req.params.id);

    const submission = await Submission.findById(req.params.id)
      .populate('assignment')
      .populate('student', 'name email');

    console.log('Found submission:', submission);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is the teacher of the assignment
    const assignment = submission.assignment as any;
    if (assignment.teacher.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to grade this submission' });
    }

    console.log('Essay answers:', submission.essayAnswers);
    console.log('MCQ answers:', submission.mcqAnswers);

    // Update essay answers with grades and feedback
    if (essayGrades && submission.essayAnswers) {
      console.log('Updating essay answers with grades:', essayGrades);
      console.log('Current essay answers:', submission.essayAnswers);
      
      submission.essayAnswers.forEach((answer: any) => {
        console.log('Looking for grade for questionId:', answer.questionId);
        const grade = essayGrades.find((g: any) => g.questionId === answer.questionId);
        console.log('Found grade:', grade);
        if (grade) {
          console.log('Before update - answer.points:', answer.points);
          answer.points = grade.points;
          answer.feedback = grade.feedback;
          console.log('After update - answer.points:', answer.points);
        } else {
          console.log('No grade found for questionId:', answer.questionId);
        }
      });
      
      console.log('Essay answers after update:', submission.essayAnswers);
    }

    // Calculate total score
    let totalScore = 0;
    
    // Add MCQ score
    if (submission.mcqAnswers) {
      const mcqScore = submission.mcqAnswers.reduce((sum: number, answer: any) => sum + answer.points, 0);
      totalScore += mcqScore;
      console.log('MCQ score calculated:', mcqScore);
    }
    
    // Add essay score
    if (submission.essayAnswers) {
      const essayScore = submission.essayAnswers.reduce((sum: number, answer: any) => sum + (answer.points || 0), 0);
      totalScore += essayScore;
      console.log('Essay score calculated:', essayScore);
    }

    console.log('Total score calculated:', totalScore);
    console.log('Requested score from teacher:', score);

    // Update submission
    submission.score = totalScore;
    submission.feedback = feedback;
    submission.gradedAt = new Date();

    console.log('About to save submission...');

    const gradedSubmission = await submission.save();

    console.log('Submission saved successfully:', gradedSubmission);

    res.json({
      message: 'Submission graded successfully',
      submission: gradedSubmission,
      score: totalScore
    });

  } catch (error: any) {
    console.error('Grade submission error:', error);
    res.status(500).json({ 
      message: 'Server error while grading submission',
      error: error.message 
    });
  }
};

// @desc    Get student's submissions
// @route   GET /api/submissions/my
// @access   Private (Students only)
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await Submission.find({ student: req.user!.id })
      .populate('assignment', 'title dueDate maxScore course')
      .populate({
        path: 'assignment',
        populate: {
          path: 'course',
          select: 'title'
        }
      })
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error: any) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching submissions',
      error: error.message 
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access   Private (Authorized users)
export const getSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignment')
      .populate('student', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check authorization
    const assignment = submission.assignment as any;
    const isTeacher = assignment.teacher.toString() === req.user!.id;
    const isStudent = submission.student._id.toString() === req.user!.id;

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error: any) {
    console.error('Get submission error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching submission',
      error: error.message 
    });
  }
};

// @desc    Get submission by assignment ID for current student
// @route   GET /api/submissions/assignment/:assignmentId
// @access   Private (Students only)
export const getSubmissionByAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const submission = await Submission.findOne({ 
      assignment: assignmentId, 
      student: req.user!.id 
    })
      .populate('assignment', 'title dueDate maxScore course type questions')
      .populate('student', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Calculate total score (MCQ + Essay)
    let totalScore = 0;
    
    // Add MCQ score
    if (submission.mcqAnswers) {
      const mcqScore = submission.mcqAnswers.reduce((sum: number, answer: any) => sum + answer.points, 0);
      totalScore += mcqScore;
      console.log('MCQ score:', mcqScore);
    }
    
    // Add essay score
    if (submission.essayAnswers) {
      const essayScore = submission.essayAnswers.reduce((sum: number, answer: any) => sum + (answer.points || 0), 0);
      totalScore += essayScore;
      console.log('Essay score:', essayScore);
    }

    console.log('Total calculated score:', totalScore);
    console.log('Database score:', submission.score);

    // Transform submission to include id field for frontend compatibility
    const transformedSubmission = {
      id: submission._id,
      assignmentId: submission.assignment,
      studentId: submission.student._id,
      student: submission.student,
      content: submission.content,
      attachmentUrl: submission.attachmentUrl,
      score: totalScore, // Use calculated total score instead of database score
      maxScore: submission.maxScore,
      feedback: submission.feedback,
      autoGraded: submission.autoGraded,
      gradedAt: submission.gradedAt,
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt,
      mcqAnswers: submission.mcqAnswers,
      essayAnswers: submission.essayAnswers
    };

    res.json(transformedSubmission);
  } catch (error: any) {
    console.error('Get submission by assignment error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching submission',
      error: error.message 
    });
  }
};

// @desc    Get all submissions for an assignment with student rankings
// @route   GET /api/submissions/assignment/:assignmentId/rankings
// @access   Private (Assignment teacher only)
export const getAssignmentSubmissionsWithRankings = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to view submissions for this assignment' });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email avatar')
      .sort({ score: -1, submittedAt: 1 }); // Sort by score descending, then by submission time ascending

    // Add rankings to submissions
    const submissionsWithRankings = submissions.map((submission, index) => {
      return {
        ...submission.toObject(),
        rank: index + 1,
        percentageScore: submission.score && assignment.maxScore > 0 
          ? Math.round((submission.score / assignment.maxScore) * 100) 
          : 0
      };
    });

    res.json({
      success: true,
      data: submissionsWithRankings,
      assignment: {
        id: assignment._id,
        title: assignment.title,
        maxScore: assignment.maxScore,
        totalSubmissions: submissions.length
      }
    });
  } catch (error: any) {
    console.error('Get assignment submissions with rankings error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching submissions',
      error: error.message 
    });
  }
};

// @desc    Get all submissions for an assignment with rankings (for students to see their position)
// @route   GET /api/submissions/assignment/:assignmentId/public-rankings
// @access   Private (Enrolled students only)
export const getAssignmentPublicRankings = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in course (only for course assignments)
    if (assignment.course) {
      const Enrollment = mongoose.model('Enrollment');
      const enrollment = await Enrollment.findOne({
        student: req.user!.id,
        course: assignment.course
      });
      
      if (!enrollment) {
        return res.status(403).json({ message: 'Student is not enrolled in this course' });
      }
    }
    // If no course (standalone assignment), allow access without enrollment check

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email avatar')
      .sort({ score: -1, submittedAt: 1 });

    // Add rankings to submissions
    const submissionsWithRankings = submissions.map((submission, index) => {
      return {
        ...submission.toObject(),
        rank: index + 1,
        percentageScore: submission.score && assignment.maxScore > 0 
          ? Math.round((submission.score / assignment.maxScore) * 100) 
          : 0
      };
    });

    res.json({
      success: true,
      data: submissionsWithRankings,
      assignment: {
        id: assignment._id,
        title: assignment.title,
        maxScore: assignment.maxScore,
        totalSubmissions: submissions.length
      }
    });
  } catch (error: any) {
    console.error('Get assignment public rankings error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching rankings',
      error: error.message 
    });
  }
};

// @desc    Get submission statistics for an assignment
// @route   GET /api/assignments/:assignmentId/stats
// @access   Private (Assignment teacher only)
export const getAssignmentStats = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to view stats for this assignment' });
    }

    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email');

    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(sub => sub.score !== undefined).length;
    const autoGradedSubmissions = submissions.filter(sub => sub.autoGraded).length;
    
    let averageScore = 0;
    let highestScore = 0;
    let lowestScore = assignment.maxScore;

    const gradedSubmissionsWithScores = submissions.filter(sub => sub.score !== undefined);
    
    if (gradedSubmissionsWithScores.length > 0) {
      const scores = gradedSubmissionsWithScores.map(sub => sub.score!);
      averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);
    }

    res.json({
      totalSubmissions,
      gradedSubmissions,
      autoGradedSubmissions,
      pendingGrading: totalSubmissions - gradedSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      maxScore: assignment.maxScore,
      submissions: submissions.map(sub => ({
        id: sub._id,
        student: sub.student,
        score: sub.score,
        submittedAt: sub.submittedAt,
        gradedAt: sub.gradedAt,
        autoGraded: sub.autoGraded
      }))
    });

  } catch (error: any) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching assignment stats',
      error: error.message 
    });
  }
};
