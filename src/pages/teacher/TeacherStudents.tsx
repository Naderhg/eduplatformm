import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { DashboardShell, PageHeader, StatCard } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon } from '../../lib/dashboard-data';
import { toast } from 'react-toastify';
import { Search, Users, BookOpen, FileText, TrendingUp } from 'lucide-react';

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
    averageScore: 0,
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await assignmentsApi.getTeacherStudents();
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
      setStats({ totalStudents, totalCourses, totalAssignments, averageScore });
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

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
        <Loader fullScreen text={t('common.loading')} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
      <PageHeader
        title={t('teacher.students.title')}
        description={t('teacher.students.description')}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('teacher.students.totalStudents')} value={stats.totalStudents} />
        <StatCard label={t('teacher.students.totalEnrollments')} value={stats.totalCourses} />
        <StatCard label={t('teacher.students.completedAssignments')} value={stats.totalAssignments} />
        <StatCard label={t('teacher.students.classAverage')} value={`${stats.averageScore}%`} />
      </div>

      {/* Search */}
      <div className="mt-6 mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-soft sm:max-w-sm">
        <Search className="size-5 flex-shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('teacher.students.searchPlaceholder')}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Students table */}
      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-bold">اسم الطالب</th>
                <th className="hidden p-3 font-bold sm:table-cell">{t('teacher.courses.title')}</th>
                <th className="hidden p-3 font-bold md:table-cell">{t('teacher.assignments.title')}</th>
                <th className="p-3 font-bold">{t('teacher.students.averageScore')}</th>
                <th className="hidden p-3 font-bold lg:table-cell">Max Score</th>
                <th className="hidden p-3 font-bold sm:table-cell">{t('teacher.students.lastActive')}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t border-border transition-colors hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground">
                        {student.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{student.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden p-3 text-muted-foreground sm:table-cell">{student.enrolledCourses}</td>
                  <td className="hidden p-3 text-muted-foreground md:table-cell">{student.completedAssignments}</td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      student.averageScore >= 90 ? 'bg-success/10 text-success' :
                      student.averageScore >= 70 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {student.averageScore}%
                    </span>
                  </td>
                  <td className="hidden p-3 text-muted-foreground lg:table-cell">{student.maxScore || 0}</td>
                  <td className="hidden p-3 text-muted-foreground sm:table-cell">
                    {new Date(student.lastActive).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/teacher/students/${student.id}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-muted"
                    >
                      <span className="hidden sm:inline">{t('teacher.students.viewProfile')}</span>
                      <span className="sm:hidden">{t('common.view')}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">لا يوجد طلاب</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لم يقم أي طالب بالتسجيل في كورساتك بعد'}
          </p>
        </div>
      )}
    </DashboardShell>
  );
};
