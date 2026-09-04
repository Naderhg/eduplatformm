import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  markAsRead,
  getChatContacts,
} from '../controllers/chat.controller';
import { protect } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(protect);

// Get chat contacts (teachers for students, students for teachers)
router.get('/contacts', getChatContacts);

// Get all conversations for the current user
router.get('/conversations', getConversations);

// Create or get a conversation
router.post(
  '/conversations',
  [body('participantId').notEmpty().withMessage('Participant ID is required')],
  createConversation
);

// Get a single conversation with messages
router.get('/conversations/:conversationId', getConversation);

// Send a message
router.post(
  '/conversations/:conversationId/messages',
  [body('text').trim().notEmpty().withMessage('Message text is required')],
  sendMessage
);

// Mark messages as read
router.put('/conversations/:conversationId/read', markAsRead);

export default router;
