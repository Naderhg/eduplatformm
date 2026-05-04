import axiosInstance from './axios';

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface EssayQuestion {
  id: string;
  question: string;
  maxWords?: number;
  points: number;
}

export interface Assignment {
  id: string;
  courseId?: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  type: 'mcq' | 'essay' | 'mixed';
  questions?: {
    mcq?: MCQQuestion[];
    essay?: EssayQuestion[];
  };
  autoCorrect?: boolean;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  student?: {
    name: string;
    email: string;
    _id: string;
  };
  content: string;
  attachmentUrl?: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  mcqAnswers?: Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    points: number;
  }>;
  essayAnswers?: Array<{
    questionId: string;
    answer: string;
    wordCount: number;
    points: number;
  }>;
  rank?: number;
  percentageScore?: number;
}

export interface CreateAssignmentData {
  courseId?: string;
  lessonId?: string;
  title: string;
  description: string;
  availableFrom?: string;
  dueDate: string;
  maxScore: number;
  status?: 'draft' | 'published' | 'closed';
}

// Mock assignments data
const mockAssignments: Assignment[] = [
  {
    id: '1',
    courseId: '1',
    lessonId: '1',
    title: 'Build a Simple HTML Page',
    description: 'Create a personal portfolio page using HTML only',
    dueDate: '2024-03-01T23:59:00Z',
    maxScore: 100,
    type: 'essay',
    status: 'published',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    courseId: '1',
    lessonId: '2',
    title: 'Style Your Portfolio',
    description: 'Add CSS styling to your HTML portfolio page',
    dueDate: '2024-03-15T23:59:00Z',
    maxScore: 100,
    type: 'essay',
    status: 'published',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: '3',
    courseId: '2',
    title: 'Implement Custom Hooks',
    description: 'Create a custom React hook for form handling',
    dueDate: '2024-03-20T23:59:00Z',
    maxScore: 100,
    type: 'essay',
    status: 'published',
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
];

const mockSubmissions: Submission[] = [
  {
    id: '1',
    assignmentId: '1',
    studentId: '2',
    studentName: 'Jane Student',
    content: 'Here is my portfolio page submission...',
    submittedAt: '2024-02-28T18:30:00Z',
    score: 95,
    feedback: 'Excellent work! Great structure.',
    gradedAt: '2024-03-02T10:00:00Z',
  },
];

export const assignmentsApi = {
  getByCourse: async (courseId: string): Promise<Assignment[]> => {
    return axiosInstance.get(`/assignments/course/${courseId}`).then(res => res.data);
  },

  getById: async (id: string): Promise<Assignment> => {
    return axiosInstance.get(`/assignments/${id}`).then(res => res.data);
  },

  create: async (data: CreateAssignmentData & { 
    type: 'mcq' | 'essay' | 'mixed'; 
    questions?: { mcq?: any[]; essay?: any[] };
    autoCorrect?: boolean;
    availableFrom?: string;
  }): Promise<Assignment> => {
    return axiosInstance.post('/assignments', data).then(res => res.data);
  },

  update: async (id: string, data: Partial<CreateAssignmentData & { status?: 'draft' | 'published' | 'closed' }>): Promise<Assignment> => {
    return axiosInstance.put(`/assignments/${id}`, data).then(res => res.data);
  },

  delete: async (id: string): Promise<void> => {
    return axiosInstance.delete(`/assignments/${id}`).then(res => res.data);
  },

  getSubmissions: async (assignmentId: string): Promise<Submission[]> => {
    return axiosInstance.get(`/assignments/${assignmentId}/submissions`).then(res => res.data);
  },

  submitAssignment: async (assignmentId: string, content: string, attachmentUrl?: string, additionalData?: any): Promise<Submission> => {
    const payload: any = { content, attachmentUrl };
    if (additionalData) {
      Object.assign(payload, additionalData);
    }
    return axiosInstance.post(`/submissions/assignment/${assignmentId}/submit`, payload).then(res => res.data);
  },

  gradeSubmission: async (submissionId: string, score: number, feedback?: string, essayGrades?: any[]): Promise<Submission> => {
    const payload: any = { score, feedback };
    if (essayGrades) {
      payload.essayGrades = essayGrades;
    }
    return axiosInstance.put(`/submissions/${submissionId}/grade`, payload).then(res => res.data);
  },

  getMySubmissions: async (): Promise<Submission[]> => {
    return axiosInstance.get('/submissions/my').then(res => res.data);
  },

  getStudentAssignments: async (): Promise<Assignment[]> => {
    return axiosInstance.get('/assignments/student').then(res => res.data);
  },

  publishAssignment: async (id: string): Promise<Assignment> => {
    return axiosInstance.put(`/assignments/${id}/publish`).then(res => res.data);
  },

  getSubmission: async (id: string): Promise<Submission> => {
    return axiosInstance.get(`/submissions/${id}`).then(res => res.data);
  },

  getSubmissionByAssignment: async (assignmentId: string): Promise<Submission> => {
    return axiosInstance.get(`/submissions/assignment/${assignmentId}`).then(res => res.data);
  },

  getTeacherAssignments: async (): Promise<Assignment[]> => {
    return axiosInstance.get('/assignments/teacher').then(res => res.data);
  },

  getTeacherStudents: async (): Promise<any[]> => {
    return axiosInstance.get('/students/teacher').then(res => res.data);
  },

  getAssignmentStats: async (assignmentId: string): Promise<any> => {
    return axiosInstance.get(`/submissions/assignment/${assignmentId}/stats`).then(res => res.data);
  },

  getAssignmentSubmissionsWithRankings: async (assignmentId: string): Promise<any> => {
    return axiosInstance.get(`/submissions/assignment/${assignmentId}/rankings`).then(res => res.data);
  },

  getAssignmentPublicRankings: async (assignmentId: string): Promise<any> => {
    return axiosInstance.get(`/submissions/assignment/${assignmentId}/public-rankings`).then(res => res.data);
  }
};
