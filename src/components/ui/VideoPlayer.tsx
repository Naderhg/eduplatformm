import React from 'react';
import { X } from 'lucide-react';
import { VideoSecurityMonitor } from './VideoSecurityMonitor';
import './VideoProtection.css';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getFullUrl = (url: string): string => {
    // Get the API base URL from environment or fallback to production
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://p01--edu-platform--fnj72wsf9xl6.code.run/api';
    const backendBaseUrl = apiBaseUrl.replace('/api', '');
    
    if (url.startsWith('http')) {
      // If it's already a full URL, check if it needs a token
      if (url.includes('/uploads/videos/') || url.includes('/api/files/videos/')) {
        const token = localStorage.getItem('token');
        // Check if token is already in the URL
        if (token && !url.includes('token=')) {
          return `${url}?token=${token}`;
        }
      }
      return url;
    }
    
    // For video files, append authentication token
    if (url.includes('/uploads/videos/') || url.includes('/api/files/videos/')) {
      const token = localStorage.getItem('token');
      const baseUrl = url.startsWith('/uploads') ? `${backendBaseUrl}${url}` : url;
      return token ? `${baseUrl}?token=${token}` : baseUrl;
    }
    
    if (url.startsWith('/uploads')) return `${backendBaseUrl}${url}`;
    return url;
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    if (error) {
      console.error('Video error code:', error.code, error.message);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to load video. ';
      switch(error.code) {
        case 1: // MEDIA_ERR_ABORTED
          errorMessage += 'The video loading was aborted.';
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorMessage += 'A network error occurred. Please check your internet connection.';
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMessage += 'The video format is not supported or corrupted.';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMessage += 'The video cannot be loaded. You may not have permission to access this video.';
          break;
        default:
          errorMessage += 'Please try refreshing the page or contact support.';
      }
      
      // Try to detect authentication issues
      if (video.src.includes('token=') && (error.code === 4 || error.message.includes('DEMUXER_ERROR'))) {
        errorMessage = 'Authentication failed. Please log out and log back in to refresh your access token.';
      }
      
      alert(errorMessage);
    }
  };

  return (
    <VideoSecurityMonitor isStudent={true}>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 video-protected no-select">
            <video
              src={getFullUrl(videoUrl)}
              controls
              autoPlay
              className="w-full rounded-lg"
              style={{ maxHeight: '70vh' }}
              onError={handleError}
              crossOrigin="use-credentials"
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </VideoSecurityMonitor>
  );
};
