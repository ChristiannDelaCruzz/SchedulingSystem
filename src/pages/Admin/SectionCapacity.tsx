// src/pages/Admin/SectionCapacity.tsx
import React, { useMemo, useState } from 'react';
import {
  Gauge,
  Search,
  Users,
  GraduationCap,
  Building2,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import { mockSections } from '../../mocks/sections';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockDepartments } from '../../mocks/departments';

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
  <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-3`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

// ============================================
// MAIN
// ============================================
export const SectionCapacity: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getContext = (sectionId: string) => {
    const sec = mockSections.find((s) => s.id === sectionId);
    if (!sec) return null;
    const yl = mockYearLevels.find((y) => y.id === sec.year_level_id);
    const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
    const dept = prog ? mockDepartments.find((d) => d.id === prog.department_id) : null;
    return { sec, yl, prog, dept };
  };

  const filteredSections = useMemo(() => {
    return mockSections.filter((sec) => {
      if (!sec.is_active) return false;
      if (filterDepartmentId) {
        const yl = mockYearLevels.find((y) => y.id === sec.year_level_id);
        const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
        if (!prog || prog.department_id !== filterDepartmentId) return false;
      }
      if (filterStatus) {
        const occupancy =
          sec.max_capacity > 0 ? (sec.current_enrollment / sec.max_capacity) * 100 : 0;
        if (filterStatus === 'full' && occupancy < 100) return false;
        if (filterStatus === 'near-full' && (occupancy < 90 || occupancy >= 100)) return false;
        if (filterStatus === 'available' && occupancy >= 90) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!sec.name.toLowerCase().includes(q) && !sec.code.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [filterDepartmentId, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const active = mockSections.filter((s) => s.is_active);
    const totalCapacity = active.reduce((sum, s) => sum + s.max_capacity, 0);
    const totalEnrolled = active.reduce((sum, s) => sum + s.current_enrollment, 0);
    const overallOccupancy =
      totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
    const fullSections = active.filter(
      (s) => s.current_enrollment >= s.max_capacity
    ).length;
    return { totalCapacity, totalEnrolled, overallOccupancy, fullSections };
  }, []);

  const activeFiltersCount = (filterDepartmentId ? 1 : 0) + (filterStatus ? 1 : 0);

  const getOccupancyColor = (pct: number) => {
    if (pct >= 100) return { bar: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-50 text-red-700 border-red-200' };
    if (pct >= 90) return { bar: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (pct >= 70) return { bar: 'bg-cyan-500', text: 'text-cyan-600', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Section Capacity
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Monitor enrollment vs. capacity across all sections
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Enrolled" value={stats.totalEnrolled} color="bg-cyan-50 text-cyan-600" subtitle="Students" />
        <StatCard icon={Gauge} label="Total Capacity" value={stats.totalCapacity} color="bg-blue-50 text-blue-600" subtitle="Available seats" />
        <StatCard icon={GraduationCap} label="Overall Occupancy" value={`${stats.overallOccupancy}%`} color={stats.overallOccupancy >= 90 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} subtitle="Across all sections" />
        <StatCard icon={AlertTriangle} label="Full Sections" value={stats.fullSections} color="bg-amber-50 text-amber-600" subtitle={stats.fullSections > 0 ? 'Require attention' : 'All good'} />
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sections..."
                className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <PremiumDropdown
              value={filterDepartmentId}
              onChange={setFilterDepartmentId}
              options={[
                { value: '', label: 'All departments' },
                ...mockDepartments.map((d) => ({ value: d.id, label: d.code })),
              ]}
              placeholder="All departments"
              icon={Building2}
            />
            <PremiumDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'available', label: 'Available (< 90%)' },
                { value: 'near-full', label: 'Near full (90–99%)' },
                { value: 'full', label: 'Full (100%)' },
              ]}
              placeholder="All statuses"
            />
          </div>
        </div>

        {filteredSections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Gauge className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No sections found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'No active sections'}
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {filteredSections.map((sec) => {
              const ctx = getContext(sec.id);
              const occupancy =
                sec.max_capacity > 0
                  ? Math.round((sec.current_enrollment / sec.max_capacity) * 100)
                  : 0;
              const colors = getOccupancyColor(occupancy);
              const remaining = Math.max(0, sec.max_capacity - sec.current_enrollment);

              return (
                <div
                  key={sec.id}
                  className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-cyan/40 hover:shadow-md transition-all"
                >
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {sec.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ctx?.prog?.code} · {ctx?.yl?.name} · {ctx?.dept?.code}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${colors.badge}`}>
                      {occupancy >= 100 ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          FULL
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          {occupancy}% FULL
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-600">
                      {sec.current_enrollment} / {sec.max_capacity} students
                    </span>
                    <span className={`font-bold ${colors.text}`}>
                      {remaining > 0 ? `${remaining} slots left` : 'No slots left'}
                    </span>
                  </div>

                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${Math.min(occupancy, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SectionCapacity;