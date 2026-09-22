// src/pages/Admin/EnrolledStudents.tsx
import React, { useMemo, useState } from 'react';
import {
  Search,
  Users,
  GraduationCap,
  Mail,
  Building2,
  X,
  Eye,
  Filter,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { mockEnrollments } from '../../mocks/enrollments';
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
export const EnrolledStudents: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<(typeof mockEnrollments)[number] | null>(null);

  // Only approved enrollments
  const approvedEnrollments = useMemo(
    () => mockEnrollments.filter((e) => e.status === 'approved'),
    []
  );

  const filtered = useMemo(() => {
    return approvedEnrollments.filter((e) => {
      if (filterSectionId && e.section_id !== filterSectionId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = `${e.student?.first_name ?? ''} ${e.student?.last_name ?? ''}`.toLowerCase();
        const email = (e.student?.email ?? '').toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [approvedEnrollments, filterSectionId, searchQuery]);

  const stats = useMemo(() => {
    const total = approvedEnrollments.length;
    const sections = new Set(approvedEnrollments.map((e) => e.section_id)).size;
    const programs = new Set(
      approvedEnrollments
        .map((e) => {
          const sec = mockSections.find((s) => s.id === e.section_id);
          const yl = sec ? mockYearLevels.find((y) => y.id === sec.year_level_id) : null;
          return yl?.program_id;
        })
        .filter(Boolean)
    ).size;
    const departments = new Set(
      approvedEnrollments
        .map((e) => {
          const sec = mockSections.find((s) => s.id === e.section_id);
          const yl = sec ? mockYearLevels.find((y) => y.id === sec.year_level_id) : null;
          const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
          return prog?.department_id;
        })
        .filter(Boolean)
    ).size;
    return { total, sections, programs, departments };
  }, [approvedEnrollments]);

  const sectionOptions = mockSections
    .filter((s) => s.is_active)
    .map((s) => ({ value: s.id, label: s.name, sublabel: s.code }));

  const getSectionContext = (sectionId: string) => {
    const sec = mockSections.find((s) => s.id === sectionId);
    if (!sec) return null;
    const yl = mockYearLevels.find((y) => y.id === sec.year_level_id);
    const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
    const dept = prog ? mockDepartments.find((d) => d.id === prog.department_id) : null;
    return { sec, yl, prog, dept };
  };

  const activeFiltersCount = filterSectionId ? 1 : 0;

  const openDetail = (e: (typeof mockEnrollments)[number]) => {
    setSelectedEnrollment(e);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Enrolled Students
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Students with approved enrollment this term
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Total Enrolled" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="Approved applications" />
        <StatCard icon={GraduationCap} label="Sections" value={stats.sections} color="bg-blue-50 text-blue-600" subtitle="With enrolled students" />
        <StatCard icon={Building2} label="Programs" value={stats.programs} color="bg-purple-50 text-purple-600" subtitle="Represented" />
        <StatCard icon={Users} label="Departments" value={stats.departments} color="bg-emerald-50 text-emerald-600" subtitle="Covered" />
      </div>

      {showFilterPanel && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-navy flex items-center justify-center shadow-sm">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Filter Students</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filtered.length} student{filtered.length !== 1 ? 's' : ''} match
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
                placeholder="All sections"
                icon={GraduationCap}
                searchable
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                {filtered.length} of {approvedEnrollments.length} students
              </p>
              <button
                onClick={() => {
                  setFilterSectionId('');
                  setSearchQuery('');
                }}
                disabled={activeFiltersCount === 0 && !searchQuery}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email..."
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
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No students found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'No approved enrollments yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Program</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Enrollment Type</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => {
                  const ctx = getSectionContext(e.section_id);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {e.student?.first_name?.[0] ?? ''}
                            {e.student?.last_name?.[0] ?? ''}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {e.student?.first_name} {e.student?.last_name}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              {e.application_number}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {e.student?.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {ctx?.sec?.name ?? '—'}
                        </p>
                        <p className="text-xs text-slate-500">{ctx?.yl?.name ?? ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {ctx?.prog?.code ?? '—'}
                        </p>
                        <p className="text-xs text-slate-500">{ctx?.dept?.code ?? ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-700 capitalize">
                          {e.enrollment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetail(e)}
                          className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={showDetailModal && !!selectedEnrollment}
        onClose={() => setShowDetailModal(false)}
        maxWidth="max-w-md"
      >
        {selectedEnrollment && (
          <>
            <div className="relative px-6 py-6 bg-gradient-to-br from-navy to-navy-dark">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 text-white text-xl font-bold">
                  {selectedEnrollment.student?.first_name?.[0] ?? ''}
                  {selectedEnrollment.student?.last_name?.[0] ?? ''}
                </div>
                <div className="text-white min-w-0">
                  <h3 className="text-lg font-bold truncate">
                    {selectedEnrollment.student?.first_name}{' '}
                    {selectedEnrollment.student?.last_name}
                  </h3>
                  <p className="text-xs text-white/70 font-mono mt-0.5">
                    {selectedEnrollment.application_number}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {(() => {
                const ctx = getSectionContext(selectedEnrollment.section_id);
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="text-sm font-medium text-slate-900 break-all">
                        {selectedEnrollment.student?.email}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Section
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {ctx?.sec?.name ?? '—'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Year Level
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {ctx?.yl?.name ?? '—'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Program
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {ctx?.prog?.code ?? '—'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Department
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {ctx?.dept?.code ?? '—'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Enrollment Type
                      </p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 capitalize">
                        {selectedEnrollment.enrollment_type}
                      </span>
                    </div>
                    {selectedEnrollment.courses && selectedEnrollment.courses.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Enrolled Courses ({selectedEnrollment.courses.length})
                        </p>
                        <div className="space-y-1">
                          {selectedEnrollment.courses.map((c) => (
                            <p key={c.id} className="text-xs text-slate-700">
                              <span className="font-mono font-bold">{c.subject.code}</span> —{' '}
                              {c.subject.name} ({c.subject.units}u)
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EnrolledStudents;