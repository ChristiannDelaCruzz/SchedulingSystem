// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ToastContainer from './components/ui/ToastContainer';

// Auth + public
import Login from './pages/Login/Login';
import { EnrollmentForm, ApplicationStatus } from './pages/Enrollment';

// Dashboard
import Dashboard from './pages/Dashboard';

// Admin
import Programs from './pages/Admin/Programs';
import Sections from './pages/Admin/Sections';
import Subjects from './pages/Admin/Subjects';
import SemesterCourses from './pages/Admin/SemesterCourses';
import ProfessorAssignment from './pages/Admin/ProfessorAssignment';
import ProfessorAvailability from './pages/Admin/ProfessorAvailability';
import Rooms from './pages/Admin/Rooms';
import Professors from './pages/Admin/Professors';
import EnrollmentReview from './pages/Admin/EnrollmentReview';
import EnrolledStudents from './pages/Admin/EnrolledStudents';
import SectionCapacity from './pages/Admin/SectionCapacity';
import SentEmails from './pages/Admin/SentEmails';
import Admins from './pages/Admin/Admins';

// Users
import Students from './pages/Users/Students';
import Staff from './pages/Users/Staff';

// Scheduling
import ScheduleGenerator from './pages/Scheduling/ScheduleGenerator';
import ClassSchedule from './pages/Scheduling/ClassSchedule';
import ProfessorSchedule from './pages/Scheduling/ProfessorSchedule';
import RoomSchedule from './pages/Scheduling/RoomSchedule';
import ExamSchedule from './pages/Scheduling/ExamSchedule';
import EventSchedule from './pages/Scheduling/EventSchedule';
import Conflicts from './pages/Scheduling/Conflicts';

// Professor
import MySections from './pages/Professor/MySections';

// Student
import StudentSchedule from './pages/Student/StudentSchedule';

// Communication
import Announcements from './pages/Communication/Announcements';
import Notifications from './pages/Communication/Notifications';
import Messages from './pages/Communication/Messages';

// System
import Settings from './pages/System/Settings';

// Placeholder
import PlaceholderPage from './pages/Placeholder/PlaceholderPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ─── PUBLIC ─── */}
            <Route path="/login" element={<Login />} />
            <Route path="/enrollment" element={<EnrollmentForm />} />
            <Route path="/enrollment/status" element={<ApplicationStatus />} />

            {/* ─── PROTECTED ─── */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard — every role */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* ─── ADMIN-ONLY ─── */}
              <Route element={<RoleRoute allowedRoles={['admin', 'superadmin']} />}>
                <Route path="/admin/programs" element={<Programs />} />
                <Route path="/admin/sections" element={<Sections />} />
                <Route path="/admin/subjects" element={<Subjects />} />
                <Route path="/admin/semester-courses" element={<SemesterCourses />} />
                <Route path="/admin/professor-assignment" element={<ProfessorAssignment />} />
                <Route path="/admin/professor-availability" element={<ProfessorAvailability />} />
                <Route path="/admin/rooms" element={<Rooms />} />
                <Route path="/admin/professors" element={<Professors />} />
                <Route path="/admin/enrollments" element={<EnrollmentReview />} />
                <Route path="/admin/enrolled-students" element={<EnrolledStudents />} />
                <Route path="/admin/section-capacity" element={<SectionCapacity />} />
                <Route path="/admin/sent-emails" element={<SentEmails />} />
                <Route path="/scheduling/generator" element={<ScheduleGenerator />} />
                <Route path="/system/settings" element={<Settings />} />
              </Route>

              {/* ─── SUPERADMIN-ONLY ─── */}
              <Route element={<RoleRoute allowedRoles={['superadmin']} />}>
                <Route path="/users/admins" element={<Admins />} />
              </Route>

              {/* ─── ADMIN + STAFF ─── */}
              <Route
                element={<RoleRoute allowedRoles={['admin', 'superadmin', 'staff']} />}
              >
                <Route path="/scheduling/class" element={<ClassSchedule />} />
                <Route path="/scheduling/professor" element={<ProfessorSchedule />} />
                <Route path="/scheduling/room" element={<RoomSchedule />} />
                <Route path="/scheduling/exam" element={<ExamSchedule />} />
                <Route path="/scheduling/event" element={<EventSchedule />} />
                <Route path="/scheduling/conflicts" element={<Conflicts />} />
                <Route path="/users/students" element={<Students />} />
                <Route path="/users/staff" element={<Staff />} />
              </Route>

              {/* ─── PROFESSOR ─── */}
              <Route element={<RoleRoute allowedRoles={['professor']} />}>
                <Route path="/professor/schedule" element={<ProfessorSchedule />} />
                <Route path="/professor/sections" element={<MySections />} />
                <Route path="/professor/students" element={<Students />} />
                <Route path="/professor/subjects" element={<PlaceholderPage title="Assigned Subjects" />} />
                <Route path="/professor/change-request" element={<PlaceholderPage title="Request Schedule Change" />} />
                <Route path="/professor/availability" element={<ProfessorAvailability />} />
                <Route path="/professor/exams" element={<ExamSchedule />} />
              </Route>

              {/* ─── STUDENT ─── */}
              <Route element={<RoleRoute allowedRoles={['student']} />}>
                <Route path="/student/schedule" element={<StudentSchedule />} />
                <Route path="/student/subjects" element={<PlaceholderPage title="Enrolled Subjects" />} />
                <Route path="/student/section" element={<PlaceholderPage title="My Section" />} />
                <Route path="/student/exams" element={<PlaceholderPage title="Exam Schedule" />} />
                <Route path="/student/enrollment" element={<PlaceholderPage title="My Enrollment" />} />
              </Route>

              {/* ─── COMMUNICATION (everyone) ─── */}
              <Route path="/communication/announcements" element={<Announcements />} />
              <Route path="/communication/notifications" element={<Notifications />} />
              <Route path="/communication/messages" element={<Messages />} />

              {/* ─── SHARED PLACEHOLDERS ─── */}
              <Route path="/system/audit" element={<PlaceholderPage title="Audit Trail" />} />
              <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
              <Route path="/settings" element={<PlaceholderPage title="Account Settings" />} />
              <Route path="/help" element={<PlaceholderPage title="Help & Support" />} />
            </Route>

            {/* ─── FALLBACK ─── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}