import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import './TeacherStudents.css';

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  completedAssignments: number;
  averageScore: number;
  maxScore: number;
  lastActive: string;
  courses?: any[];
}

export const TeacherStudents: React.FC = () => {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    averageScore: 0
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch all students enrolled in teacher's courses
      const response = await assignmentsApi.getTeacherStudents();
      console.log('Teacher students:', response);
      
      // Calculate stats
      const totalStudents = response.length;
      let totalCourses = 0;
      let totalAssignments = 0;
      let totalScore = 0;
      
      response.forEach((student: Student) => {
        totalCourses += student.enrolledCourses || 0;
        totalAssignments += student.completedAssignments || 0;
        totalScore += student.averageScore || 0;
      });

      const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;

      setStats({
        totalStudents,
        totalCourses,
        totalAssignments,
        averageScore
      });
      
      setStudents(response);
      setFilteredStudents(response);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      const errorMessage = error.response?.data?.message || t('teacher.students.loadFailed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <Loader fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="teacher-students p-3 sm:p-5 max-w-6xl mx-auto">
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="page-title text-xl sm:text-2xl font-bold text-foreground mb-1">{t('teacher.students.title')}</h1>
          <p className="page-subtitle text-sm sm:text-base text-muted-foreground">{t('teacher.students.description')}</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder={t('teacher.students.searchPlaceholder')} 
              className="search-input bg-transparent outline-none text-foreground placeholder-muted-foreground text-sm w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="students-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="stat-card bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="stat-icon stat-icon-info w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16 sm:24" height="16 sm:24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M21 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4 2v2" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value text-xl sm:text-2xl font-bold text-foreground">{stats.totalStudents}</span>
            <span className="stat-label text-xs sm:text-sm text-muted-foreground">{t('teacher.students.totalStudents')}</span>
          </div>
        </div>
        <div className="stat-card bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="stat-icon stat-icon-success w-10 h-10 sm:w-12 sm:h-12 bg-success/10 text-success rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16 sm:24" height="16 sm:24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 12 12 6" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value text-xl sm:text-2xl font-bold text-foreground">{stats.totalCourses}</span>
            <span className="stat-label text-xs sm:text-sm text-muted-foreground">{t('teacher.students.totalEnrollments')}</span>
          </div>
        </div>
        <div className="stat-card bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="stat-icon stat-icon-warning w-10 h-10 sm:w-12 sm:h-12 bg-warning/10 text-warning rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16 sm:24" height="16 sm:24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 2 14 20 10" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value text-xl sm:text-2xl font-bold text-foreground">{stats.totalAssignments}</span>
            <span className="stat-label text-xs sm:text-sm text-muted-foreground">{t('teacher.students.completedAssignments')}</span>
          </div>
        </div>
        <div className="stat-card bg-card border border-border rounded-lg p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="stat-icon stat-icon-primary w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16 sm:24" height="16 sm:24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <polyline points="17 7 12 7 17" />
              <polyline points="7 7 12 7 17" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value text-xl sm:text-2xl font-bold text-foreground">{stats.averageScore}%</span>
            <span className="stat-label text-xs sm:text-sm text-muted-foreground">{t('teacher.students.classAverage')}</span>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="students-table-container bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="students-table w-full">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('teacher.students.student')}</th>
                <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t('teacher.courses.title')}</th>
                <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('teacher.assignments.title')}</th>
                <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('teacher.students.averageScore')}</th>
                <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Max Score</th>
                <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t('teacher.students.lastActive')}</th>
                <th className="text-left px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="student-cell flex items-center gap-3">
                      <div className="student-avatar w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="student-info">
                        <div className="student-name font-medium text-foreground text-sm sm:text-base">{student.name}</div>
                        <div className="student-email text-xs sm:text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground hidden sm:table-cell">{student.enrolledCourses}</td>
                  <td className="px-4 py-4 text-sm text-foreground hidden md:table-cell">{student.completedAssignments}</td>
                  <td className="px-4 py-4">
                    <span className={`score-badge inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      student.averageScore >= 90 ? 'bg-success/10 text-success' : 
                      student.averageScore >= 70 ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {student.averageScore}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground hidden lg:table-cell">{student.maxScore || 0}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                    {new Date(student.lastActive).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <Link to={`/teacher/students/${student.id}`} className="btn btn-ghost btn-sm inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-xs sm:text-sm font-medium text-foreground bg-card hover:bg-accent transition-colors">
                      <span className="hidden sm:inline">{t('teacher.students.viewProfile')}</span>
                      <span className="sm:hidden">{t('common.view')}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};