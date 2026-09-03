import { uploadInstance, videoUploadInstance } from './axios';

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
  /**
   * Upload a video file.
   * onProgress  → called 0-100 while the browser is sending data to the backend.
   * onProcessing → called once the browser→backend transfer is complete (100%)
   *                but the backend is still uploading to Cloudinary.
   *                Use it to switch the UI to a "processing…" state.
   */
  uploadVideo: async (
    file: File,
    onProgress?: (pct: number) => void,
    onProcessing?: () => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);

    let processingCalled = false;

    const response = await videoUploadInstance.post('/courses/upload/video', formData, {
      onUploadProgress: (e) => {
        if (!e.total) return;
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress?.(pct);
        // Once browser→backend upload is 100%, backend still uploads to Cloudinary
        if (pct >= 100 && !processingCalled) {
          processingCalled = true;
          onProcessing?.();
        }
      },
    });

    return response.data;
  },

  uploadThumbnail: async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await uploadInstance.post('/courses/upload/thumbnail', formData, {
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });

    return response.data;
  },

  uploadFiles: async (
    files: File[],
    onProgress?: (pct: number) => void
  ): Promise<MultipleUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await uploadInstance.post('/courses/upload/files', formData, {
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });

    return response.data;
  },
};
