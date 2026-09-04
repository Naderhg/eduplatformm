import axiosInstance from './axios';

export interface ChatMessage {
  _id: string;
  sender: string;
  text: string;
  read: boolean;
  readAt?: Date | null;
  createdAt: string;
}

export interface ChatContact {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  course?: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  teacher: { _id: string; name: string; email: string; avatar?: string; role: string };
  student: { _id: string; name: string; email: string; avatar?: string; role: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCountTeacher: number;
  unreadCountStudent: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getContacts: (): Promise<{ success: boolean; count: number; data: ChatContact[] }> => {
    return axiosInstance.get('/chat/contacts').then(res => res.data);
  },

  getConversations: (): Promise<{ success: boolean; count: number; data: Conversation[] }> => {
    return axiosInstance.get('/chat/conversations').then(res => res.data);
  },

  getConversation: (conversationId: string): Promise<{ success: boolean; data: Conversation }> => {
    return axiosInstance.get(`/chat/conversations/${conversationId}`).then(res => res.data);
  },

  createConversation: (participantId: string): Promise<{ success: boolean; data: Conversation }> => {
    return axiosInstance.post('/chat/conversations', { participantId }).then(res => res.data);
  },

  sendMessage: (conversationId: string, text: string): Promise<{ success: boolean; data: ChatMessage }> => {
    return axiosInstance.post(`/chat/conversations/${conversationId}/messages`, { text }).then(res => res.data);
  },

  markAsRead: (conversationId: string): Promise<{ success: boolean }> => {
    return axiosInstance.put(`/chat/conversations/${conversationId}/read`).then(res => res.data);
  },
};
