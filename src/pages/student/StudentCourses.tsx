import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFetch } from '../../hooks/useFetch';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { Search, BookOpen } from 'lucide-react';
import './StudentCourses.css';

export const StudentCourses: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [searchedCourse, setSearchedCourse] = useState<Course | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch enrolled courses (assuming an endpoint exists, otherwise this will fail)
  const fetchEnrolledCourses = useCallback(() => coursesApi.getEnrolled(), []);
  const { data: enrolledCourses, isLoading: isLoadingEnrolled, refetch: refetchEnrolled } = useFetch<Course[]>(fetchEnrolledCourses);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) {
      toast.error('Please enter a course ID to search.');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setSearchedCourse(null);
    try {
      const course = await coursesApi.getById(searchId.trim());
      setSearchedCourse(course);
    } catch (error) {
      setSearchError('Course not found or an error occurred.');
      toast.error('Course not found. Please check the ID and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setIsEnrolling(true);
    try {
      await coursesApi.enroll(courseId);
      toast.success('Successfully enrolled in the course!');
      setSearchedCourse(null); // Clear the searched course after enrollment
      refetchEnrolled(); // Refresh the list of enrolled courses
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to enroll. You may already be enrolled.';
      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoadingEnrolled) {
    return <Loader fullScreen text="Loading your courses..." />;
  }

  return (
    <div className="student-courses">
      <div className="page-header">
        <div>
          <h1 className="page-title">Find & Enroll in Courses</h1>
          <p className="page-subtitle">Search for a course by its ID to enroll</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-4 p-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Course ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSearching}>
            {isSearching ? <Loader size="small" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Searched Course Display */}
      {searchedCourse && (
        <div className="card mb-6">
          <div className="card-body">
            <h3 className="course-title">{searchedCourse.title}</h3>
            <p className="course-instructor">by {searchedCourse.teacher.name}</p>
            <p className="course-description">{searchedCourse.description}</p>
          </div>
          <div className="card-footer">
            <button 
              className="btn btn-success w-full" 
              onClick={() => handleEnroll(searchedCourse._id)}
              disabled={isEnrolling}
            >
              {isEnrolling ? <Loader size="small" /> : 'Enroll Now'}
            </button>
          </div>
        </div>
      )}

      {searchError && !isSearching && (
        <div className="empty-state card">
          <p className="text-red-500">{searchError}</p>
        </div>
      )}

      {/* Enrolled Courses List */}
      <div className="page-header">
        <h1 className="page-title">My Enrolled Courses</h1>
      </div>
      {enrolledCourses && enrolledCourses.length > 0 ? (
        <div className="courses-grid">
          {enrolledCourses.map((course) => (
            <div key={course._id} className="course-card card card-hover">
              <div className="card-body">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-instructor">by {course.teacher.name}</p>
                <div className="course-meta">
                  <span className="course-stat">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.lessonsCount || 0} lessons
                  </span>
                </div>
              </div>
              <div className="card-footer">
                <Link to={`/student/courses/${course._id}`} className="btn btn-primary w-full">
                  Start Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <h3>No courses enrolled</h3>
          <p>You haven't enrolled in any courses yet. Use the search bar to find and enroll.</p>
        </div>
      )}
    </div>
  );
};
