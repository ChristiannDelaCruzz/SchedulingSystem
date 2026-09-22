// src/pages/Scheduling/Conflicts.tsx
import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Users,
  DoorOpen,
  BookOpen,
  UserCheck,
  Layers,
  Clock,
  CheckCircle2,
  Filter,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import { useToast } from '../../hooks/useToast';
import { mockClassSchedules } from '../../mocks/schedules';
import { mockRooms } from '../../mocks/rooms';
import { mockSections } from '../../mocks/sections';
import { mockSubjects } from '../../mocks/subjects';
import { mockProfessors } from '../../mocks/professors';
import {
  detectConflicts,
  formatTime,
  countConflictsByType,
} from '../../lib/scheduleUtils';
import type { Conflict, ConflictType } from '../../types';

// ============================================
// CONFIG
// ============================================
const CONFLICT_META: Record<
  ConflictType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  professor_overlap: {
    label: 'Professor Overlap',
    icon: Users,
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
  },
  section_overlap: {
    label: 'Section Overlap',
    icon: Layers,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  room_overlap: {
    label: 'Room Overlap',
    icon: DoorOpen,
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
  },
  professor_unavailable: {
    label: 'Professor Unavailable',
    icon: UserCheck,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  room_capacity_exceeded: {
    label: 'Room Capacity',
    icon: Users,
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
  },
  room_type_mismatch: {
    label: 'Room Type Mismatch',
    icon: DoorOpen,
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
  },
  break_violation: {
    label: 'Break Violation',
    icon: Clock,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
};

const CONFLICT_TYPES: { value: ConflictType; label: string }[] = (
  Object.keys(CONFLICT_META) as ConflictType[]
).map((k) => ({ value: k, label: CONFLICT_META[k].label }));

// ============================================
// STAT CARD
// ============================================
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
}> = ({ icon: Icon, label, value, color, subtitle }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-3`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

// ============================================
// HELPER: Resolve schedule details
// ============================================
function describeSchedule(scheduleId: string): string {
  const s = mockClassSchedules.find((x) => x.id === scheduleId);
  if (!s) return scheduleId;
  const subj = mockSubjects.find((x) => x.id === s.subject_id);
  const section = mockSections.find((x) => x.id === s.section_id);
  const prof = mockProfessors.find((x) => x.id === s.professor_id);
  const profName = prof
    ? `${prof.profiles?.first_name ?? ''} ${prof.profiles?.last_name ?? ''}`.trim()
    : s.professor_id;
  return `${subj?.code ?? s.subject_id} · ${section?.name ?? s.section_id} · ${profName} · ${s.day} ${formatTime(
    s.start_time
  )}–${formatTime(s.end_time)}`;
}

// ============================================
// CONFLICT CARD
// ============================================
const ConflictCard: React.FC<{ conflict: Conflict }> = ({ conflict }) => {
  const meta = CONFLICT_META[conflict.type];
  const Icon = meta.icon;
  const isError = conflict.severity === 'error';

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
        isError ? 'bg-red-50/40 border-red-200' : 'bg-amber-50/40 border-amber-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}
        >
          <Icon className={`w-5 h-5 ${meta.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.color}`}>
              <Icon className="w-3 h-3" />
              {meta.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isError
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              {conflict.severity}
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {conflict.message}
          </p>

          {conflict.scheduleIds.length > 0 && (
            <div className="mt-3 space-y-1">
              {conflict.scheduleIds.map((id) => (
                <div
                  key={id}
                  className="flex items-start gap-2 text-xs text-slate-600 bg-white/70 border border-slate-200 rounded-lg px-3 py-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="font-mono">{describeSchedule(id)}</span>
                </div>
              ))}
            </div>
          )}

          {conflict.suggestion && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-white rounded-xl border border-cyan-200">
              <Sparkles className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-cyan-700">Suggested fix: </span>
                {conflict.suggestion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN
// ============================================
export const Conflicts: React.FC = () => {
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Run the detection engine ───
  const allConflicts = useMemo(() => {
    return detectConflicts(mockClassSchedules, {
      rooms: mockRooms,
      sections: mockSections,
      subjects: mockSubjects,
    });
  }, [refreshKey]);

  // ─── Filtered ───
  const filteredConflicts = useMemo(() => {
    return allConflicts.filter((c) => {
      if (filterType && c.type !== filterType) return false;
      if (filterSeverity && c.severity !== filterSeverity) return false;
      return true;
    });
  }, [allConflicts, filterType, filterSeverity]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const byType = countConflictsByType(allConflicts);
    return {
      total: allConflicts.length,
      errors: allConflicts.filter((c) => c.severity === 'error').length,
      warnings: allConflicts.filter((c) => c.severity === 'warning').length,
      byType,
    };
  }, [allConflicts]);

  const activeFiltersCount = (filterType ? 1 : 0) + (filterSeverity ? 1 : 0);

  const severityOptions = [
    { value: 'error', label: 'Errors only' },
    { value: 'warning', label: 'Warnings only' },
  ];

  // ============================================
  // HANDLERS
  // ============================================
  const handleResetFilters = () => {
    setFilterType('');
    setFilterSeverity('');
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    showToast('info', 'Refreshed', 'Re-scanned schedules for conflicts.');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Schedule Conflicts
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Detected conflicts across all schedules. Resolve them before publishing.
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
          <Button onClick={handleRefresh} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Re-scan
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Total Conflicts"
          value={stats.total}
          color="bg-red-50 text-red-600"
          subtitle={stats.total === 0 ? 'All clear!' : 'Review below'}
        />
        <StatCard
          icon={AlertTriangle}
          label="Errors"
          value={stats.errors}
          color="bg-red-50 text-red-600"
          subtitle="Blocking issues"
        />
        <StatCard
          icon={AlertTriangle}
          label="Warnings"
          value={stats.warnings}
          color="bg-amber-50 text-amber-600"
          subtitle="Review when possible"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={0}
          color="bg-emerald-50 text-emerald-600"
          subtitle="This session"
        />
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
                  <h3 className="text-sm font-bold text-slate-900">Filter Conflicts</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filteredConflicts.length} conflict{filteredConflicts.length !== 1 ? 's' : ''} match
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
                label="Conflict Type"
                value={filterType}
                onChange={setFilterType}
                options={CONFLICT_TYPES}
                placeholder="All types"
                icon={AlertTriangle}
              />
              <PremiumDropdown
                label="Severity"
                value={filterSeverity}
                onChange={setFilterSeverity}
                options={severityOptions}
                placeholder="All severities"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                {filteredConflicts.length} of {allConflicts.length} conflicts
              </p>
              <button
                onClick={handleResetFilters}
                disabled={activeFiltersCount === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFLICT LIST */}
      {filteredConflicts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-lg shadow-emerald-200/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {allConflicts.length === 0 ? 'No conflicts detected' : 'No conflicts match your filters'}
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            {allConflicts.length === 0
              ? 'All schedules are conflict-free. The generated schedule is valid and ready for publishing.'
              : 'Try clearing the filters to see all detected conflicts.'}
          </p>
          {allConflicts.length === 0 && (
            <div className="mt-6 flex justify-center gap-3">
              <Button
                onClick={() => showToast('success', 'All clear!', 'Schedule is ready to publish.')}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Mark as Reviewed
              </Button>
            </div>
          )}
          {allConflicts.length > 0 && activeFiltersCount > 0 && (
            <div className="mt-6">
              <Button onClick={handleResetFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* Conflicts by type summary */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Conflicts by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {CONFLICT_TYPES.map((t) => {
                const meta = CONFLICT_META[t.value];
                const Icon = meta.icon;
                const count = stats.byType[t.value];
                return (
                  <div
                    key={t.value}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      count > 0 ? meta.bg : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${count > 0 ? meta.color : 'text-slate-400'}`} />
                      <span className={`text-xl font-bold ${count > 0 ? meta.color : 'text-slate-400'}`}>
                        {count}
                      </span>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${
                      count > 0 ? meta.color : 'text-slate-400'
                    }`}>
                      {t.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Conflict cards */}
          <div className="space-y-3">
            {filteredConflicts.map((conflict) => (
              <ConflictCard key={conflict.id} conflict={conflict} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Conflicts;