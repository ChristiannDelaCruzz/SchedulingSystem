// src/mocks/users.ts
import type { User } from '../types';

export const mockUsers: User[] = [
  { id: 'u-super-1',   email: 'super@test.com',   firstName: 'Super', lastName: 'Admin',      role: 'superadmin', isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u-admin-1',   email: 'admin@test.com',   firstName: 'Juan',  lastName: 'Dela Cruz',  role: 'admin',      isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u-staff-1',   email: 'staff@test.com',   firstName: 'Maria', lastName: 'Santos',     role: 'staff',      isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u-prof-1',    email: 'prof@test.com',    firstName: 'Pedro', lastName: 'Reyes',      role: 'professor',  isActive: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u-student-1', email: 'student@test.com', firstName: 'Ana',   lastName: 'Lopez',      role: 'student',    isActive: true, createdAt: '2026-01-01T00:00:00Z' },
];

export const mockCredentials: Record<string, string> = {
  'super@test.com': 'super123',
  'admin@test.com': 'admin123',
  'staff@test.com': 'staff123',
  'prof@test.com': 'prof123',
  'student@test.com': 'student123',
};