// src/lib/scheduleUtils.ts
import type {
  ClassSchedule,
  Conflict,
  ConflictType,
  Room,
  Section,
  Subject,
} from '../types';

// ============================================
// CONSTANTS
// ============================================
export const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayName = (typeof DAY_ORDER)[number];

// ============================================
// TIME HELPERS
// ============================================

/**
 * Convert "HH:MM" (24h) string to minutes since midnight.
 * Returns 0 for malformed input.
 */
export function timeToMinutes(time: string): number {
  if (!time || typeof time !== 'string') return 0;
  const parts = time.split(':');
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to "HH:MM" 24h.
 */
export function minutesToTime(minutes: number): string {
  const m = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Format "HH:MM" (24h) to "H:MM AM/PM".
 */
export function formatTime(time: string): string {
  const total = timeToMinutes(time);
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Duration in minutes between two "HH:MM" strings.
 */
export function durationInMinutes(start: string, end: string): number {
  return Math.max(0, timeToMinutes(end) - timeToMinutes(start));
}

/**
 * Human-friendly duration (e.g., "3h", "1h 30m").
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ============================================
// OVERLAP DETECTION
// ============================================

/**
 * Two [start, end) ranges overlap? Adjacent ranges (end == start) do NOT overlap.
 */
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Check if two schedule entries overlap in time on the same day.
 */
export function schedulesOverlap(a: ClassSchedule, b: ClassSchedule): boolean {
  if (a.day !== b.day) return false;
  return rangesOverlap(a.start_time, a.end_time, b.start_time, b.end_time);
}

// ============================================
// TIME SLOT GENERATION
// ============================================

export interface TimeSlot {
  start: string; // "HH:MM"
  end: string;
  startLabel: string;
  endLabel: string;
}

/**
 * Generate regular time slots for a day.
 * @param startTime - e.g. "07:00"
 * @param endTime   - e.g. "21:00"
 * @param slotMinutes - length of each slot (e.g., 60)
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotMinutes = 60
): TimeSlot[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: TimeSlot[] = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    const s = minutesToTime(t);
    const e = minutesToTime(t + slotMinutes);
    slots.push({
      start: s,
      end: e,
      startLabel: formatTime(s),
      endLabel: formatTime(e),
    });
  }
  return slots;
}

// ============================================
// CONFLICT DETECTION
// ============================================

let conflictCounter = 0;
const nextConflictId = () => `cf-${++conflictCounter}`;

/**
 * Scan all schedules for conflicts.
 * Assumes a single section per professor/room lookup via the passed maps.
 */
export function detectConflicts(
  schedules: ClassSchedule[],
  opts: {
    rooms?: Room[];
    sections?: Section[];
    subjects?: Subject[];
  } = {}
): Conflict[] {
  const conflicts: Conflict[] = [];
  const { rooms = [], sections = [], subjects = [] } = opts;

  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const sectionMap = new Map(sections.map((s) => [s.id, s]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Compare every pair
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];
      if (!schedulesOverlap(a, b)) continue;

      // Professor overlap
      if (a.professor_id === b.professor_id) {
        conflicts.push({
          id: nextConflictId(),
          type: 'professor_overlap',
          severity: 'error',
          scheduleIds: [a.id, b.id],
          message: `Professor has two overlapping classes: ${a.day} ${formatTime(
            a.start_time
          )}–${formatTime(a.end_time)}`,
          suggestion: 'Move one class to a different time slot or reassign a professor.',
        });
      }

      // Section overlap
      if (a.section_id === b.section_id) {
        conflicts.push({
          id: nextConflictId(),
          type: 'section_overlap',
          severity: 'error',
          scheduleIds: [a.id, b.id],
          message: `Section has two overlapping classes: ${a.day} ${formatTime(
            a.start_time
          )}–${formatTime(a.end_time)}`,
          suggestion: 'Move one class to a different time slot.',
        });
      }

      // Room overlap
      if (a.room_id === b.room_id) {
        conflicts.push({
          id: nextConflictId(),
          type: 'room_overlap',
          severity: 'error',
          scheduleIds: [a.id, b.id],
          message: `Room is double-booked: ${a.day} ${formatTime(
            a.start_time
          )}–${formatTime(a.end_time)}`,
          suggestion: 'Assign a different room to one of the classes.',
        });
      }
    }
  }

  // Per-schedule checks (capacity, room type)
  for (const s of schedules) {
    const room = roomMap.get(s.room_id);
    const section = sectionMap.get(s.section_id);
    const subject = subjectMap.get(s.subject_id);

    // Room capacity vs section enrollment
    if (room && section && section.current_enrollment > room.capacity) {
      conflicts.push({
        id: nextConflictId(),
        type: 'room_capacity_exceeded',
        severity: 'warning',
        scheduleIds: [s.id],
        message: `Room ${room.room_number} capacity (${room.capacity}) is below section enrollment (${section.current_enrollment}).`,
        suggestion: 'Assign a larger room.',
      });
    }

    // Room type mismatch (e.g., lab subject in a classroom)
    if (room && subject) {
      const required = subject.room_type_required;
      const actual = room.room_type;
      // Only flag mismatch if required is specifically "computer_laboratory" or "science_laboratory"
      const strictRequirements = ['computer_laboratory', 'science_laboratory'];
      if (strictRequirements.includes(required) && actual !== required) {
        conflicts.push({
          id: nextConflictId(),
          type: 'room_type_mismatch',
          severity: 'warning',
          scheduleIds: [s.id],
          message: `Subject requires a ${required.replace(/_/g, ' ')}, but room ${room.room_number} is a ${actual.replace(/_/g, ' ')}.`,
          suggestion: 'Assign a room matching the required type.',
        });
      }
    }
  }

  return conflicts;
}

/**
 * Get counts by conflict type for badges/stats.
 */
export function countConflictsByType(
  conflicts: Conflict[]
): Record<ConflictType, number> {
  const counts = {
    professor_overlap: 0,
    section_overlap: 0,
    room_overlap: 0,
    professor_unavailable: 0,
    room_capacity_exceeded: 0,
    room_type_mismatch: 0,
    break_violation: 0,
  } as Record<ConflictType, number>;

  for (const c of conflicts) counts[c.type]++;
  return counts;
}

// ============================================
// LOOKUP HELPERS
// ============================================

/**
 * Stable color class for a schedule block (derived from subject id).
 */
const SUBJECT_COLORS = [
  'bg-cyan-50 border-cyan-200 text-cyan-900',
  'bg-emerald-50 border-emerald-200 text-emerald-900',
  'bg-amber-50 border-amber-200 text-amber-900',
  'bg-purple-50 border-purple-200 text-purple-900',
  'bg-blue-50 border-blue-200 text-blue-900',
  'bg-rose-50 border-rose-200 text-rose-900',
  'bg-teal-50 border-teal-200 text-teal-900',
  'bg-indigo-50 border-indigo-200 text-indigo-900',
];

export function getScheduleColor(subjectId: string): string {
  let hash = 0;
  for (let i = 0; i < subjectId.length; i++) {
    hash = (hash * 31 + subjectId.charCodeAt(i)) >>> 0;
  }
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}

/**
 * Group schedules by day, sorted by start time within each day.
 */
export function groupByDay(
  schedules: ClassSchedule[]
): Record<string, ClassSchedule[]> {
  const grouped: Record<string, ClassSchedule[]> = {};
  for (const day of DAY_ORDER) grouped[day] = [];
  for (const s of schedules) {
    if (!grouped[s.day]) grouped[s.day] = [];
    grouped[s.day].push(s);
  }
  for (const day of Object.keys(grouped)) {
    grouped[day].sort(
      (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
    );
  }
  return grouped;
}