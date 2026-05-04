import axiosInstance from './axios';
import { Course } from '../types/course';
import { CourseWithDetails } from '../pages/teacher/ManageCourse';

export interface CourseFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'preparatory' | 'secondary';
  duration: number;
  requirements: string[];
  learningOutcomes: string[];
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  videoUrl?: string;
  files: CourseFile[];
  teacher: {
    id: string;
    name: string;
  };
  studentsCount: number;
  lessonsCount: number;
  createdAt: string;
  updatedAt: string;
  students?: any[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  level: 'preparatory' | 'secondary';
  duration: number;
  requirements: string[];
  learningOutcomes: string[];
  thumbnail?: string;
  videoUrl?: string;
  files?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

export const coursesApi = {
  getAll: (): Promise<Course[]> => {
    return axiosInstance.get('/courses').then(res => res.data);
  },

  getById: (id: string): Promise<Course> => {
    return axiosInstance.get(`/courses/${id}`).then(res => res.data.data);
  },

  getWithDetails: async (id: string): Promise<CourseWithDetails> => {
    try {
      console.log('Fetching course details for ID:', id);
      const response = await axiosInstance.get(`/courses/${id}/details`);
      console.log('Course details response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error in getWithDetails:', error);
      throw error;
    }
  },

  getByTeacher: (teacherId: string): Promise<{ data: Course[], success: boolean, count: number, pagination: any }> => {
    return axiosInstance.get('/courses', {
      params: { teacherId }
    }).then(res => res.data);
  },

  create: (data: CreateCourseData): Promise<Course> => {
    return axiosInstance.post('/courses', data).then(res => res.data);
  },

  update: (id: string, data: Partial<CreateCourseData>): Promise<Course> => {
    return axiosInstance.put(`/courses/${id}`, data).then(res => res.data);
  },

  delete: (id: string): Promise<void> => {
    return axiosInstance.delete(`/courses/${id}`);
  },

  enroll: (id: string): Promise<Course> => {
    return axiosInstance.post(`/courses/${id}/enroll`).then(res => res.data);
  },

  getEnrolled: (): Promise<Course[]> => {
    return axiosInstance.get('/courses/my-courses').then(res => res.data.data);
  }
};