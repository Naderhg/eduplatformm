import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Conversation from '../models/conversation.model';

// Map of userId -> socketId[]
const connectedUsers = new Map<string, string[]>();

export const setupSocket = (server: HttpServer) => {
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      (socket as any).userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    console.log(`Socket connected: ${userId}`);

    // Track connected user
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, []);
    }
    connectedUsers.get(userId)!.push(socket.id);

    // Join a room with the user's ID so we can send messages to them
    socket.join(userId);

    // Send a message
    socket.on('sendMessage', async (data: { conversationId: string; text: string; receiverId: string }) => {
      try {
        const conversation = await Conversation.findById(data.conversationId);
        if (!conversation) return;

        // Verify sender is a participant
        if (!conversation.participants.some((p) => p.toString() === userId)) return;

        // Save message to DB
        const message = {
          sender: userId as any,
          text: data.text.trim(),
          read: false,
          readAt: null,
        };

        conversation.messages.push(message as any);
        conversation.lastMessage = data.text.trim();
        conversation.lastMessageAt = new Date();

        // Increment unread count for receiver
        if (userId === conversation.teacher.toString()) {
          conversation.unreadCountStudent = (conversation.unreadCountStudent || 0) + 1;
        } else {
          conversation.unreadCountTeacher = (conversation.unreadCountTeacher || 0) + 1;
        }

        await conversation.save();

        const savedMessage = conversation.messages[conversation.messages.length - 1];

        const messageData = {
          _id: savedMessage._id,
          sender: savedMessage.sender,
          text: savedMessage.text,
          read: savedMessage.read,
          createdAt: savedMessage.createdAt,
          conversationId: conversation._id,
        };

        // Send to receiver
        socket.to(data.receiverId).emit('newMessage', messageData);

        // Send back to sender for confirmation
        socket.emit('messageSent', messageData);
      } catch (err) {
        console.error('Socket sendMessage error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('markRead', async (data: { conversationId: string }) => {
      try {
        const conversation = await Conversation.findById(data.conversationId);
        if (!conversation) return;

        // Verify user is a participant
        if (!conversation.participants.some((p) => p.toString() === userId)) return;

        let marked = false;
        conversation.messages.forEach((msg) => {
          if (msg.sender.toString() !== userId && !msg.read) {
            msg.read = true;
            msg.readAt = new Date();
            marked = true;
          }
        });

        if (userId === conversation.teacher.toString()) {
          conversation.unreadCountTeacher = 0;
        } else {
          conversation.unreadCountStudent = 0;
        }

        if (marked) await conversation.save();

        // Notify the other participant that messages were read
        const otherId = userId === conversation.teacher.toString()
          ? conversation.student.toString()
          : conversation.teacher.toString();
        socket.to(otherId).emit('messagesRead', { conversationId: conversation._id });
      } catch (err) {
        console.error('Socket markRead error:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${userId}`);
      const sockets = connectedUsers.get(userId);
      if (sockets) {
        const updated = sockets.filter((id) => id !== socket.id);
        if (updated.length === 0) {
          connectedUsers.delete(userId);
        } else {
          connectedUsers.set(userId, updated);
        }
      }
    });
  });

  return io;
};
