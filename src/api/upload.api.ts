import axiosInstance, { uploadInstance } from './axios';

export interface UploadResponse {
  success: boolean;
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  data: UploadResponse['data'][];
}

export const uploadApi = {
  uploadVideo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await uploadInstance.post('/courses/upload/video', formData);
    
    return response.data;
  },

  uploadThumbnail: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const response = await uploadInstance.post('/courses/upload/thumbnail', formData);
    
    return response.data;
  },

  uploadFiles: async (files: File[]): Promise<MultipleUploadResponse> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await uploadInstance.post('/courses/upload/files', formData);
    
    return response.data;
  },
};
