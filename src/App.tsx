import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layouts/DashboardLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherCourses } from './pages/teacher/TeacherCourses';
import { CreateCourse } from './pages/teacher/CreateCourse';
import { ManageCourse } from './pages/teacher/ManageCourse';
import { CreateAssignment } from './pages/teacher/CreateAssignment';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { AssignmentSubmissions } from './pages/teacher/AssignmentSubmissions';
import { TeacherStudents } from './pages/teacher/TeacherStudents';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCourses } from './pages/student/StudentCourses';
import { CourseDetails } from './pages/student/CourseDetails';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { AssignmentDetail } from './pages/student/AssignmentDetail';
import { AssignmentResults } from './pages/student/AssignmentResults';
import { StudentGrades } from './pages/student/StudentGrades';
import { Certificate } from './pages/student/Certificate';

// Styles
import './styles/global.css';

const App = () => (
  <LanguageProvider>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="courses/new" element={<CreateCourse />} />
          <Route path="courses/:id/manage" element={<ManageCourse />} />
          <Route path="courses/:id/assignments/new" element={<CreateAssignment />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="assignments/create" element={<CreateAssignment />} />
          <Route path="assignments/:id/submissions" element={<AssignmentSubmissions />} />
          <Route path="students" element={<TeacherStudents />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:id" element={<CourseDetails />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="assignments/:id" element={<AssignmentDetail />} />
          <Route path="assignments/:id/results" element={<AssignmentResults />} />
          <Route path="assignments/:id/certificate" element={<Certificate />} />
          <Route path="grades" element={<StudentGrades />} />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer toasts={[]} onDismiss={() => {}} />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
