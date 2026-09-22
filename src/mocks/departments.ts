// src/mocks/departments.ts
import type { Department } from '../types';

export const mockDepartments: Department[] = [
  { id: 'dept-computing',   name: 'Department of Computing',   code: 'DOC',  description: 'Computing and IT programs',          status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'dept-business',    name: 'Department of Business',    code: 'DOB',  description: 'Business and management programs',   status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'dept-education',   name: 'Department of Education',   code: 'DOE',  description: 'Teacher education programs',         status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'dept-engineering', name: 'Department of Engineering', code: 'DOEN', description: 'Engineering programs',               status: 'active', createdAt: '2026-01-01T00:00:00Z' },
];