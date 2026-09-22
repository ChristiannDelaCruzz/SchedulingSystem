// src/pages/Student/StudentSchedule.tsx
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
  GraduationCap,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import TimetableGrid from '../../components/scheduling/TimetableGrid';
import { useAuth } from '../../hooks/useAuth';
import { mockClassSchedules } from '../../mocks/schedules';
import { mockSections } from '../../mocks/sections';
import { mockSubjects } from '../../mocks/subjects';
import { mockRooms } from '../../mocks/rooms';
import { mockProfessors } from '../../mocks/professors';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockDepartments } from '../../mocks/departments';
import { formatTime, formatDuration, durationInMinutes } from '../../lib/scheduleUtils';
import type { ClassSchedule as ScheduleType } from '../../types';

// The logged-in student's section — hardcoded to 3BSIT-1 for the demo
const DEMO_SECTION_ID = 'sec-3bsit-1';

export const StudentSchedule: React.FC = () => {
  const { user } = useAuth();
  const [filterSectionId, setFilterSectionId] = useState(DEMO_SECTION_ID);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);

  // All active sections as options (for demo purposes students can look at others)
  const sectionOptions = useMemo(
    () =>
      mockSections
        .filter((s) => s.is_active)
        .map((s) => ({
          value: s.id,
          label: s.name,
          sublabel: s.code,
        })),
    []
  );

  const selectedSection = useMemo(
    () => mockSections.find((s) => s.id === filterSectionId),
    [filterSectionId]
  );

  const sectionSchedules = useMemo(() => {
    return mockClassSchedules.filter((s) => s.section_id === filterSectionId);
  }, [filterSectionId]);

  const activeFiltersCount = filterSectionId !== DEMO_SECTION_ID ? 1 : 0;

  const resetFilters = () => {
    setFilterSectionId(DEMO_SECTION_ID);
  };

  // Enrolled subjects (unique) derived from section's schedules
  const enrolledSubjects = useMemo(() => {
    const ids = new Set(sectionSchedules.map((s) => s.subject_id));
    return mockSubjects.filter((s) => ids.has(s.id));
  }, [sectionSchedules]);

  const stats = useMemo(() => {
    const totalClasses = sectionSchedules.length;
    const totalUnits = enrolledSubjects.reduce((sum, s) => sum + s.units, 0);
    const uniqueRooms = new Set(sectionSchedules.map((s) => s.room_id)).size;
    const uniqueProfessors = new Set(sectionSchedules.map((s) => s.professor_id)).size;
    const uniqueDays = new Set(sectionSchedules.map((s) => s.day)).size;
    return {
      totalClasses,
      totalUnits,
      uniqueRooms,
      uniqueProfessors,
      uniqueDays,
    };
  }, [sectionSchedules, enrolledSubjects]);

  // Lookups for detail modal
  const getSubject = (id: string) => mockSubjects.find((s) => s.id === id);
  const getRoom = (id: string) => mockRooms.find((r) => r.id === id);
  const getProfessor = (id: string) => mockProfessors.find((p) => p.id === id);

  // Section context (year level, program, department)
  const sectionContext = useMemo(() => {
    if (!selectedSection) return null;
    const yl = mockYearLevels.find((y) => y.id === selectedSection.year_level_id);
    const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
    const dept = prog
      ? mockDepartments.find((d) => d.id === prog.department_id)
      : null;
    return { yl, prog, dept };
  }, [selectedSection]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Class Schedule
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Weekly timetable for your enrolled section
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowFilterPanel((v) => !v)}
            variant="outline"
            className="relative"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Select Section
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

      {/* STUDENT INFO */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {user?.firstName?.[0] ?? 'S'}
            {user?.lastName?.[0] ?? 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {user?.firstName ?? 'Student'} {user?.lastName ?? ''}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate">
              {user?.email ?? 'student@test.com'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {sectionContext?.dept && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                  {sectionContext.dept.code}
                </span>
              )}
              {sectionContext?.prog && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                  {sectionContext.prog.code}
                </span>
              )}
              {sectionContext?.yl && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                  {sectionContext.yl.name}
                </span>
              )}
              {selectedSection && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-bold text-cyan-700">
                  <GraduationCap className="w-3 h-3" />
                  {selectedSection.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Weekly Classes', value: stats.totalClasses, color: 'bg-cyan-50 text-cyan-600' },
          { label: 'Enrolled Subjects', value: enrolledSubjects.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Units', value: stats.totalUnits, color: 'bg-purple-50 text-purple-600' },
          { label: 'Classrooms', value: stats.uniqueRooms, color: 'bg-amber-50 text-amber-600' },
          { label: 'Active Days', value: stats.uniqueDays, color: 'bg-emerald-50 text-emerald-600' },
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
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Select Section</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sectionSchedules.length} class
                    {sectionSchedules.length !== 1 ? 'es' : ''} for {selectedSection?.name}
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
                label="Section"
                value={filterSectionId}
                onChange={setFilterSectionId}
                options={sectionOptions}
                placeholder="Select section"
                icon={GraduationCap}
                searchable
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                {sectionOptions.length} active sections
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

      {/* ENROLLED SUBJECTS LIST */}
      {enrolledSubjects.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-500" />
            Enrolled Subjects ({enrolledSubjects.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {enrolledSubjects.map((subj) => (
              <div
                key={subj.id}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <span className="text-xs font-bold font-mono text-navy">{subj.code}</span>
                <span className="text-xs text-slate-600 truncate max-w-[180px]">{subj.name}</span>
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  {subj.units} u
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TIMETABLE */}
      {sectionSchedules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No classes scheduled</h2>
          <p className="text-sm text-slate-500 mt-2">
            {selectedSection?.name} has no classes in the current schedule.
          </p>
        </Card>
      ) : (
        <TimetableGrid
          schedules={sectionSchedules}
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
              const room = getRoom(selectedSchedule.room_id);
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
                          {selectedSection?.name ?? '—'}
                        </p>
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
                          {room?.room_number ?? '—'}
                          {room ? ` · ${room.building}` : ''}
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

export default StudentSchedule;