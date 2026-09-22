// src/pages/Dashboard/index.tsx
import React from 'react';
import { useRole } from '../../hooks/useRole';
import AdminDashboard from './AdminDashboard';
import ProfessorDashboard from './ProfessorDashboard';
import StaffDashboard from './StaffDashboard';
import StudentDashboard from './StudentDashboard';

export const Dashboard: React.FC = () => {
  const { role } = useRole();

  switch (role) {
    case 'superadmin':
    case 'admin':
      return <AdminDashboard />;
    case 'professor':
      return <ProfessorDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;