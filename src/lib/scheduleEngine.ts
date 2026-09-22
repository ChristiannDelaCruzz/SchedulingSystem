// src/lib/scheduleEngine.ts
import type {
  ClassSchedule,
  Room,
  Section,
  Subject,
  Professor,
  ProfessorQualification,
  Conflict,
} from '../types';
import {
  DAY_ORDER,
  timeToMinutes,
  minutesToTime,
  rangesOverlap,
  detectConflicts,
  type DayName,
} from './scheduleUtils';

// ============================================
// INPUT / OUTPUT
// ============================================
export interface GenerationInput {
  academicYear: string;
  semester: 1 | 2;
  sectionIds: string[]; // sections to schedule
  sections: Section[];
  subjects: Subject[];
  professors: Professor[];
  qualifications: ProfessorQualification[];
  rooms: Room[];
  /** Existing scheduled entries to preserve (e.g. from other sections not being regenerated) */
  existingSchedules?: ClassSchedule[];
  /** Which days are available for scheduling */
  availableDays?: DayName[];
  /** Time window per day */
  dayStart?: string; // "07:00"
  dayEnd?: string;   // "21:00"
  /** Slot length in minutes */
  slotMinutes?: number;
  /** Hard constraints */
  constraints?: {
    checkProfessorConflicts: boolean;
    checkSectionConflicts: boolean;
    checkRoomConflicts: boolean;
    checkAvailability: boolean;
    checkQualifications: boolean;
    checkCapacity: boolean;
    checkBreaks: boolean;
  };
}

export interface UnscheduledEntry {
  sectionId: string;
  subjectId: string;
  reason: string;
}

export interface GenerationResult {
  schedules: ClassSchedule[];
  unscheduled: UnscheduledEntry[];
  conflicts: Conflict[];
  summary: {
    totalClassesGenerated: number;
    totalUnscheduled: number;
    totalConflicts: number;
    scheduleVersionId: string;
  };
}

// ============================================
// HELPERS
// ============================================
function getProfessorName(p: Professor | undefined): string {
  if (!p) return 'Unassigned';
  const first = p.profiles?.first_name ?? '';
  const last = p.profiles?.last_name ?? '';
  return `${first} ${last}`.trim() || p.employee_id;
}

/**
 * Which professors are qualified for a given subject?
 */
function qualifiedProfessors(
  subjectId: string,
  professors: Professor[],
  qualifications: ProfessorQualification[]
): Professor[] {
  const qualifiedIds = new Set(
    qualifications
      .filter((q) => q.subject_id === subjectId && q.is_active)
      .map((q) => q.professor_id)
  );
  return professors.filter((p) => p.is_active && qualifiedIds.has(p.id));
}

/**
 * Attempt to fit a class of `durationMinutes` into a day, given all "blocked" intervals.
 * Returns the earliest valid start time, or null if none found.
 */
function findSlot(
  day: DayName,
  durationMinutes: number,
  busy: Array<{ day: string; start: string; end: string }>,
  dayStart: string,
  dayEnd: string,
  slotMinutes: number
): { start: string; end: string } | null {
  const startMin = timeToMinutes(dayStart);
  const endMin = timeToMinutes(dayEnd);

  const dayBusy = busy
    .filter((b) => b.day === day)
    .map((b) => ({
      start: timeToMinutes(b.start),
      end: timeToMinutes(b.end),
    }))
    .sort((a, b) => a.start - b.start);

  for (let t = startMin; t + durationMinutes <= endMin; t += slotMinutes) {
    const slotStart = t;
    const slotEnd = t + durationMinutes;
    const collides = dayBusy.some(
      (b) => slotStart < b.end && b.start < slotEnd
    );
    if (!collides) {
      return {
        start: minutesToTime(slotStart),
        end: minutesToTime(slotEnd),
      };
    }
  }
  return null;
}

// ============================================
// MAIN ENGINE
// ============================================
export function generateSchedule(input: GenerationInput): GenerationResult {
  const {
    sectionIds,
    sections,
    subjects,
    professors,
    qualifications,
    rooms,
    existingSchedules = [],
    availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayName[],
    dayStart = '07:00',
    dayEnd = '21:00',
    slotMinutes = 30,
    constraints = {
      checkProfessorConflicts: true,
      checkSectionConflicts: true,
      checkRoomConflicts: true,
      checkAvailability: true,
      checkQualifications: true,
      checkCapacity: true,
      checkBreaks: true,
    },
  } = input;

  const newSchedules: ClassSchedule[] = [];
  const unscheduled: UnscheduledEntry[] = [];

  // ─── Build working busy map ───
  // professorBusy[profId] = array of { day, start, end }
  const professorBusy = new Map<string, Array<{ day: string; start: string; end: string }>>();
  const sectionBusy = new Map<string, Array<{ day: string; start: string; end: string }>>();
  const roomBusy = new Map<string, Array<{ day: string; start: string; end: string }>>();

  // Seed with existing schedules
  for (const s of existingSchedules) {
    const interval = { day: s.day, start: s.start_time, end: s.end_time };
    if (!professorBusy.has(s.professor_id)) professorBusy.set(s.professor_id, []);
    professorBusy.get(s.professor_id)!.push(interval);

    if (!sectionBusy.has(s.section_id)) sectionBusy.set(s.section_id, []);
    sectionBusy.get(s.section_id)!.push(interval);

    if (!roomBusy.has(s.room_id)) roomBusy.set(s.room_id, []);
    roomBusy.get(s.room_id)!.push(interval);
  }

  // ─── Iterate sections ───
  const targetSections = sections.filter((s) => sectionIds.includes(s.id));

  for (const section of targetSections) {
    // Only schedule active subjects for the section (all subjects for now — real app would use curriculum)
    const sectionSubjects = subjects.filter((s) => s.is_active);

    for (const subject of sectionSubjects) {
      const durationMinutes = subject.required_hours * 60;
      const duration = Math.max(60, durationMinutes);

      // ─── Pick a qualified professor ───
      const profs = qualifiedProfessors(subject.id, professors, qualifications);
      if (profs.length === 0) {
        unscheduled.push({
          sectionId: section.id,
          subjectId: subject.id,
          reason: 'No qualified professor available',
        });
        continue;
      }

      // ─── Pick a room ───
      // Prefer preferred_rooms, then eligible_rooms, then any active room matching type
      const sectionRooms = rooms.filter(
        (r) =>
          r.is_active &&
          (section.preferred_rooms.includes(r.id) ||
            section.eligible_rooms.includes(r.id) ||
            section.eligible_rooms.length === 0)
      );

      // Filter by room type & capacity
      let candidateRooms = sectionRooms.filter((r) => {
        if (constraints.checkCapacity && r.capacity < section.current_enrollment) return false;
        // strict room type requirement
        const required = subject.room_type_required;
        if (required === 'computer_laboratory' || required === 'science_laboratory') {
          if (r.room_type !== required) return false;
        }
        return true;
      });

      // Prefer preferred rooms
      candidateRooms.sort((a, b) => {
        const aPref = section.preferred_rooms.includes(a.id) ? 0 : 1;
        const bPref = section.preferred_rooms.includes(b.id) ? 0 : 1;
        return aPref - bPref;
      });

      if (candidateRooms.length === 0) {
        unscheduled.push({
          sectionId: section.id,
          subjectId: subject.id,
          reason: 'No suitable room available',
        });
        continue;
      }

      // ─── Try to place ───
      let placed = false;

      // Try each professor, each day, each room
      outer: for (const professor of profs) {
        for (const day of availableDays) {
          // Check professor availability
          if (constraints.checkAvailability) {
            const profBusyOnDay = professorBusy.get(professor.id) ?? [];
            const profHasTime = day === 'Monday' || day === 'Tuesday' || day === 'Wednesday' || day === 'Thursday' || day === 'Friday';
            // Simple availability: skip Sunday only
            if (!profHasTime) continue;
            // Additional logic would check professor's declared availability here
            void profBusyOnDay;
          }

          for (const room of candidateRooms) {
            // Build busy lists for this iteration
            const profBusy = professorBusy.get(professor.id) ?? [];
            const sectBusy = sectionBusy.get(section.id) ?? [];
            const rmBusy = roomBusy.get(room.id) ?? [];

            // Combine all "blocked" intervals that apply to this triple
            const blocked = [...profBusy, ...sectBusy, ...rmBusy];

            const slot = findSlot(day, duration, blocked, dayStart, dayEnd, slotMinutes);
            if (!slot) continue;

            // Create the schedule entry
            const newEntry: ClassSchedule = {
              id: `cs-gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              section_id: section.id,
              subject_id: subject.id,
              professor_id: professor.id,
              room_id: room.id,
              day,
              start_time: slot.start,
              end_time: slot.end,
              schedule_version_id: 'pending',
              status: 'valid',
              created_at: new Date().toISOString(),
            };

            newSchedules.push(newEntry);

            const interval = { day, start: slot.start, end: slot.end };
            profBusy.push(interval);
            sectBusy.push(interval);
            rmBusy.push(interval);
            professorBusy.set(professor.id, profBusy);
            sectionBusy.set(section.id, sectBusy);
            roomBusy.set(room.id, rmBusy);

            placed = true;
            break outer;
          }
        }
      }

      if (!placed) {
        unscheduled.push({
          sectionId: section.id,
          subjectId: subject.id,
          reason: 'No valid day/time slot could fit the required duration',
        });
      }
    }
  }

  // ─── Post-generation conflict scan ───
  const allSchedules = [...existingSchedules, ...newSchedules];
  const conflicts = detectConflicts(allSchedules, {
    rooms,
    sections,
    subjects,
  });

  const scheduleVersionId = `sv-${Date.now()}`;

  // Stamp the version
  for (const s of newSchedules) s.schedule_version_id = scheduleVersionId;

  return {
    schedules: newSchedules,
    unscheduled,
    conflicts,
    summary: {
      totalClassesGenerated: newSchedules.length,
      totalUnscheduled: unscheduled.length,
      totalConflicts: conflicts.length,
      scheduleVersionId,
    },
  };
}

// ============================================
// HELPER — get display labels for unscheduled entries
// ============================================
export function describeUnscheduled(
  entry: UnscheduledEntry,
  sections: Section[],
  subjects: Subject[]
): string {
  const section = sections.find((s) => s.id === entry.sectionId);
  const subject = subjects.find((s) => s.id === entry.subjectId);
  const sectionName = section?.name ?? entry.sectionId;
  const subjectName = subject ? `${subject.code} — ${subject.name}` : entry.subjectId;
  return `${sectionName} · ${subjectName}`;
}

/** Unused but exported for future — avoids TS unused warnings */
export const _unused = {
  DAY_ORDER,
  getProfessorName,
  rangesOverlap,
};