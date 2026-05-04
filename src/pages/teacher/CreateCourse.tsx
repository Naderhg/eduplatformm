import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { coursesApi, CreateCourseData } from '../../api/courses.api';
import { uploadApi } from '../../api/upload.api';
import { Loader } from '../../components/common/Loader';
import { FileText, X, Upload, File, BookOpen, Award, Video } from 'lucide-react';
import { toast } from 'react-toastify';
import './CreateCourse.css';

// Types and Interfaces
interface FileWithPreview extends File {
  preview: string;
  id: string;
  serverUrl?: string;
  originalName?: string;
  originalSize?: number;
  originalType?: string;
}

type CourseLevel = 'preparatory' | 'secondary';

// Constants
const COURSE_LEVELS: CourseLevel[] = ['preparatory', 'secondary'];
const COURSE_CATEGORIES: Record<CourseLevel, readonly string[]> = {
  preparatory: [
    'للغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'العلوم',
    'الدراسات الاجتماعية',
    'التربية الدينية الإسلامية',
    'التربية الدينية المسيحية',
    'التربية الرياضية',
    'التربية الفنية',
    'الكمبيوتر وتكنولوجيا المعلومات'
  ],
  secondary: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'اللغة الأجنبية الثانية (فرنساوي / ألماني / إيطالي / إسباني)',
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'الجيولوجيا وعلوم البيئة',
    'التاريخ',
    'الجغرافيا',
    'الفلسفة والمنطق',
    'علم النفس والاجتماع',
    'الرياضيات البحتة',
    'الرياضيات التطبيقية'
  ]
};


// Form data interface
interface FormDataState {
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: number;
  requirements: string[];
  learningOutcomes: string[];
  videoUrl: string;
}

const CreateCourse: React.FC = () => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    title: '',
    description: '',
    category: '',
    level: 'preparatory',
    duration: 4,
    requirements: [''],
    learningOutcomes: [''],
    videoUrl: ''
  });
  
  const [thumbnail, setThumbnail] = useState<FileWithPreview | null>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value
    }));
  };

  // Handle array field changes (requirements, learning outcomes)
  const handleArrayFieldChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: 'requirements' | 'learningOutcomes') => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  // Add new item to array field
  const addArrayItem = (field: 'requirements' | 'learningOutcomes') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove item from array field
  const removeArrayItem = (index: number, field: 'requirements' | 'learningOutcomes') => {
    const newItems = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newItems
    }));
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        // Show loading toast
        const loadingToast = toast.loading('Uploading thumbnail...');
        
        // Upload thumbnail to server
        const response = await uploadApi.uploadThumbnail(file);
        
        // Set thumbnail with preview and server URL
        setThumbnail({
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          preview: URL.createObjectURL(file),
          serverUrl: response.data.url
        });
        
        // Show success toast
        toast.success('Thumbnail uploaded successfully!');
        
      } catch (error: any) {
        console.error('Thumbnail upload failed:', error);
        toast.error(error.response?.data?.message || 'Failed to upload thumbnail');
        
        // Clear the file input
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = '';
        }
      }
    }
  };

  // Handle video file selection
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        // Show loading toast
        const loadingToast = toast.loading('Uploading video...');
        
        // Upload video to server
        const response = await uploadApi.uploadVideo(file);
        
        // Update form data with server URL
        setFormData(prev => ({
          ...prev,
          videoUrl: response.data.url
        }));
        
        // Show success toast
        toast.success('Video uploaded successfully!');
        
      } catch (error: any) {
        console.error('Video upload failed:', error);
        toast.error(error.response?.data?.message || 'Failed to upload video');
        
        // Clear the file input
        if (videoInputRef.current) {
          videoInputRef.current.value = '';
        }
      }
    }
  };

  // Handle additional files selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      try {
        // Show loading toast
        const loadingToast = toast.loading('Uploading course materials...');
        
        // Upload files to server using the uploadFiles method
        const response = await uploadApi.uploadFiles(filesArray);
        
        // Process uploaded files with server URLs
        const uploadedFiles = filesArray.map((file, index) => ({
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          preview: URL.createObjectURL(file),
          serverUrl: response.data[index].url,
          // Preserve original file properties
          originalName: file.name,
          originalSize: file.size,
          originalType: file.type
        }));
        
        // Add uploaded files to state
        setFiles(prev => [...prev, ...uploadedFiles]);
        
        // Show success toast
        toast.success(`${filesArray.length} file(s) uploaded successfully!`);
        
      } catch (error: any) {
        console.error('File upload failed:', error);
        toast.error(error.response?.data?.message || 'Failed to upload files');
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Remove uploaded file
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

    // Check authentication
    if (!user) {
      setError('You must be logged in to create a course');
      return;
    }

    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      setError('Only teachers can create courses');
      return;
    }

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

      // Debug authentication
      console.log('User authentication check:', {
        user: !!user,
        userId: user?.id,
        userRole: user?.role,
        tokenExists: !!localStorage.getItem('token')
      });

      // Prepare course data
      console.log('Files state before submission:', files);
      console.log('Files with serverUrl:', files.filter(f => f.serverUrl));
      
      // Debug the filtering process
      console.log('All files in state:', files);
      files.forEach((file, index) => {
        console.log(`File ${index}:`, {
          file: !!file,
          name: file?.originalName || file?.name,
          size: file?.originalSize || file?.size,
          serverUrl: file?.serverUrl,
          passesFilter: file && (file.originalName || file.name) && (file.originalSize || file.size) > 0 && file.serverUrl
        });
      });
      
      const filteredFiles = files.filter(file => file && (file.originalName || file.name) && (file.originalSize || file.size) > 0 && file.serverUrl);
      console.log('Filtered files:', filteredFiles);

      const courseData: CreateCourseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        duration: formData.duration,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        learningOutcomes: formData.learningOutcomes.filter(outcome => outcome.trim() !== ''),
        thumbnail: thumbnail?.serverUrl || undefined,
        videoUrl: formData.videoUrl,
        files: filteredFiles.map(file => ({
          name: file.originalName || file.name,
          type: file.originalType || file.type,
          size: file.originalSize || file.size,
          url: file.serverUrl
        })),
      };

      console.log('Course data being sent:', courseData);
      console.log('Files array in course data:', courseData.files);
      console.log('Files array length:', courseData.files.length);

      // Submit to API
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Course</h1>

        {error && (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card dark:bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-foreground">
                  Course Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                  required
                >
                  <option value="">Select a category</option>
                  {(COURSE_CATEGORIES[formData.level] || []).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="level" className="block text-sm font-medium text-foreground">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                >
                  {COURSE_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-foreground">
                  Duration (weeks) <span className="text-destructive">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Course Thumbnail */}
          <div className="bg-card dark:bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Course Thumbnail</h2>
            <div 
              className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors bg-secondary/50"
              onClick={triggerThumbnailInput}
            >
              {thumbnail ? (
                <div className="relative">
                  <img 
                    src={thumbnail.preview} 
                    alt="Thumbnail preview" 
                    className="max-h-48 mx-auto rounded-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnail(null);
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 focus:outline-none transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary hover:text-primary/80 transition-colors">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
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

          {/* Course Video */}
          <div className="bg-card dark:bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Course Introduction Video</h2>
            <div 
              className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors bg-secondary/50"
              onClick={triggerVideoInput}
            >
              {formData.videoUrl ? (
                <div className="relative">
                  <video 
                    src={formData.videoUrl.startsWith('blob:') ? formData.videoUrl : `http://localhost:5000${formData.videoUrl}`} 
                    controls
                    className="max-h-64 mx-auto rounded-md"
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, videoUrl: '' }));
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 focus:outline-none transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary hover:text-primary/80 transition-colors">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">MP4, WebM up to 50MB</p>
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

          {/* Course Requirements */}
          <div className="bg-card dark:bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayFieldChange(e, index, 'requirements')}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      placeholder={`Requirement ${index + 1}`}
                    />
                  </div>
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'requirements')}
                      className="ml-2 p-2 text-destructive hover:text-destructive/80 focus:outline-none transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                + Add Requirement
              </button>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="bg-card dark:bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Learning Outcomes</h2>
            <div className="space-y-3">
              {formData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayFieldChange(e, index, 'learningOutcomes')}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      placeholder={`Learning outcome ${index + 1}`}
                    />
                  </div>
                  {formData.learningOutcomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'learningOutcomes')}
                      className="ml-2 p-2 text-destructive hover:text-destructive/80 focus:outline-none transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('learningOutcomes')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                + Add Learning Outcome
              </button>
            </div>
          </div>

          {/* Course Materials */}
          <div className="bg-card dark:bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Course Materials</h2>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors bg-secondary/50"
                onClick={triggerFileInput}
              >
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary hover:text-primary/80 transition-colors">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, PPT, ZIP up to 10MB</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
                  <ul className="border border-border rounded-md divide-y divide-border bg-secondary/30">
                    {files.map((file) => (
                      <li key={file.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <File className="flex-shrink-0 h-5 w-5 text-muted-foreground" />
                          <span className="ml-2 flex-1 w-0 truncate">
                            {file.name}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="font-medium text-destructive hover:text-destructive/80 focus:outline-none transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
              onClick={() => navigate('/teacher/courses')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
export { CreateCourse };

