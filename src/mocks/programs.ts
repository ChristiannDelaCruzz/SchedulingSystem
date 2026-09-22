// src/mocks/programs.ts
import type { Program } from '../types';

export const mockPrograms: Program[] = [
  { id: 'prog-bscs',  department_id: 'dept-computing', name: 'Bachelor of Science in Computer Science',                        code: 'BSCS',  education_level: 'college', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'prog-bsit',  department_id: 'dept-computing', name: 'Bachelor of Science in Information Technology',                  code: 'BSIT',  education_level: 'college', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'prog-bsemc', department_id: 'dept-computing', name: 'Bachelor of Science in Entertainment and Multimedia Computing',  code: 'BSEMC', education_level: 'college', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'prog-bsis',  department_id: 'dept-computing', name: 'Bachelor of Science in Information Systems',                     code: 'BSIS',  education_level: 'college', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
];