import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

// Import models after database connection
const User = mongoose.model('User');
const Course = mongoose.model('Course');
const Enrollment = mongoose.model('Enrollment');
const Assignment = mongoose.model('Assignment');
const Submission = mongoose.model('Submission');

// @desc    Get all students enrolled in teacher's courses
// @route   GET /api/students/teacher
// @access   Private (Teachers only)
export const getTeacherStudents = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== Get Teacher Students ===');
    console.log('User:', req.user);
    
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get all courses taught by this teacher
    const courses = await Course.find({ teacher: req.user!.id }).select('_id');
    const courseIds = courses.map(course => course._id);

    console.log('Teacher courses:', courseIds);

    // Get all enrollments in teacher's courses
    const enrollments = await Enrollment.find({ 
      course: { $in: courseIds } 
    })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 });

    console.log('Found enrollments:', enrollments.length);

    // Aggregate enrollments by student
    const studentAggregates = new Map();
    enrollments.forEach((enrollment: any) => {
      const studentId = enrollment.student._id;
      const existing = studentAggregates.get(studentId);
      
      if (existing) {
        // Add to existing data
        existing.enrolledCourses += 1;
        existing.courses.push({
          id: enrollment.course._id,
          title: enrollment.course.title
        });
      } else {
        // Create new student entry
        studentAggregates.set(studentId, {
          id: studentId,
          name: enrollment.student.name,
          email: enrollment.student.email,
          enrolledCourses: 1,
          completedAssignments: 0,
          averageScore: 0,
          lastActive: enrollment.enrolledAt,
          courses: [{
            id: enrollment.course._id,
            title: enrollment.course.title
          }]
        });
      }
    });

    console.log('Aggregated students:', studentAggregates.size);

    // Get student details with assignment stats
    const studentsData = await Promise.all(
      Array.from(studentAggregates.values()).map(async (studentData: any) => {
        const studentId = studentData.id;
        
        // Get student's assignment submissions
        const submissions = await Submission.find({ 
          student: studentId 
        }).select('score gradedAt submittedAt');

        // Get all assignments for the courses the student is enrolled in
        const courseIds = studentData.courses.map((c: any) => c.id);
        const allAssignments = await Assignment.find({ 
          course: { $in: courseIds } 
        }).select('maxScore');

        // Calculate maxScore (total points from all assignments)
        const maxScore = allAssignments.reduce((sum: number, assignment: any) => sum + (assignment.maxScore || 0), 0);

        // Calculate student stats
        const completedAssignments = submissions.length;
        const gradedSubmissions = submissions.filter(s => s.score !== undefined && s.score !== null);
        const totalScore = gradedSubmissions.reduce((sum: number, s: any) => sum + s.score, 0);
        const averageScore = gradedSubmissions.length > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        const lastActive = submissions.length > 0 
          ? new Date(Math.max(...submissions.map(s => new Date(s.submittedAt || s.createdAt).getTime())))
          : studentData.lastActive;

        return {
          ...studentData,
          completedAssignments,
          averageScore,
          maxScore,
          lastActive
        };
      })
    );

    console.log('Students data processed:', studentsData.length);

    res.json(studentsData);
  } catch (error: any) {
    console.error('Get teacher students error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching students',
      error: error.message 
    });
  }
};
