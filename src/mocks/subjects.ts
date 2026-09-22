// src/mocks/subjects.ts
import type { Subject } from '../types';

const subj = (
  id: string,
  code: string,
  name: string,
  units: number,
  subject_type: Subject['subject_type'],
  required_hours: number,
  room_type_required: string
): Subject => ({
  id,
  code,
  name,
  units,
  subject_type,
  required_hours,
  room_type_required,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
});

export const mockSubjects: Subject[] = [
  subj('subj-it301', 'IT301', 'Systems Analysis and Design', 3, 'lecture', 3, 'classroom'),
  subj('subj-it302', 'IT302', 'Application Development and Emerging Technologies', 3, 'lecture_lab', 3, 'computer_laboratory'),
  subj('subj-it303', 'IT303', 'Information Assurance and Security 1', 3, 'lecture', 3, 'classroom'),
  subj('subj-it304', 'IT304', 'IT Elective 3', 3, 'lecture', 3, 'classroom'),
  subj('subj-fe301', 'FE301', 'Free Elective 1', 3, 'lecture', 3, 'classroom'),
  subj('subj-it305', 'IT305', 'System Integration and Architecture 2', 3, 'lecture', 3, 'classroom'),
  subj('subj-cs301', 'CS301', 'Theory of Computation', 3, 'lecture', 3, 'classroom'),
  subj('subj-cs302', 'CS302', 'Advanced Algorithms', 3, 'lecture', 3, 'classroom'),
];