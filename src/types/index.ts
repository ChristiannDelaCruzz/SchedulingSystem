// src/types/index.ts

// ============================================
// USER & ROLES
// ============================================
export type UserRole = 'superadmin' | 'admin' | 'staff' | 'professor' | 'student';

export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// ACADEMIC STRUCTURE
// ============================================
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
}

export interface Program {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description?: string;
  education_level: 'college' | 'shs' | 'jhs' | 'elementary';
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  departments?: Department;
}

export interface YearLevel {
  id: string;
  program_id: string;
  name: string;
  level: number;
  createdAt: string;
}

export interface Section {
  id: string;
  year_level_id: string;
  name: string;
  code: string;
  max_capacity: number;
  current_enrollment: number;
  academic_year: string;
  semester: 1 | 2;
  status: 'active' | 'full' | 'closed' | 'archived';
  is_active: boolean;
  eligible_rooms: string[];
  preferred_rooms: string[];
  created_at: string;
  year_levels?: YearLevel & {
    programs?: Program & {
      departments?: Department;
    };
  };
}

// ============================================
// SUBJECTS
// ============================================
export type SubjectType = 'lecture' | 'laboratory' | 'lecture_lab';

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  units: number;
  subject_type: SubjectType;
  required_hours: number;
  room_type_required: string;
  prerequisites?: string[];
  is_active: boolean;
  created_at: string;
}

// ============================================
// PROFESSORS
// ============================================
export interface Professor {
  id: string;
  user_id: string;
  employee_id: string;
  specialization?: string;
  educational_attainment?: string;
  years_of_experience?: number;
  is_active: boolean;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    contact_number?: string;
  };
}

export interface ProfessorQualification {
  id: string;
  professor_id: string;
  subject_id: string;
  qualification_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  is_active: boolean;
  created_at: string;
  subjects?: Subject;
}

export interface ProfessorAvailability {
  id: string;
  professor_id: string;
  day: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// ============================================
// ROOMS
// ============================================
export interface Room {
  id: string;
  room_number: string;
  building: string;
  floor: number | null;
  room_type: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  has_aircon: boolean;
  has_projector: boolean;
  has_computers: boolean;
  additional_equipment?: string[];
  is_active: boolean;
  created_at: string;
}

// ============================================
// SCHEDULES
// ============================================
export interface ClassSchedule {
  id: string;
  section_id: string;
  subject_id: string;
  professor_id: string;
  room_id: string;
  day: string;
  start_time: string;
  end_time: string;
  schedule_version_id: string;
  status: 'valid' | 'conflict' | 'pending';
  created_at: string;
}

export interface ScheduleVersion {
  id: string;
  academic_year: string;
  semester: 1 | 2;
  version_number: number;
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  published_at?: string;
}

// ============================================
// ENROLLMENT
// ============================================
export type EnrollmentType = 'new' | 'continuing' | 'returnee' | 'transferee';

export interface EnrollmentApplication {
  id: string;
  application_number: string;
  student_id: string;
  section_id: string;
  enrollment_type: EnrollmentType;
  previous_student_number?: string;
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'needs_correction'
    | 'approved'
    | 'rejected'
    | 'cancelled';
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
  created_at: string;
}

export interface EnrollmentApplicationWithDetails extends EnrollmentApplication {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  section?: {
    id: string;
    name: string;
    code: string;
  };
  courses?: Array<{
    id: string;
    subject: Subject;
  }>;
}

export interface EnrollmentFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    contactNumber: string;
    email: string;
    address: string;
  };
  academicInfo: {
    departmentId: string;
    programId: string;
    yearLevelId: string;
    academicYear: string;
    semester: 1 | 2;
    sectionId: string;
  };
  enrollmentType: EnrollmentType;
  previousStudentNumber?: string;
}

export interface SectionCapacity {
  id: string;
  name: string;
  code: string;
  max_capacity: number;
  current_enrollment: number;
  remaining_slots: number;
  status: 'open' | 'full' | 'closed';
}

export interface EnrollmentFilters {
  status?: string;
  programId?: string;
  yearLevelId?: string;
  academicYear?: string;
  semester?: number;
}

// ============================================
// NOTIFICATIONS
// ============================================
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationCategory =
  | 'schedule'
  | 'enrollment'
  | 'exam'
  | 'announcement'
  | 'conflict'
  | 'system'
  | 'request';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// ============================================
// TOASTS
// ============================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ============================================
// API RESPONSE SHAPE (kept for service signature compatibility)
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
  message?: string;
}

// ============================================
// CONFLICTS (scheduling engine)
// ============================================
export type ConflictType =
  | 'professor_overlap'
  | 'section_overlap'
  | 'room_overlap'
  | 'professor_unavailable'
  | 'room_capacity_exceeded'
  | 'room_type_mismatch'
  | 'break_violation';

export interface Conflict {
  id: string;
  type: ConflictType;
  severity: 'error' | 'warning';
  /** Schedule entries involved */
  scheduleIds: string[];
  /** Human-readable description */
  message: string;
  /** Optional suggested fix */
  suggestion?: string;
}