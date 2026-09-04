import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/async';
import Conversation from '../models/conversation.model';
import Enrollment from '../models/enrollment.model';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
  })
    .populate('teacher', 'name email avatar role')
    .populate('student', 'name email avatar role')
    .sort({ lastMessageAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

// @desc    Get a single conversation with messages
// @route   GET /api/chat/conversations/:conversationId
// @access  Private
export const getConversation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user.id,
  })
    .populate('teacher', 'name email avatar role')
    .populate('student', 'name email avatar role')
    .lean();

  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

// @desc    Create or get a conversation with another user
// @route   POST /api/chat/conversations
// @access  Private
// @body    { participantId }
export const createConversation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { participantId } = req.body;
  if (!participantId) {
    return next(new ErrorResponse('Participant ID is required', 400));
  }

  // Get the other user
  const otherUser = await User.findById(participantId);
  if (!otherUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Determine teacher and student
  let teacherId: string;
  let studentId: string;

  if (req.user.role === 'TEACHER') {
    teacherId = req.user.id;
    studentId = participantId;
    // Verify the student is enrolled in one of the teacher's courses
    const enrolled = await Enrollment.findOne({ teacher: teacherId, student: studentId });
    if (!enrolled) {
      return next(new ErrorResponse('You can only chat with students enrolled in your courses', 403));
    }
  } else if (req.user.role === 'STUDENT') {
    studentId = req.user.id;
    teacherId = participantId;
    // Verify the student is enrolled in one of the teacher's courses
    const enrolled = await Enrollment.findOne({ teacher: teacherId, student: studentId });
    if (!enrolled) {
      return next(new ErrorResponse('You can only chat with your teachers', 403));
    }
  } else {
    return next(new ErrorResponse('Invalid role for chat', 400));
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({ teacher: teacherId, student: studentId });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [teacherId, studentId],
      teacher: teacherId,
      student: studentId,
    });
  }

  await conversation.populate('teacher', 'name email avatar role');
  await conversation.populate('student', 'name email avatar role');

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

// @desc    Send a message in a conversation
// @route   POST /api/chat/conversations/:conversationId/messages
// @access  Private
// @body    { text }
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return next(new ErrorResponse('Message text is required', 400));
  }

  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user.id,
  });

  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  // Add message
  const message = {
    sender: req.user.id as any,
    text: text.trim(),
    read: false,
    readAt: null,
  };

  conversation.messages.push(message as any);
  conversation.lastMessage = text.trim();
  conversation.lastMessageAt = new Date();

  // Increment unread count for the other participant
  if (req.user.id === conversation.teacher.toString()) {
    conversation.unreadCountStudent = (conversation.unreadCountStudent || 0) + 1;
  } else {
    conversation.unreadCountTeacher = (conversation.unreadCountTeacher || 0) + 1;
  }

  await conversation.save();

  // Get the saved message (last one in array)
  const savedMessage = conversation.messages[conversation.messages.length - 1];

  res.status(201).json({
    success: true,
    data: {
      _id: savedMessage._id,
      sender: savedMessage.sender,
      text: savedMessage.text,
      read: savedMessage.read,
      createdAt: savedMessage.createdAt,
      conversationId: conversation._id,
    },
  });
});

// @desc    Mark conversation messages as read
// @route   PUT /api/chat/conversations/:conversationId/read
// @access  Private
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    participants: req.user.id,
  });

  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  // Mark all messages from the other user as read
  conversation.messages.forEach((msg) => {
    if (msg.sender.toString() !== req.user.id && !msg.read) {
      msg.read = true;
      msg.readAt = new Date();
    }
  });

  // Reset unread count for the current user
  if (req.user.id === conversation.teacher.toString()) {
    conversation.unreadCountTeacher = 0;
  } else {
    conversation.unreadCountStudent = 0;
  }

  await conversation.save();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get list of chat contacts (teachers for students, students for teachers)
// @route   GET /api/chat/contacts
// @access  Private
export const getChatContacts = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let contacts: any[] = [];

  if (req.user.role === 'TEACHER') {
    // Get all students enrolled in the teacher's courses
    const enrollments = await Enrollment.find({ teacher: req.user.id })
      .populate('student', 'name email avatar role')
      .populate('course', 'title')
      .lean();

    // Deduplicate students
    const studentMap: Record<string, any> = {};
    enrollments.forEach((en: any) => {
      if (en.student && !studentMap[en.student._id.toString()]) {
        studentMap[en.student._id.toString()] = {
          _id: en.student._id,
          name: en.student.name,
          email: en.student.email,
          avatar: en.student.avatar,
          role: en.student.role,
          course: en.course?.title,
        };
      }
    });
    contacts = Object.values(studentMap);
  } else if (req.user.role === 'STUDENT') {
    // Get all teachers of courses the student is enrolled in
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('teacher', 'name email avatar role')
      .populate('course', 'title')
      .lean();

    // Deduplicate teachers
    const teacherMap: Record<string, any> = {};
    enrollments.forEach((en: any) => {
      if (en.teacher && !teacherMap[en.teacher._id.toString()]) {
        teacherMap[en.teacher._id.toString()] = {
          _id: en.teacher._id,
          name: en.teacher.name,
          email: en.teacher.email,
          avatar: en.teacher.avatar,
          role: en.teacher.role,
          course: en.course?.title,
        };
      }
    });
    contacts = Object.values(teacherMap);
  }

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});
