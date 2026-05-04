import axiosInstance from './axios';

export interface CommentAuthor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'STUDENT' | 'TEACHER';
}

export interface Comment {
  _id: string;
  content: string;
  course: string;
  author: CommentAuthor;
  parentComment?: string;
  isReply: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentData {
  content: string;
  courseId: string;
  parentCommentId?: string;
}

export interface CommentStats {
  totalComments: number;
  totalReplies: number;
  topLevelComments: number;
}

export const commentsApi = {
  // Create a comment
  create: (data: CreateCommentData): Promise<Comment> => {
    return axiosInstance.post('/comments', data).then(res => res.data.data);
  },

  // Get comments for a course
  getByCourse: (courseId: string): Promise<Comment[]> => {
    return axiosInstance.get(`/comments/course/${courseId}`).then(res => res.data.data);
  },

  // Update a comment
  update: (id: string, content: string): Promise<Comment> => {
    return axiosInstance.put(`/comments/${id}`, { content }).then(res => res.data.data);
  },

  // Delete a comment
  delete: (id: string): Promise<void> => {
    return axiosInstance.delete(`/comments/${id}`);
  },

  // Get comment statistics (teacher only)
  getStats: (courseId: string): Promise<CommentStats> => {
    return axiosInstance.get(`/comments/course/${courseId}/stats`).then(res => res.data.data);
  }
};
