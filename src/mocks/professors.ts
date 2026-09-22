// src/mocks/professors.ts
import type { Professor, ProfessorQualification } from '../types';

export const mockProfessors: Professor[] = [
  {
    id: 'prof-1',
    user_id: 'u-prof-1',
    employee_id: 'EMP-2026-001',
    specialization: 'Software Engineering',
    educational_attainment: 'Master of Science in IT',
    years_of_experience: 8,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    profiles: {
      id: 'u-prof-1',
      email: 'prof@test.com',
      first_name: 'Pedro',
      last_name: 'Reyes',
      contact_number: '+63 912 345 6789',
    },
  },
  {
    id: 'prof-2',
    user_id: 'u-prof-2',
    employee_id: 'EMP-2026-002',
    specialization: 'Database Systems',
    educational_attainment: 'PhD in Computer Science',
    years_of_experience: 12,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    profiles: {
      id: 'u-prof-2',
      email: 'prof.santos@test.com',
      first_name: 'Sofia',
      last_name: 'Santos',
      contact_number: '+63 917 111 2222',
    },
  },
  {
    id: 'prof-3',
    user_id: 'u-prof-3',
    employee_id: 'EMP-2026-003',
    specialization: 'Cybersecurity',
    educational_attainment: 'Master of Science in Cybersecurity',
    years_of_experience: 6,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    profiles: {
      id: 'u-prof-3',
      email: 'prof.cruz@test.com',
      first_name: 'Marco',
      last_name: 'Cruz',
      contact_number: '+63 918 333 4444',
    },
  },
  {
    id: 'prof-4',
    user_id: 'u-prof-4',
    employee_id: 'EMP-2026-004',
    specialization: 'Networking',
    educational_attainment: 'Master of Engineering',
    years_of_experience: 10,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    profiles: {
      id: 'u-prof-4',
      email: 'prof.tan@test.com',
      first_name: 'Liza',
      last_name: 'Tan',
      contact_number: '+63 919 555 6666',
    },
  },
  {
    id: 'prof-5',
    user_id: 'u-prof-5',
    employee_id: 'EMP-2026-005',
    specialization: 'Web Development',
    educational_attainment: 'Master of Science in IT',
    years_of_experience: 4,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    profiles: {
      id: 'u-prof-5',
      email: 'prof.garcia@test.com',
      first_name: 'Rafael',
      last_name: 'Garcia',
      contact_number: '+63 920 777 8888',
    },
  },
];

export const mockProfessorQualifications: ProfessorQualification[] = [
  // Professor 1 — Pedro Reyes
  { id: 'pq-1', professor_id: 'prof-1', subject_id: 'subj-it301', qualification_level: 'advanced',     is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pq-2', professor_id: 'prof-1', subject_id: 'subj-it302', qualification_level: 'advanced',     is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pq-3', professor_id: 'prof-1', subject_id: 'subj-it305', qualification_level: 'intermediate', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  // Professor 2 — Sofia Santos
  { id: 'pq-4', professor_id: 'prof-2', subject_id: 'subj-it301', qualification_level: 'expert',       is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pq-5', professor_id: 'prof-2', subject_id: 'subj-it303', qualification_level: 'advanced',     is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pq-6', professor_id: 'prof-2', subject_id: 'subj-it304', qualification_level: 'intermediate', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  // Professor 3 — Marco Cruz
  { id: 'pq-7', professor_id: 'prof-3', subject_id: 'subj-it303', qualification_level: 'expert',       is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pq-8', professor_id: 'prof-3', subject_id: 'subj-it304', qualification_level: 'advanced',     is_active: true, created_at: '2026-01-01T00:00:00Z' },
  // Professor 4 — Liza Tan
  { id: 'pq-9',  professor_id: 'prof-4', subject_id: 'subj-fe301', qualification_level: 'advanced',     is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pq-10', professor_id: 'prof-4', subject_id: 'subj-it305', qualification_level: 'advanced',     is_active: true, created_at: '2026-01-01T00:00:00Z' },
  // Professor 5 — Rafael Garcia
  { id: 'pq-11', professor_id: 'prof-5', subject_id: 'subj-it302', qualification_level: 'expert',       is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pq-12', professor_id: 'prof-5', subject_id: 'subj-cs301', qualification_level: 'intermediate', is_active: true, created_at: '2026-01-01T00:00:00Z' },
];