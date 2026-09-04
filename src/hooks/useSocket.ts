import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://deev--edu-platform--fnj72wsf9xl6.code.run';

export interface SocketMessage {
  _id: string;
  sender: string;
  text: string;
  read: boolean;
  createdAt: string;
  conversationId: string;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((data: { conversationId: string; text: string; receiverId: string }) => {
    socketRef.current?.emit('sendMessage', data);
  }, []);

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('markRead', { conversationId });
  }, []);

  const onNewMessage = useCallback((handler: (msg: SocketMessage) => void) => {
    socketRef.current?.on('newMessage', handler);
    return () => { socketRef.current?.off('newMessage', handler); };
  }, []);

  const onMessageSent = useCallback((handler: (msg: SocketMessage) => void) => {
    socketRef.current?.on('messageSent', handler);
    return () => { socketRef.current?.off('messageSent', handler); };
  }, []);

  const onMessagesRead = useCallback((handler: (data: { conversationId: string }) => void) => {
    socketRef.current?.on('messagesRead', handler);
    return () => { socketRef.current?.off('messagesRead', handler); };
  }, []);

  return { connected, sendMessage, markRead, onNewMessage, onMessageSent, onMessagesRead };
};
