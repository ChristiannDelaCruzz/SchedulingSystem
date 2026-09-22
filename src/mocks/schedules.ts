// src/mocks/schedules.ts
import type { ClassSchedule, ScheduleVersion } from '../types';

export const mockScheduleVersions: ScheduleVersion[] = [
  {
    id: 'sv-1',
    academic_year: '2026-2027',
    semester: 1,
    version_number: 1,
    status: 'published',
    created_by: 'u-admin-1',
    created_at: '2026-08-01T10:00:00Z',
    published_at: '2026-08-02T09:00:00Z',
  },
];

export const mockClassSchedules: ClassSchedule[] = [
  // ─── 3BSIT-1 ───
  { id: 'cs-1',  section_id: 'sec-3bsit-1', subject_id: 'subj-it301', professor_id: 'prof-1', room_id: 'room-102',  day: 'Monday',    start_time: '07:00', end_time: '10:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-2',  section_id: 'sec-3bsit-1', subject_id: 'subj-it302', professor_id: 'prof-1', room_id: 'room-lab1', day: 'Monday',    start_time: '10:00', end_time: '13:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-3',  section_id: 'sec-3bsit-1', subject_id: 'subj-it303', professor_id: 'prof-2', room_id: 'room-102',  day: 'Tuesday',   start_time: '07:00', end_time: '10:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-4',  section_id: 'sec-3bsit-1', subject_id: 'subj-it304', professor_id: 'prof-2', room_id: 'room-102',  day: 'Wednesday', start_time: '13:00', end_time: '16:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-5',  section_id: 'sec-3bsit-1', subject_id: 'subj-fe301', professor_id: 'prof-4', room_id: 'room-102',  day: 'Thursday',  start_time: '07:00', end_time: '10:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-6',  section_id: 'sec-3bsit-1', subject_id: 'subj-it305', professor_id: 'prof-1', room_id: 'room-102',  day: 'Friday',    start_time: '10:00', end_time: '13:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },

  // ─── 3BSIT-2 ───
  { id: 'cs-7',  section_id: 'sec-3bsit-2', subject_id: 'subj-it301', professor_id: 'prof-2', room_id: 'room-201',  day: 'Monday',    start_time: '10:00', end_time: '13:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-8',  section_id: 'sec-3bsit-2', subject_id: 'subj-it302', professor_id: 'prof-5', room_id: 'room-lab1', day: 'Tuesday',   start_time: '13:00', end_time: '16:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-9',  section_id: 'sec-3bsit-2', subject_id: 'subj-it303', professor_id: 'prof-3', room_id: 'room-201',  day: 'Wednesday', start_time: '07:00', end_time: '10:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-10', section_id: 'sec-3bsit-2', subject_id: 'subj-it304', professor_id: 'prof-3', room_id: 'room-201',  day: 'Thursday',  start_time: '10:00', end_time: '13:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-11', section_id: 'sec-3bsit-2', subject_id: 'subj-fe301', professor_id: 'prof-4', room_id: 'room-201',  day: 'Friday',    start_time: '07:00', end_time: '10:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },

  // ─── 3BSIT-3 ───
  { id: 'cs-12', section_id: 'sec-3bsit-3', subject_id: 'subj-it301', professor_id: 'prof-1', room_id: 'room-202',  day: 'Tuesday',   start_time: '13:00', end_time: '16:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-13', section_id: 'sec-3bsit-3', subject_id: 'subj-it302', professor_id: 'prof-5', room_id: 'room-lab2', day: 'Wednesday', start_time: '13:00', end_time: '16:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
  { id: 'cs-14', section_id: 'sec-3bsit-3', subject_id: 'subj-it303', professor_id: 'prof-2', room_id: 'room-202',  day: 'Thursday',  start_time: '07:00', end_time: '10:00', schedule_version_id: 'sv-1', status: 'valid', created_at: '2026-08-01T10:00:00Z' },
];