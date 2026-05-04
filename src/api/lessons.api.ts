import axiosInstance from './axios';

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  files: LessonFile[];
  course: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface CreateLessonData {
  title: string;
  description: string;
  videoUrl?: string;
  files?: LessonFile[];
  order?: number;
  isPublished?: boolean;
}

export const lessonsApi = {
  getAll: (courseId: string): Promise<{ success: boolean; count: number; data: Lesson[] }> => {
    return axiosInstance.get(`/lessons/course/${courseId}`).then(res => res.data);
  },

  getById: (courseId: string, lessonId: string): Promise<{ success: boolean; data: Lesson }> => {
    return axiosInstance.get(`/lessons/course/${courseId}/${lessonId}`).then(res => res.data);
  },

  create: (courseId: string, data: CreateLessonData): Promise<{ success: boolean; data: Lesson }> => {
    return axiosInstance.post(`/lessons/course/${courseId}`, data).then(res => res.data);
  },

  update: (courseId: string, lessonId: string, data: Partial<CreateLessonData>): Promise<{ success: boolean; data: Lesson }> => {
    return axiosInstance.put(`/lessons/course/${courseId}/${lessonId}`, data).then(res => res.data);
  },

  delete: (courseId: string, lessonId: string): Promise<void> => {
    return axiosInstance.delete(`/lessons/course/${courseId}/${lessonId}`);
  },

  uploadVideo: (courseId: string, lessonId: string, file: File): Promise<{ success: boolean; data: any }> => {
    const formData = new FormData();
    formData.append('video', file);
    
    return axiosInstance.post(`/lessons/course/${courseId}/${lessonId}/upload-video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  uploadFiles: (courseId: string, lessonId: string, files: File[]): Promise<{ success: boolean; data: any }> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return axiosInstance.post(`/lessons/course/${courseId}/${lessonId}/upload-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  reorder: (courseId: string, lessons: { id: string; order: number }[]): Promise<{ success: boolean }> => {
    return axiosInstance.put(`/lessons/course/${courseId}/reorder`, { lessons }).then(res => res.data);
  },
};
