// src/hooks/useRole.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { UserRole } from '../types';

export interface UseRoleReturn {
  role: UserRole;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isProfessor: boolean;
  isStudent: boolean;
  isAuthenticated: boolean;

  // Permission helpers
  canManageAcademics: boolean;
  canManageScheduling: boolean;
  canManageUsers: boolean;
  canManageEnrollment: boolean;
  canViewSchedules: boolean;
  canRequestScheduleChange: boolean;
  canSetAvailability: boolean;
  canViewStudents: boolean;
  canViewAuditTrail: boolean;
  canManageSystemSettings: boolean;
  canGenerateSchedule: boolean;
  canPublishSchedule: boolean;
  canManageExamsAndEvents: boolean;
  canBroadcastAnnouncements: boolean;

  // Helpers
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  roleLabel: string;
}

export function useRole(): UseRoleReturn {
  const { user, isAuthenticated } = useAuth();

  const role: UserRole = (user?.role as UserRole) || 'student';

  return useMemo<UseRoleReturn>(() => {
    const isSuperAdmin = role === 'superadmin';
    const isAdmin = role === 'admin' || role === 'superadmin';
    const isStaff = role === 'staff';
    const isProfessor = role === 'professor';
    const isStudent = role === 'student';

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
      if (Array.isArray(roles)) return roles.includes(role);
      return role === roles;
    };

    const roleLabel = (() => {
      switch (role) {
        case 'superadmin':
          return 'Super Admin';
        case 'admin':
          return 'Admin';
        case 'staff':
          return 'Staff';
        case 'professor':
          return 'Professor';
        case 'student':
          return 'Student';
        default:
          return 'User';
      }
    })();

    return {
      role,
      isSuperAdmin,
      isAdmin,
      isStaff,
      isProfessor,
      isStudent,
      isAuthenticated,

      canManageAcademics: isAdmin,
      canManageScheduling: isAdmin,
      canManageUsers: isSuperAdmin,
      canManageEnrollment: isAdmin || isStaff,
      canViewSchedules: true,
      canRequestScheduleChange: isProfessor,
      canSetAvailability: isProfessor,
      canViewStudents: isAdmin || isStaff || isProfessor,
      canViewAuditTrail: isSuperAdmin,
      canManageSystemSettings: isSuperAdmin,
      canGenerateSchedule: isAdmin,
      canPublishSchedule: isAdmin,
      canManageExamsAndEvents: isAdmin,
      canBroadcastAnnouncements: isAdmin || isStaff,

      hasRole,
      roleLabel,
    };
  }, [role, isAuthenticated]);
}