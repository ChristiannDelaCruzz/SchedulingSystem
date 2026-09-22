// src/pages/Scheduling/ClassSchedule.tsx
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
import { mockDepartments } from '../../mocks/departments';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { formatTime, formatDuration, durationInMinutes } from '../../lib/scheduleUtils';
import type { ClassSchedule as ScheduleType } from '../../types';

export const ClassSchedule: React.FC = () => {
  

  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterProgramId, setFilterProgramId] = useState('');
  const [filterYearLevelId, setFilterYearLevelId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);

  // Cascading options
  const filterPrograms = useMemo(
    () =>
      filterDepartmentId
        ? mockPrograms.filter((p) => p.department_id === filterDepartmentId)
        : mockPrograms,
    [filterDepartmentId]
  );

  const filterYearLevels = useMemo(
    () =>
      filterProgramId
        ? mockYearLevels.filter((y) => y.program_id === filterProgramId)
        : mockYearLevels,
    [filterProgramId]
  );

  const filterSections = useMemo(() => {
    return mockSections.filter((s) => {
      if (filterYearLevelId && s.year_level_id !== filterYearLevelId) return false;
      if (filterProgramId) {
        const yl = mockYearLevels.find((y) => y.id === s.year_level_id);
        if (!yl || yl.program_id !== filterProgramId) return false;
      }
      if (filterDepartmentId) {
        const yl = mockYearLevels.find((y) => y.id === s.year_level_id);
        const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
        if (!prog || prog.department_id !== filterDepartmentId) return false;
      }
      return s.is_active;
    });
  }, [filterYearLevelId, filterProgramId, filterDepartmentId]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return mockClassSchedules.filter((s) => {
      if (filterSectionId) return s.section_id === filterSectionId;
      if (filterSections.length > 0 && (filterYearLevelId || filterProgramId || filterDepartmentId)) {
        return filterSections.some((sec) => sec.id === s.section_id);
      }
      return true;
    });
  }, [filterSectionId, filterSections, filterYearLevelId, filterProgramId, filterDepartmentId]);

  const activeFiltersCount =
    (filterDepartmentId ? 1 : 0) +
    (filterProgramId ? 1 : 0) +
    (filterYearLevelId ? 1 : 0) +
    (filterSectionId ? 1 : 0);

  const resetFilters = () => {
    setFilterDepartmentId('');
    setFilterProgramId('');
    setFilterYearLevelId('');
    setFilterSectionId('');
  };

  // Lookups for detail modal
  const getSubject = (id: string) => mockSubjects.find((s) => s.id === id);
  const getSection = (id: string) => mockSections.find((s) => s.id === id);
  const getRoom = (id: string) => mockRooms.find((r) => r.id === id);
  const getProfessor = (id: string) => mockProfessors.find((p) => p.id === id);

  const stats = useMemo(() => {
    const total = filteredSchedules.length;
    const uniqueSections = new Set(filteredSchedules.map((s) => s.section_id)).size;
    const uniqueRooms = new Set(filteredSchedules.map((s) => s.room_id)).size;
    const uniqueProfessors = new Set(filteredSchedules.map((s) => s.professor_id)).size;
    const daysWithClasses = new Set(filteredSchedules.map((s) => s.day)).size;
    return { total, uniqueSections, uniqueRooms, uniqueProfessors, daysWithClasses };
  }, [filteredSchedules]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Class Schedule
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Weekly timetable view — Monday to Saturday
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowFilterPanel((v) => !v)}
            variant="outline"
            className="relative"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filters
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

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Classes Shown', value: stats.total, color: 'bg-cyan-50 text-cyan-600' },
          { label: 'Sections', value: stats.uniqueSections, color: 'bg-blue-50 text-blue-600' },
          { label: 'Professors', value: stats.uniqueProfessors, color: 'bg-purple-50 text-purple-600' },
          { label: 'Rooms Used', value: stats.uniqueRooms, color: 'bg-amber-50 text-amber-600' },
          { label: 'Active Days', value: stats.daysWithClasses, color: 'bg-emerald-50 text-emerald-600' },
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
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Filter Schedule</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filteredSchedules.length} class{filteredSchedules.length !== 1 ? 'es' : ''} match
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

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PremiumDropdown
                label="Department"
                value={filterDepartmentId}
                onChange={(v) => {
                  setFilterDepartmentId(v);
                  setFilterProgramId('');
                  setFilterYearLevelId('');
                  setFilterSectionId('');
                }}
                options={mockDepartments.map((d) => ({
                  value: d.id,
                  label: d.name,
                  sublabel: d.code,
                }))}
                placeholder="All departments"
                searchable
              />
              <PremiumDropdown
                label="Program"
                value={filterProgramId}
                onChange={(v) => {
                  setFilterProgramId(v);
                  setFilterYearLevelId('');
                  setFilterSectionId('');
                }}
                options={filterPrograms.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: p.code,
                }))}
                placeholder="All programs"
                disabled={!filterDepartmentId && false}
                searchable
              />
              <PremiumDropdown
                label="Year Level"
                value={filterYearLevelId}
                onChange={(v) => {
                  setFilterYearLevelId(v);
                  setFilterSectionId('');
                }}
                options={filterYearLevels.map((y) => ({ value: y.id, label: y.name }))}
                placeholder="All year levels"
              />
              <PremiumDropdown
                label="Section"
                value={filterSectionId}
                onChange={setFilterSectionId}
                options={filterSections.map((s) => ({
                  value: s.id,
                  label: s.name,
                  sublabel: s.code,
                }))}
                placeholder="All sections"
                searchable
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                Showing {filteredSchedules.length} of {mockClassSchedules.length} classes
              </p>
              <button
                onClick={resetFilters}
                disabled={activeFiltersCount === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIMETABLE */}
      {filteredSchedules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No classes to display</h2>
          <p className="text-sm text-slate-500 mt-2">
            {activeFiltersCount > 0
              ? 'Try adjusting your filters to see more classes.'
              : 'No class schedules have been generated yet.'}
          </p>
          {activeFiltersCount > 0 && (
            <div className="mt-5">
              <Button onClick={resetFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <TimetableGrid
          schedules={filteredSchedules}
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
              const room = getRoom(selectedSchedule.room_id);
              const professor = getProfessor(selectedSchedule.professor_id);
              const duration = durationInMinutes(
                selectedSchedule.start_time,
                selectedSchedule.end_time
              );
              const profName = professor
                ? `${professor.profiles?.first_name ?? ''} ${
                    professor.profiles?.last_name ?? ''
                  }`.trim()
                : '—';

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

                    <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          selectedSchedule.status === 'valid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : selectedSchedule.status === 'conflict'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {selectedSchedule.status.toUpperCase()}
                      </span>
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

export default ClassSchedule;