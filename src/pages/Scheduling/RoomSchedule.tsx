// src/pages/Scheduling/RoomSchedule.tsx
import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Filter,
  X,
  MapPin,
  Clock,
  User as UserIcon,
  BookOpen,
  RotateCcw,
  DoorOpen,
  AirVent,
  Projector,
  Monitor,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import TimetableGrid from '../../components/scheduling/TimetableGrid';
import { mockClassSchedules } from '../../mocks/schedules';
import { mockSections } from '../../mocks/sections';
import { mockSubjects } from '../../mocks/subjects';
import { mockRooms } from '../../mocks/rooms';
import { mockProfessors } from '../../mocks/professors';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { formatTime, formatDuration, durationInMinutes } from '../../lib/scheduleUtils';
import type { ClassSchedule as ScheduleType } from '../../types';

const getRoomTypeLabel = (v: string) => {
  const map: Record<string, string> = {
    classroom: 'Classroom',
    computer_laboratory: 'Computer Lab',
    science_laboratory: 'Science Lab',
    lecture_hall: 'Lecture Hall',
    auditorium: 'Auditorium',
    conference_room: 'Conference Room',
  };
  return map[v] || v;
};

export const RoomSchedule: React.FC = () => {
  const [filterRoomId, setFilterRoomId] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);

  const roomOptions = useMemo(
    () =>
      mockRooms
        .filter((r) => r.is_active)
        .map((r) => ({
          value: r.id,
          label: `${r.room_number} — ${getRoomTypeLabel(r.room_type)}`,
          sublabel: `${r.building}${r.floor ? ` · Floor ${r.floor}` : ''} · ${r.capacity} seats`,
        })),
    []
  );

  // Default to first active room
  const effectiveRoomId = filterRoomId || (mockRooms.find((r) => r.is_active)?.id ?? '');

  const selectedRoom = useMemo(
    () => mockRooms.find((r) => r.id === effectiveRoomId),
    [effectiveRoomId]
  );

  const roomSchedules = useMemo(() => {
    return mockClassSchedules.filter((s) => s.room_id === effectiveRoomId);
  }, [effectiveRoomId]);

  const activeFiltersCount = filterRoomId && filterRoomId !== mockRooms[0]?.id ? 1 : 0;

  const resetFilters = () => {
    setFilterRoomId('');
  };

  // Stats
  const stats = useMemo(() => {
    const totalClasses = roomSchedules.length;
    const uniqueSections = new Set(roomSchedules.map((s) => s.section_id)).size;
    const uniqueSubjects = new Set(roomSchedules.map((s) => s.subject_id)).size;
    const uniqueProfessors = new Set(roomSchedules.map((s) => s.professor_id)).size;
    const uniqueDays = new Set(roomSchedules.map((s) => s.day)).size;
    const totalMinutes = roomSchedules.reduce(
      (sum, s) => sum + durationInMinutes(s.start_time, s.end_time),
      0
    );
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    // Simple utilization: weekly hours vs available hours (Mon-Sat 07:00-21:00 = 84h)
    const availableHours = 84;
    const utilization = availableHours > 0 ? Math.round((totalHours / availableHours) * 100) : 0;
    return {
      totalClasses,
      uniqueSections,
      uniqueSubjects,
      uniqueProfessors,
      uniqueDays,
      totalHours,
      utilization,
    };
  }, [roomSchedules]);

  // Detail modal lookups
  const getSubject = (id: string) => mockSubjects.find((s) => s.id === id);
  const getSection = (id: string) => mockSections.find((s) => s.id === id);
  const getProfessor = (id: string) => mockProfessors.find((p) => p.id === id);

  // Section context (program, year level) for the modal
  const getSectionContext = (sectionId: string) => {
    const sec = mockSections.find((s) => s.id === sectionId);
    if (!sec) return null;
    const yl = mockYearLevels.find((y) => y.id === sec.year_level_id);
    const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
    return { sec, yl, prog };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Room Schedule
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Weekly timetable per room — see occupancy and utilization
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowFilterPanel((v) => !v)}
            variant="outline"
            className="relative"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Select Room
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white bg-cyan-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            disabled={activeFiltersCount === 0}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* ROOM CARD */}
      {selectedRoom && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white flex-shrink-0">
              <DoorOpen className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Room {selectedRoom.room_number}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    selectedRoom.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedRoom.status === 'occupied'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : selectedRoom.status === 'maintenance'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {selectedRoom.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedRoom.building}
                {selectedRoom.floor ? ` · Floor ${selectedRoom.floor}` : ''} ·{' '}
                {getRoomTypeLabel(selectedRoom.room_type)} · {selectedRoom.capacity} seats
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {selectedRoom.has_aircon && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-semibold text-blue-700">
                    <AirVent className="w-3 h-3" /> Air-conditioned
                  </span>
                )}
                {selectedRoom.has_projector && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-200 rounded-full text-[10px] font-semibold text-purple-700">
                    <Projector className="w-3 h-3" /> Projector
                  </span>
                )}
                {selectedRoom.has_computers && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-semibold text-amber-700">
                    <Monitor className="w-3 h-3" /> Computers
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Weekly Classes', value: stats.totalClasses, color: 'bg-cyan-50 text-cyan-600' },
          { label: 'Sections', value: stats.uniqueSections, color: 'bg-blue-50 text-blue-600' },
          { label: 'Subjects', value: stats.uniqueSubjects, color: 'bg-purple-50 text-purple-600' },
          { label: 'Weekly Hours', value: `${stats.totalHours}h`, color: 'bg-amber-50 text-amber-600' },
          { label: 'Utilization', value: `${stats.utilization}%`, color: 'bg-emerald-50 text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-2`}>
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* FILTER PANEL */}
      {showFilterPanel && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-navy flex items-center justify-center shadow-sm">
                  <DoorOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Select Room</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {roomSchedules.length} class
                    {roomSchedules.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PremiumDropdown
                label="Room"
                value={filterRoomId}
                onChange={setFilterRoomId}
                options={roomOptions}
                placeholder="Select a room"
                icon={DoorOpen}
                searchable
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                {roomOptions.length} active rooms
              </p>
              <button
                onClick={resetFilters}
                disabled={activeFiltersCount === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIMETABLE */}
      {roomSchedules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <DoorOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No classes scheduled</h2>
          <p className="text-sm text-slate-500 mt-2">
            Room {selectedRoom?.room_number ?? ''} has no classes in the current schedule.
          </p>
        </Card>
      ) : (
        <TimetableGrid
          schedules={roomSchedules}
          subjects={mockSubjects}
          sections={mockSections}
          rooms={mockRooms}
          professors={mockProfessors}
          days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']}
          dayStart="07:00"
          dayEnd="21:00"
          onBlockClick={(s) => setSelectedSchedule(s)}
        />
      )}

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        maxWidth="max-w-md"
      >
        {selectedSchedule && (
          <>
            {(() => {
              const subject = getSubject(selectedSchedule.subject_id);
              const section = getSection(selectedSchedule.section_id);
              const professor = getProfessor(selectedSchedule.professor_id);
              const profName = professor
                ? `${professor.profiles?.first_name ?? ''} ${
                    professor.profiles?.last_name ?? ''
                  }`.trim()
                : '—';
              const duration = durationInMinutes(
                selectedSchedule.start_time,
                selectedSchedule.end_time
              );
              const ctx = section ? getSectionContext(section.id) : null;
              return (
                <>
                  <div className="relative px-6 py-6 bg-gradient-to-br from-navy to-navy-dark">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-cyan-200">
                          {subject?.code ?? '—'}
                        </p>
                        <h3 className="text-lg font-bold text-white truncate leading-tight">
                          {subject?.name ?? 'Unknown Subject'}
                        </h3>
                        <p className="text-xs text-white/70 mt-1">
                          {selectedSchedule.day} ·{' '}
                          {formatTime(selectedSchedule.start_time)} –{' '}
                          {formatTime(selectedSchedule.end_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Section
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {section?.name ?? '—'}
                        </p>
                        {ctx?.prog && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {ctx.prog.code} · {ctx.yl?.name}
                          </p>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Duration
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {formatDuration(duration)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <UserIcon className="w-3 h-3" /> Professor
                        </p>
                        <p className="text-sm font-bold text-slate-900">{profName}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Room
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {selectedRoom?.room_number ?? '—'}
                          {selectedRoom ? ` · ${selectedRoom.building}` : ''}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Time
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {formatTime(selectedSchedule.start_time)} –{' '}
                          {formatTime(selectedSchedule.end_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                      onClick={() => setSelectedSchedule(null)}
                      className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </Modal>
    </div>
  );
};

export default RoomSchedule;