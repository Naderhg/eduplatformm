import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherOverview } from './pages/teacher/TeacherOverview';
import { TeacherLessons } from './pages/teacher/TeacherLessons';
import { TeacherExams } from './pages/teacher/TeacherExams';
import { TeacherQuizzes } from './pages/teacher/TeacherQuizzes';
import { TeacherQuestionBank } from './pages/teacher/TeacherQuestionBank';
import { TeacherImport } from './pages/teacher/TeacherImport';
import { TeacherGrading } from './pages/teacher/TeacherGrading';
import { TeacherGradescope } from './pages/teacher/TeacherGradescope';
import { TeacherLive } from './pages/teacher/TeacherLive';
import { TeacherChat } from './pages/teacher/TeacherChat';
import { TeacherParents } from './pages/teacher/TeacherParents';
import { TeacherCourses } from './pages/teacher/TeacherCourses';
import { CreateCourse } from './pages/teacher/CreateCourse';
import { ManageCourse } from './pages/teacher/ManageCourse';
import { CreateAssignment } from './pages/teacher/CreateAssignment';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { AssignmentSubmissions } from './pages/teacher/AssignmentSubmissions';
import { TeacherStudents } from './pages/teacher/TeacherStudents';
import { TeacherShellWrapper } from './pages/teacher/TeacherShellWrapper';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminReports } from './pages/admin/AdminReports';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentLessons } from './pages/student/StudentLessons';
import { CourseDetails } from './pages/student/CourseDetails';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { AssignmentDetail } from './pages/student/AssignmentDetail';
import { AssignmentResults } from './pages/student/AssignmentResults';
import { StudentGrades } from './pages/student/StudentGrades';
import { Certificate } from './pages/student/Certificate';

// Home Page
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Courses from './pages/Courses';

// Styles
import './styles/global.css';

const App = () => (
  <LanguageProvider>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
      <Routes>
        {/* Public site routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courses" element={<Courses />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Teacher Routes - active pages */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lessons"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherLessons />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes - pages that now use DashboardShell directly */}
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherStudents />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes - existing pages still wrapped in DashboardShell */}
        <Route
          path="/teacher/courses/new"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherShellWrapper>
                <CreateCourse />
              </TeacherShellWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:id/manage"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <ManageCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:id/assignments/new"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherShellWrapper>
                <CreateAssignment />
              </TeacherShellWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/create"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherShellWrapper>
                <CreateAssignment />
              </TeacherShellWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments/:id/submissions"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TeacherShellWrapper>
                <AssignmentSubmissions />
              </TeacherShellWrapper>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        {/* Student Routes - each page uses DashboardShell directly */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <CourseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lessons"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLessons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AssignmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:id/results"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AssignmentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:id/certificate"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <Certificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentGrades />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer toasts={[]} onDismiss={() => {}} />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
