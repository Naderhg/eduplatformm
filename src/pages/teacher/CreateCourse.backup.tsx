import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { coursesApi } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { FileText, X, Upload, File, DollarSign, BookOpen, Award, Video } from 'lucide-react';
import './CreateCourse.css';

interface FileWithPreview extends File {
  preview: string;
  id: string;
}

type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

const COURSE_LEVELS: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];
const COURSE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Business',
  'Design',
  'Marketing',
  'Music',
  'Photography',
  'Lifestyle',
  'Other'
] as const;

interface FormData {
  title: string;
  description: string;
  price: number;
  category: string;
  level: CourseLevel;
  duration: number;
  requirements: string[];
  learningOutcomes: string[];
  videoUrl: string;
}

export const CreateCourse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    level: 'beginner',
    duration: 4,
    requirements: [''],
    learningOutcomes: [''],
    videoUrl: ''
  });
  
  const [thumbnail, setThumbnail] = useState<FileWithPreview | null>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value
    }));
  };

  // Handle changes in array fields (requirements, learningOutcomes)
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: 'requirements' | 'learningOutcomes'
  ) => {
    const newItems = [...formData[field]];
    newItems[index] = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: newItems
    }));
  };

  // Add a new item to an array field
  const addArrayItem = (field: 'requirements' | 'learningOutcomes') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove an item from an array field
  const removeArrayItem = (index: number, field: 'requirements' | 'learningOutcomes') => {
    const newItems = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newItems
    }));
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail({
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file)
      });
    }
  };

  // Handle video file selection
  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const videoFile = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        videoUrl: URL.createObjectURL(videoFile)
      }));
    }
  };

  // Handle additional file uploads
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Remove an uploaded file
  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Trigger file input clicks programmatically
  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerThumbnailInput = () => thumbnailInputRef.current?.click();
  const triggerVideoInput = () => videoInputRef.current?.click();

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnail) {
        URL.revokeObjectURL(thumbnail.preview);
      }
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [thumbnail, files]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.category || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.requirements.some(req => !req.trim())) {
      setError('Please fill in all requirements or remove empty ones');
      return;
    }

    if (formData.learningOutcomes.some(outcome => !outcome.trim())) {
      setError('Please fill in all learning outcomes or remove empty ones');
      return;
    }

    if (!formData.videoUrl) {
      setError('Please upload a course video');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare course data
      const courseData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        learningOutcomes: formData.learningOutcomes.filter(outcome => outcome.trim() !== ''),
        thumbnail: thumbnail ? `https://storage.example.com/thumbnails/${thumbnail.name}` : undefined,
        files: files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: `https://storage.example.com/files/${file.name}`
        }))
      };

      // Create the course
      await coursesApi.create(courseData);
      
      // Redirect to courses list
      navigate('/teacher/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return <Loader fullScreen text="Creating course..." />;
  }

  // Render the form
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
      <p className="text-gray-600 mb-6">Fill in the details to create a new course</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Course Title */}
        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter course title"
            required
          />
        </div>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Course Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to Web Development"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Course Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course..."
              className="form-control"
              rows={5}
            />
          </div>

          {/* Other form fields will go here */}

        </div>
      </div>
    );
  };

  const triggerVideoInput = () => {
    videoInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  // Basic validation
  if (!formData.title || !formData.description || !formData.category || !formData.duration) {
    setError('Please fill in all required fields');
    return;
  }

  if (formData.requirements.some(req => !req.trim())) {
    setError('Please fill in all requirements or remove empty ones');
    return;
  }

  if (formData.learningOutcomes.some(outcome => !outcome.trim())) {
    setError('Please fill in all learning outcomes or remove empty ones');
    return;
  }

  try {
    setIsLoading(true);
    
    // Prepare course data
    const courseData: CreateCourseData = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      requirements: formData.requirements,
      learningOutcomes: formData.learningOutcomes,
    };

    // In a real app, you would upload the thumbnail and files to a storage service here
    // and get back the URLs to save with the course data
    if (thumbnail) {
      // Simulate file upload
      courseData.thumbnail = `https://storage.example.com/thumbnails/${thumbnail.name}`;
    }

    // Create the course
    await coursesApi.create(courseData);
    
    // Redirect to courses list
    navigate('/teacher/courses');
  } catch (err) {
    console.error('Error creating course:', err);
    setError('Failed to create course. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

if (isLoading) {
  return <Loader fullScreen text="Creating course..." />;
}

return (
  <div className="create-course">
    <div className="page-header">
      <div>
        <h1 className="page-title">Create New Course</h1>
        <p className="page-subtitle">Fill in the details to create a new course</p>
      </div>
    </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a category</option>
                {COURSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                {COURSE_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (weeks) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Thumbnail</h2>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={triggerThumbnailInput}
          >
            {thumbnail ? (
              <div className="relative">
                <img 
                  src={thumbnail.preview} 
                  alt="Course thumbnail" 
                  className="max-h-48 mx-auto rounded-md"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnail(null);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={32} className="mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload thumbnail</p>
                <p className="text-xs text-gray-500">Recommended size: 1280x720px</p>
              </div>
            )}
            <input
              type="file"
              ref={thumbnailInputRef}
              onChange={handleThumbnailChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Video Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Video *</h2>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={triggerVideoInput}
          >
            {formData.videoUrl ? (
              <div className="relative">
                <video 
                  src={formData.videoUrl} 
                  controls 
                  className="max-h-64 mx-auto rounded-md"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, videoUrl: '' }));
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Video size={32} className="mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload course video</p>
                <p className="text-xs text-gray-500">MP4, WebM or MOV. Max 500MB</p>
              </div>
            )}
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoChange}
              accept="video/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <div className="space-y-3">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleArrayChange(e, index, 'requirements')}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                    placeholder={`Requirement ${index + 1}`}
                  />
                </div>
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                    onClick={() => removeArrayItem(index, 'requirements')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => addArrayItem('requirements')}
            >
              + Add Requirement
            </button>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Learning Outcomes</h2>
          <div className="space-y-3">
            {formData.learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => handleArrayChange(e, index, 'learningOutcomes')}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                    placeholder={`Outcome ${index + 1}`}
                  />
                </div>
                {formData.learningOutcomes.length > 1 && (
                  <button
                    type="button"
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                    onClick={() => removeArrayItem(index, 'learningOutcomes')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => addArrayItem('learningOutcomes')}
            >
              + Add Learning Outcome
            </button>
          </div>
        </div>

        {/* Files */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Files</h2>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={triggerFileInput}
          >
            <div className="space-y-2">
              <Upload size={32} className="mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload files</p>
              <p className="text-xs text-gray-500">PDF, DOC, PPT, etc. (Max 10MB each)</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map(file => (
                <div key={file.lastModified} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <File size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeFile(file.lastModified)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/teacher/courses')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/teacher/courses')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};
