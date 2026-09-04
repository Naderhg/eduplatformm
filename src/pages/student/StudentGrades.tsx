import React, { useEffect, useState, useCallback } from 'react';
import { assignmentsApi } from '../../api/assignments.api';
import { coursesApi, Course } from '../../api/courses.api';
import { Loader } from '../../components/common/Loader';
import { StudentShellWrapper } from './StudentShellWrapper';
import { toast } from 'react-toastify';
import { Award, BookOpen, FileText, TrendingUp } from 'lucide-react';
import './StudentGrades.css';

interface CourseGrade {
  courseId: string;
  courseName: string;
  assignments: Array<{
    id: string;
    name: string;
    score: number;
    maxScore: number;
    date: string;
  }>;
  overallGrade: number;
}

export const StudentGrades: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      const [enrolledCourses, assignments] = await Promise.all([
        coursesApi.getEnrolled(),
        assignmentsApi.getStudentAssignments(),
      ]);

      // Group graded assignments by course
      const courseMap: Record<string, CourseGrade> = {};
      (enrolledCourses || []).forEach((c: Course) => {
        courseMap[c._id] = {
          courseId: c._id,
          courseName: c.title,
          assignments: [],
          overallGrade: 0,
        };
      });

      (assignments || []).forEach((a: any) => {
        if (!a.course?._id && !a.course) return;
        const courseId = a.course?._id || a.course;
        const courseGrade = courseMap[courseId];
        if (!courseGrade) return;

        const gradedSub = a.submissions?.find((s: any) => s.score !== undefined && s.score !== null);
        if (gradedSub && a.maxScore > 0) {
          courseGrade.assignments.push({
            id: a._id,
            name: a.title,
            score: gradedSub.score,
            maxScore: a.maxScore,
            date: gradedSub.gradedAt || gradedSub.submittedAt,
          });
        }
      });

      // Calculate overall grade per course
      Object.values(courseMap).forEach((cg) => {
        if (cg.assignments.length > 0) {
          const totalPercent = cg.assignments.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0);
          cg.overallGrade = totalPercent / cg.assignments.length;
        }
      });

      // Only show courses with graded assignments
      const gradesWithAssignments = Object.values(courseMap).filter(cg => cg.assignments.length > 0);
      setCourseGrades(gradesWithAssignments);
    } catch (e: any) {
      console.error('Grades fetch error:', e);
      toast.error('فشل تحميل الدرجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  if (loading) {
    return (
      <StudentShellWrapper>
        <Loader fullScreen text="جاري التحميل..." />
      </StudentShellWrapper>
    );
  }

  const totalGradedAssignments = courseGrades.reduce((sum, c) => sum + c.assignments.length, 0);
  const overallAverage = courseGrades.length > 0
    ? courseGrades.reduce((sum, c) => sum + c.overallGrade, 0) / courseGrades.length
    : 0;

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'a';
    if (percentage >= 80) return 'b';
    if (percentage >= 70) return 'c';
    return 'd';
  };

  return (
    <StudentShellWrapper>
      <div className="student-grades" dir="rtl">
        <div className="page-header">
          <div>
            <h1 className="page-title">الدرجات</h1>
            <p className="page-subtitle">تابع أدائك الأكاديمي</p>
          </div>
        </div>

        {courseGrades.length === 0 ? (
          <div className="empty-state">
            <Award className="size-16 text-muted-foreground" />
            <h3 className="text-lg font-bold">لا توجد درجات بعد</h3>
            <p className="text-sm text-muted-foreground">ستظهر درجاتك هنا بعد تصحيح واجباتك</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grades-overview">
              <div className="grade-stat-card card">
                <div className="grade-circle">
                  <svg viewBox="0 0 36 36">
                    <path
                      className="grade-circle-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="grade-circle-fill"
                      strokeDasharray={`${overallAverage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="grade-value">{overallAverage.toFixed(1)}%</span>
                </div>
                <div className="grade-stat-info">
                  <span className="grade-stat-label">المعدل العام</span>
                  <span className="grade-stat-description">عبر كل الكورسات</span>
                </div>
              </div>

              <div className="grade-stat-card card">
                <div className="grade-icon">
                  <BookOpen size={32} />
                </div>
                <div className="grade-stat-info">
                  <span className="grade-stat-value">{courseGrades.length}</span>
                  <span className="grade-stat-label">كورسات بدرجات</span>
                </div>
              </div>

              <div className="grade-stat-card card">
                <div className="grade-icon grade-icon-success">
                  <Award size={32} />
                </div>
                <div className="grade-stat-info">
                  <span className="grade-stat-value">{totalGradedAssignments}</span>
                  <span className="grade-stat-label">واجبات مُصححة</span>
                </div>
              </div>
            </div>

            {/* Grades by Course */}
            <div className="grades-by-course">
              {courseGrades.map((course) => (
                <section key={course.courseId} className="course-grades card">
                  <div className="course-grades-header">
                    <div className="course-info">
                      <h2 className="course-name">{course.courseName}</h2>
                      <span className="course-average">
                        المتوسط: <strong>{course.overallGrade.toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>

                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>الواجب</th>
                        <th>التاريخ</th>
                        <th>الدرجة</th>
                        <th>التقدير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.assignments.map((assignment) => {
                        const percentage = (assignment.score / assignment.maxScore) * 100;
                        return (
                          <tr key={assignment.id}>
                            <td className="assignment-name">{assignment.name}</td>
                            <td className="assignment-date">{new Date(assignment.date).toLocaleDateString('ar')}</td>
                            <td className="assignment-score">
                              {assignment.score}/{assignment.maxScore}
                            </td>
                            <td>
                              <span className={`grade-badge ${getGradeColor(percentage)}`}>
                                {getGradeLetter(percentage)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </StudentShellWrapper>
  );
};
