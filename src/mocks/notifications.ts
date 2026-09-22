// src/mocks/notifications.ts
import type { AppNotification } from '../types';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'u-admin-1',
    title: 'Schedule Generated',
    message: 'The 1st Semester BSIT schedule has been successfully generated.',
    type: 'success',
    category: 'schedule',
    is_read: false,
    action_url: '/scheduling/class',
    created_at: minutesAgo(5),
  },
  {
    id: 'notif-2',
    user_id: 'u-admin-1',
    title: 'Conflict Detected',
    message: 'Professor Reyes has an overlapping class on Monday 10:00 AM.',
    type: 'warning',
    category: 'conflict',
    is_read: false,
    action_url: '/scheduling/conflicts',
    created_at: minutesAgo(30),
  },
  {
    id: 'notif-3',
    user_id: 'u-admin-1',
    title: 'New Enrollment Application',
    message: 'Joy Mendoza submitted an enrollment application.',
    type: 'info',
    category: 'enrollment',
    is_read: true,
    action_url: '/admin/enrollments',
    created_at: hoursAgo(2),
  },
  {
    id: 'notif-4',
    user_id: 'u-admin-1',
    title: 'Room Updated',
    message: 'Room 104 status changed to Maintenance.',
    type: 'warning',
    category: 'system',
    is_read: true,
    created_at: hoursAgo(6),
  },
  {
    id: 'notif-5',
    user_id: 'u-admin-1',
    title: 'Schedule Published',
    message: 'The 1st Semester schedule has been published.',
    type: 'success',
    category: 'schedule',
    is_read: true,
    action_url: '/scheduling/class',
    created_at: hoursAgo(24),
  },
];