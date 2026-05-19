import { Request, Response } from 'express';
import Assignment from '../models/assignment.model';
import Submission from '../models/submission.model';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

// Import Course model after database connection
const Course = mongoose.model('Course');

// @desc    Get all assignments created by the current teacher
// @route   GET /api/assignments/teacher
// @access   Private (Teachers only)
export const getTeacherAssignments = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== Get Teacher Assignments ===');
    console.log('User:', req.user);
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get all assignments created by this teacher
    const assignments = await Assignment.find({ teacher: req.user!.id })
      .populate('course', 'title')
      .populate({
        path: 'submissions',
        select: 'student submittedAt score gradedAt'
      })
      .sort({ createdAt: -1 });

    console.log('Found assignments:', assignments.length);

    res.json(assignments);
  } catch (error: any) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching assignments',
      error: error.message 
    });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access   Private (Teacher only)
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== Create Assignment Request ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const {
      title,
      description,
      courseId,
      lesson,
      availableFrom,
      dueDate,
      type,
      questions,
      certificateEnabled,
      certificatePassingScore
    } = req.body;

    console.log('Extracted data:', { title, description, courseId, lesson, availableFrom, dueDate, type, questions, certificateEnabled, certificatePassingScore });

    // Verify course exists and user is teacher (only if courseId is provided)
    let course = null;
    if (courseId) {
      console.log('Looking for course with ID:', courseId);
      course = await Course.findById(courseId);
      console.log('Found course:', course);
      
      // Debug: List all courses to see what's available
      const allCourses = await Course.find({});
      console.log('All courses in database:', allCourses.map(c => ({ id: c._id, title: c.title })));
      
      if (!course) {
        console.log('Course not found');
        return res.status(404).json({ message: 'Course not found' });
      }

      if (course.teacher.toString() !== req.user!.id) {
        console.log('Authorization failed - not the course teacher');
        return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
      }
    } else {
      console.log('Creating standalone assignment (no course)');
    }

    // Validate questions based on assignment type
    if (type === 'mcq' && (!questions.mcq || questions.mcq.length === 0)) {
      return res.status(400).json({ message: 'MCQ assignments must have at least one MCQ question' });
    }

    if (type === 'essay' && (!questions.essay || questions.essay.length === 0)) {
      return res.status(400).json({ message: 'Essay assignments must have at least one essay question' });
    }

    if (type === 'mixed' && 
        ((!questions.mcq || questions.mcq.length === 0) || 
         (!questions.essay || questions.essay.length === 0))) {
      return res.status(400).json({ message: 'Mixed assignments must have both MCQ and essay questions' });
    }

    console.log('Validation passed');

    const assignmentData: any = {
      title,
      description,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      dueDate: new Date(dueDate),
      type,
      questions,
      certificateEnabled,
      certificatePassingScore,
      teacher: req.user!.id
    };

    // Only include course reference if courseId is provided
    if (courseId) {
      assignmentData.course = courseId;
    }

    if (lesson) {
      assignmentData.lesson = lesson;
    }

    const assignment = new Assignment(assignmentData);

    console.log('Created assignment object:', assignment);

    const savedAssignment = await assignment.save();
    console.log('Saved assignment:', savedAssignment);
    
    if (courseId) {
      await savedAssignment.populate('course', 'title');
    }
    console.log('Populated assignment:', savedAssignment);
    
    res.status(201).json(savedAssignment);
  } catch (error: any) {
    console.error('Create assignment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error while creating assignment',
      error: error.message 
    });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/courses/:courseId/assignments
// @access   Private (Teacher of course or enrolled students)
export const getCourseAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization - for now, just check if user is teacher
    const isTeacher = course.teacher.toString() === req.user!.id;
    
    if (!isTeacher) {
      return res.status(403).json({ message: 'Not authorized to view assignments for this course' });
    }

    // Build query
    const query: any = { course: courseId };
    
    // Students can only see published assignments that are available
    if (!isTeacher) {
      query.status = 'published';
      query.$or = [
        { availableFrom: { $exists: false } }, // No availability restriction
        { availableFrom: { $lte: new Date() } } // Available now or in the past
      ];
    } else if (status) {
      query.status = status;
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'title')
      .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (error: any) {
    console.error('Get course assignments error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching assignments',
      error: error.message 
    });
  }
};

// @desc    Get available assignments for student
// @route   GET /api/assignments/student
// @access   Private (Students only)
export const getStudentAssignments = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== Get Student Assignments ===');
    console.log('User:', req.user);
    console.log('User ID:', req.user?.id);
    
    if (!req.user?.id) {
      console.log('❌ No user ID found');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get all courses student is enrolled in
    console.log('🔍 Looking for enrollments...');
    const Enrollment = mongoose.model('Enrollment');
    const enrollments = await Enrollment.find({ student: req.user!.id })
      .populate('course')
      .select('course');

    console.log('Student enrollments found:', enrollments);
    console.log('Number of enrollments:', enrollments?.length || 0);

    // Filter out enrollments with null courses
    const validEnrollments = enrollments.filter(e => e.course && e.course._id);
    console.log('Valid enrollments (with course):', validEnrollments);

    // Get course IDs from valid enrollments
    const courseIds = validEnrollments.map(e => e.course._id);
    console.log('Course IDs extracted:', courseIds);

    // Build query for available assignments - include both course assignments and standalone assignments
    const query: any = {
      status: 'published',
      $or: [
        { availableFrom: { $exists: false } }, // No availability restriction
        { availableFrom: { $lte: new Date() } } // Available now or in the past
      ],
      $and: [
        {
          $or: [
            { course: { $in: courseIds.length > 0 ? courseIds : [null] } }, // Course assignments
            { course: { $exists: false } }, // Standalone assignments
            { course: null } // Another way to catch standalone assignments
          ]
        }
      ]
    };

    console.log('Assignment query:', JSON.stringify(query, null, 2));

    console.log('🔍 Searching for assignments...');
    const assignments = await Assignment.find(query)
      .populate('course', 'title')
      .populate({
        path: 'submissions',
        match: { student: req.user!.id },
        select: 'submittedAt score gradedAt feedback maxScore autoGraded updatedAt mcqAnswers essayAnswers content attachmentUrl'
      })
      .sort({ dueDate: 1 });

    console.log('Found assignments:', assignments);

    // Transform assignments to include proper submission structure
    const transformedAssignments = assignments.map(assignment => ({
      ...assignment.toObject(),
      submissions: assignment.submissions || [] // Keep populated submissions or use empty array
    }));

    res.json(transformedAssignments);
  } catch (error: any) {
    console.error('❌ Get student assignments error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    res.status(500).json({ 
      message: 'Server error while fetching assignments',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access   Private (Authorized users)
export const getAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title teacher')
      .populate('lesson', 'title');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization
    const isTeacher = assignment.teacher.toString() === req.user!.id;
    
    if (!isTeacher) {
      // Student authorization check
      if (assignment.status !== 'published') {
        return res.status(403).json({ message: 'Assignment is not yet published' });
      }
      
      if (assignment.availableFrom && new Date() < new Date(assignment.availableFrom)) {
        return res.status(403).json({ 
          message: 'Assignment is not yet available',
          availableFrom: assignment.availableFrom
        });
      }
      
      // For standalone assignments, no enrollment check needed
      if (assignment.course) {
        // Check if student is enrolled in course
        const Enrollment = mongoose.model('Enrollment');
        const enrollment = await Enrollment.findOne({
          student: req.user!.id,
          course: assignment.course
        });
        
        if (!enrollment) {
          return res.status(403).json({ message: 'Not enrolled in this course' });
        }
      }
      // If no course (standalone assignment), allow access
    }

    res.json(assignment);
  } catch (error: any) {
    console.error('Get assignment error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching assignment',
      error: error.message 
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access   Private (Assignment teacher only)
export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    // Don't allow updates if there are submissions
    const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
    if (submissionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot update assignment after students have submitted' 
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');

    res.json(updatedAssignment);
  } catch (error: any) {
    console.error('Update assignment error:', error);
    res.status(500).json({ 
      message: 'Server error while updating assignment',
      error: error.message 
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access   Private (Assignment teacher only)
export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting assignment',
      error: error.message 
    });
  }
};

// @desc    Publish assignment
// @route   PUT /api/assignments/:id/publish
// @access   Private (Assignment teacher only)
export const publishAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to publish this assignment' });
    }

    if (assignment.status === 'published') {
      return res.status(400).json({ message: 'Assignment is already published' });
    }

    // Validate that assignment has questions
    if (assignment.type === 'mcq' && (!assignment.questions.mcq || assignment.questions.mcq.length === 0)) {
      return res.status(400).json({ message: 'Cannot publish MCQ assignment without questions' });
    }

    if (assignment.type === 'essay' && (!assignment.questions.essay || assignment.questions.essay.length === 0)) {
      return res.status(400).json({ message: 'Cannot publish essay assignment without questions' });
    }

    if (assignment.type === 'mixed' && 
        ((!assignment.questions.mcq || assignment.questions.mcq.length === 0) || 
         (!assignment.questions.essay || assignment.questions.essay.length === 0))) {
      return res.status(400).json({ message: 'Cannot publish mixed assignment without both MCQ and essay questions' });
    }

    const publishedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    ).populate('course', 'title');

    res.json(publishedAssignment);
  } catch (error: any) {
    console.error('Publish assignment error:', error);
    res.status(500).json({ 
      message: 'Server error while publishing assignment',
      error: error.message 
    });
  }
};

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access   Private (Assignment teacher only)
export const getAssignmentSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized to view submissions for this assignment' });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    // Transform submissions to include id field for frontend compatibility
    const transformedSubmissions = submissions.map(submission => ({
      id: submission._id,
      assignmentId: submission.assignment,
      studentId: submission.student._id,
      student: submission.student,
      content: submission.content,
      attachmentUrl: submission.attachmentUrl,
      score: submission.score,
      maxScore: submission.maxScore,
      feedback: submission.feedback,
      autoGraded: submission.autoGraded,
      gradedAt: submission.gradedAt,
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt,
      mcqAnswers: submission.mcqAnswers,
      essayAnswers: submission.essayAnswers
    }));

    res.json(transformedSubmissions);
  } catch (error: any) {
    console.error('Get submissions error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching submissions',
      error: error.message 
    });
  }
};
