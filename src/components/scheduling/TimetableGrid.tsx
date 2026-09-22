// src/components/scheduling/TimetableGrid.tsx
import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import {
  groupByDay,
  formatTime,
  getScheduleColor,
  timeToMinutes,
} from '../../lib/scheduleUtils';
import type { ClassSchedule, Room, Section, Subject, Professor } from '../../types';

export interface TimetableGridProps {
  schedules: ClassSchedule[];
  subjects: Subject[];
  sections: Section[];
  rooms: Room[];
  professors: Professor[];
  /** Slot length in minutes for the grid rows */
  slotMinutes?: number;
  /** Time range per day */
  dayStart?: string;
  dayEnd?: string;
  /** Which days to render */
  days?: string[];
  /** Optional click handler for a schedule block */
  onBlockClick?: (schedule: ClassSchedule) => void;
}

const SLOT_HEIGHT_PX = 52; // height of 1 hour in the grid

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  schedules,
  subjects,
  sections,
  rooms,
  professors,
  slotMinutes = 60,
  dayStart = '07:00',
  dayEnd = '21:00',
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  onBlockClick,
}) => {
  const startMinutes = timeToMinutes(dayStart);
  const endMinutes = timeToMinutes(dayEnd);
  const totalMinutes = endMinutes - startMinutes;
  const totalSlots = Math.ceil(totalMinutes / slotMinutes);

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const sectionMap = useMemo(() => new Map(sections.map((s) => [s.id, s])), [sections]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const professorMap = useMemo(
    () => new Map(professors.map((p) => [p.id, p])),
    [professors]
  );

  const grouped = useMemo(() => groupByDay(schedules), [schedules]);

  // Pixel height per minute
  const pxPerMinute = SLOT_HEIGHT_PX / 60;

  const timeLabels: { minutes: number; label: string }[] = [];
  for (let i = 0; i <= totalSlots; i++) {
    const minutes = startMinutes + i * slotMinutes;
    timeLabels.push({
      minutes,
      label: formatTime(
        `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(
          minutes % 60
        ).padStart(2, '0')}`
      ),
    });
  }

  const getProfessorName = (id: string): string => {
    const p = professorMap.get(id);
    if (!p) return '—';
    const first = p.profiles?.first_name ?? '';
    const last = p.profiles?.last_name ?? '';
    return `${first} ${last}`.trim() || p.employee_id;
  };

  const renderBlock = (schedule: ClassSchedule) => {
    const subject = subjectMap.get(schedule.subject_id);
    const section = sectionMap.get(schedule.section_id);
    const room = roomMap.get(schedule.room_id);
    const colorClass = getScheduleColor(schedule.subject_id);

    const startMin = timeToMinutes(schedule.start_time);
    const endMin = timeToMinutes(schedule.end_time);
    const top = (startMin - startMinutes) * pxPerMinute;
    const height = (endMin - startMin) * pxPerMinute;

    return (
      <button
        key={schedule.id}
        onClick={() => onBlockClick?.(schedule)}
        className={`absolute left-1 right-1 rounded-lg border-2 ${colorClass} text-left p-2 overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-1`}
        style={{ top: `${top}px`, height: `${height}px` }}
        title={`${subject?.code ?? ''} · ${section?.name ?? ''} · ${
          room?.room_number ?? ''
        }`}
      >
        <div className="flex flex-col gap-0.5 h-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold font-mono opacity-80">
              {subject?.code ?? '—'}
            </span>
            <span className="text-[9px] font-medium opacity-70">
              {formatTime(schedule.start_time)}
            </span>
          </div>
          <span className="text-[10px] font-semibold truncate leading-tight">
            {subject?.name ?? '—'}
          </span>
          <span className="text-[9px] opacity-80 truncate">
            {section?.name ?? ''}
          </span>
          <span className="text-[9px] opacity-70 truncate mt-auto">
            {getProfessorName(schedule.professor_id)} · {room?.room_number ?? '—'}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header row: day labels */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <div className="w-[72px] flex-shrink-0 border-r border-slate-200 flex items-center justify-center py-3">
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        {days.map((day) => (
          <div
            key={day}
            className="flex-1 min-w-0 border-r last:border-r-0 border-slate-200 py-3 text-center"
          >
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {day.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>

      {/* Grid body */}
      <div className="flex relative" style={{ height: `${totalSlots * SLOT_HEIGHT_PX}px` }}>
        {/* Time column */}
        <div className="w-[72px] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 relative">
          {timeLabels.map((t, i) => (
            <div
              key={i}
              className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-slate-400"
              style={{ top: `${i * SLOT_HEIGHT_PX}px` }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1">
          {days.map((day) => (
            <div
              key={day}
              className="flex-1 min-w-0 relative border-r last:border-r-0 border-slate-200"
            >
              {/* Hour lines */}
              {timeLabels.map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-slate-100"
                  style={{ top: `${i * SLOT_HEIGHT_PX}px` }}
                />
              ))}

              {/* Class blocks */}
              {(grouped[day] ?? []).map((s) => renderBlock(s))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;