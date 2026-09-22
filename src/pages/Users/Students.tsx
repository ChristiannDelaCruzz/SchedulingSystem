// src/pages/Users/Students.tsx
import React, { useMemo, useState } from 'react';
import {
  Users,
  Search,
  GraduationCap,
  Building2,
  Mail,
  X,
  Eye,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
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
export const Students: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selected, setSelected] = useState<(typeof mockEnrollments)[number] | null>(null);

  const getContext = (sectionId: string) => {
    const sec = mockSections.find((s) => s.id === sectionId);
    if (!sec) return null;
    const yl = mockYearLevels.find((y) => y.id === sec.year_level_id);
    const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
    const dept = prog ? mockDepartments.find((d) => d.id === prog.department_id) : null;
    return { sec, yl, prog, dept };
  };

  const filtered = useMemo(() => {
    return mockEnrollments.filter((e) => {
      if (filterDepartmentId) {
        const ctx = getContext(e.section_id);
        if (!ctx?.dept || ctx.dept.id !== filterDepartmentId) return false;
      }
      if (filterStatus && e.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = `${e.student?.first_name ?? ''} ${e.student?.last_name ?? ''}`.toLowerCase();
        const email = (e.student?.email ?? '').toLowerCase();
        const appNum = e.application_number.toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !appNum.includes(q)) return false;
      }
      return true;
    });
  }, [filterDepartmentId, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = mockEnrollments.length;
    const approved = mockEnrollments.filter((e) => e.status === 'approved').length;
    const pending = mockEnrollments.filter(
      (e) => e.status === 'submitted' || e.status === 'under_review'
    ).length;
    const rejected = mockEnrollments.filter((e) => e.status === 'rejected').length;
    return { total, approved, pending, rejected };
  }, []);

  const activeFiltersCount = (filterDepartmentId ? 1 : 0) + (filterStatus ? 1 : 0);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      under_review: 'bg-amber-50 text-amber-700 border-amber-200',
      submitted: 'bg-blue-50 text-blue-700 border-blue-200',
      needs_correction: 'bg-orange-50 text-orange-700 border-orange-200',
      draft: 'bg-slate-100 text-slate-600 border-slate-200',
      cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return map[status] ?? map.draft;
  };

  const getStatusLabel = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Students
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          All student records from enrollment applications
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Records" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="All student records" />
        <StatCard icon={GraduationCap} label="Enrolled" value={stats.approved} color="bg-emerald-50 text-emerald-600" subtitle="Approved" />
        <StatCard icon={GraduationCap} label="Pending" value={stats.pending} color="bg-amber-50 text-amber-600" subtitle="Under review" />
        <StatCard icon={X} label="Rejected" value={stats.rejected} color="bg-red-50 text-red-600" subtitle="Not approved" />
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
                placeholder="Search by name, email, or application #..."
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
                { value: 'submitted', label: 'Submitted' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'needs_correction', label: 'Needs Correction' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              placeholder="All statuses"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No students found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'No enrollment records yet'}
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
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const ctx = getContext(s.section_id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {s.student?.first_name?.[0] ?? ''}
                            {s.student?.last_name?.[0] ?? ''}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {s.student?.first_name} {s.student?.last_name}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              {s.application_number}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {s.student?.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {ctx?.sec?.name ?? '—'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ctx?.prog?.code ?? ''} · {ctx?.yl?.name ?? ''}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                            s.status
                          )}`}
                        >
                          {getStatusLabel(s.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelected(s);
                            setShowDetailModal(true);
                          }}
                          className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 transition-all"
                          title="View"
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
        isOpen={showDetailModal && !!selected}
        onClose={() => setShowDetailModal(false)}
        maxWidth="max-w-md"
      >
        {selected && (
          <>
            <div className="relative px-6 py-6 bg-gradient-to-br from-navy to-navy-dark">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 text-white text-xl font-bold">
                  {selected.student?.first_name?.[0] ?? ''}
                  {selected.student?.last_name?.[0] ?? ''}
                </div>
                <div className="text-white min-w-0">
                  <h3 className="text-lg font-bold truncate">
                    {selected.student?.first_name} {selected.student?.last_name}
                  </h3>
                  <p className="text-xs text-white/70 font-mono mt-0.5">
                    {selected.application_number}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {(() => {
                const ctx = getContext(selected.section_id);
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="text-sm font-medium text-slate-900 break-all">
                        {selected.student?.email}
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
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                          selected.status
                        )}`}
                      >
                        {getStatusLabel(selected.status)}
                      </span>
                    </div>
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

export default Students;