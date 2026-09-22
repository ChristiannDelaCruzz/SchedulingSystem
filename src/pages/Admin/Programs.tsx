// src/pages/Admin/Programs.tsx
import React, { useMemo, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Archive,
  Building2,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import { mockPrograms } from '../../mocks/programs';
import { mockDepartments } from '../../mocks/departments';
import { mockYearLevels } from '../../mocks/yearLevels';
import type { Program } from '../../types';

const EDUCATION_LEVELS = [
  { value: 'college', label: 'College' },
  { value: 'shs', label: 'Senior High School' },
  { value: 'jhs', label: 'Junior High School' },
  { value: 'elementary', label: 'Elementary' },
];

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
}> = ({ icon: Icon, label, value, color, subtitle }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-3`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

const PremiumInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
}> = ({ label, value, onChange, placeholder, required, error, icon: Icon }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan hover:border-slate-300 transition-all ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
        }`}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

const PremiumTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan hover:border-slate-300 transition-all resize-none"
    />
  </div>
);

interface ProgramForm {
  departmentId: string;
  name: string;
  code: string;
  description: string;
  educationLevel: 'college' | 'shs' | 'jhs' | 'elementary';
  status: 'active' | 'inactive' | 'archived';
}

const emptyForm: ProgramForm = {
  departmentId: '',
  name: '',
  code: '',
  description: '',
  educationLevel: 'college',
  status: 'active',
};

export const Programs: React.FC = () => {
  const { showToast } = useToast();
  const [programs, setPrograms, resetPrograms] = usePersistentState<Program[]>(
    'smart_sched_programs',
    mockPrograms.map((p) => ({ ...p }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ProgramForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.code.toLowerCase().includes(q)
        )
          return false;
      }
      if (filterDepartmentId && p.department_id !== filterDepartmentId) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    });
  }, [programs, searchQuery, filterDepartmentId, filterStatus]);

  const stats = useMemo(() => {
    const active = programs.filter((p) => p.status === 'active');
    return {
      total: programs.length,
      active: active.length,
      departments: new Set(programs.map((p) => p.department_id)).size,
      archived: programs.filter((p) => p.status === 'archived').length,
    };
  }, [programs]);

  const handleCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (p: Program) => {
    setSelectedProgram(p);
    setForm({
      departmentId: p.department_id,
      name: p.name,
      code: p.code,
      description: p.description || '',
      educationLevel: p.education_level,
      status: p.status,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleView = (p: Program) => {
    setSelectedProgram(p);
    setShowViewModal(true);
  };

  const handleDeleteClick = (p: Program) => {
    setSelectedProgram(p);
    setShowDeleteModal(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.departmentId) e.departmentId = 'Department is required';
    if (!form.name.trim()) e.name = 'Program name is required';
    if (!form.code.trim()) e.code = 'Program code is required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const newProgram: Program = {
      id: `prog-${Date.now()}`,
      department_id: form.departmentId,
      name: form.name,
      code: form.code.toUpperCase(),
      description: form.description,
      education_level: form.educationLevel,
      status: form.status,
      createdAt: new Date().toISOString(),
    };
    setPrograms((prev) => [...prev, newProgram]);
    showToast('success', 'Program Created', `${form.code.toUpperCase()} has been added.`);
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleEditSubmit = () => {
    if (!selectedProgram || !validate()) return;
    setIsSubmitting(true);
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === selectedProgram.id
          ? {
              ...p,
              department_id: form.departmentId,
              name: form.name,
              code: form.code.toUpperCase(),
              description: form.description,
              education_level: form.educationLevel,
              status: form.status,
            }
          : p
      )
    );
    showToast('success', 'Program Updated', `${form.code.toUpperCase()} has been updated.`);
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedProgram) return;
    setIsSubmitting(true);
    setPrograms((prev) =>
      prev.map((p) => (p.id === selectedProgram.id ? { ...p, status: 'archived' as const } : p))
    );
    showToast('success', 'Program Archived', `${selectedProgram.code} has been archived.`);
    setShowDeleteModal(false);
    setIsSubmitting(false);
  };

  const handleRestore = (p: Program) => {
    setPrograms((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, status: 'active' as const } : x))
    );
    showToast('success', 'Program Restored', `${p.code} is now active.`);
  };

  const handleReset = () => {
    resetPrograms();
    showToast('info', 'Programs Reset', 'Restored to default mock data.');
  };

  const getDepartment = (id: string) => mockDepartments.find((d) => d.id === id);
  const getYearLevelCount = (programId: string) =>
    mockYearLevels.filter((y) => y.program_id === programId).length;

  const activeFiltersCount = (filterDepartmentId ? 1 : 0) + (filterStatus ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Programs</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage academic programs offered by each department
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Add Program
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Total Programs" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="All programs" />
        <StatCard icon={GraduationCap} label="Active" value={stats.active} color="bg-emerald-50 text-emerald-600" subtitle="Currently offered" />
        <StatCard icon={Building2} label="Departments" value={stats.departments} color="bg-blue-50 text-blue-600" subtitle="Offering programs" />
        <StatCard icon={Archive} label="Archived" value={stats.archived} color="bg-slate-50 text-slate-600" subtitle="No longer offered" />
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
                placeholder="Search programs..."
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
              options={[{ value: '', label: 'All statuses' }, ...STATUSES]}
              placeholder="All statuses"
            />
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No programs found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'Create your first program'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Program</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Education Level</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Year Levels</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.map((p) => {
                  const dept = getDepartment(p.department_id);
                  const isArchived = p.status === 'archived';
                  return (
                    <tr key={p.id} className={`transition-colors ${isArchived ? 'bg-slate-50/70' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isArchived ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'}`}>
                            <GraduationCap className={`w-5 h-5 ${isArchived ? 'text-slate-400' : 'text-cyan-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-bold font-mono ${isArchived ? 'text-slate-500' : 'text-slate-900'}`}>{p.code}</p>
                              {isArchived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                  <Archive className="w-2.5 h-2.5" /> ARCHIVED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">{p.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{dept?.code || '—'}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{dept?.name || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-700 capitalize">
                          {p.education_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                          {getYearLevelCount(p.id)} levels
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isArchived ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                            <Archive className="w-3 h-3" /> ARCHIVED
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              p.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {p.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isArchived ? (
                            <>
                              <button onClick={() => handleRestore(p)} className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all inline-flex items-center gap-1.5 text-xs font-semibold">
                                <RotateCcw className="w-3.5 h-3.5" /> Restore
                              </button>
                              <button onClick={() => handleView(p)} className="p-2 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleView(p)} className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 transition-all" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleEdit(p)} className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteClick(p)} className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all" title="Archive">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CREATE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="max-w-2xl">
        <div className="relative px-6 py-5 bg-gradient-to-r from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Create New Program</h3>
              <p className="text-xs text-white/70 mt-0.5">Add a program under a department</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <PremiumDropdown
            label="Department"
            value={form.departmentId}
            onChange={(v) => setForm({ ...form, departmentId: v })}
            options={mockDepartments.map((d) => ({ value: d.id, label: d.name, sublabel: d.code }))}
            placeholder="Select department"
            icon={Building2}
            required
            error={formErrors.departmentId}
            searchable
          />
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Program Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g., BS Information Technology" required error={formErrors.name} icon={GraduationCap} />
            <PremiumInput label="Program Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="e.g., BSIT" required error={formErrors.code} />
          </div>
          <PremiumTextarea label="Description (Optional)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Brief description..." />
          <div className="grid grid-cols-2 gap-4">
            <PremiumDropdown label="Education Level" value={form.educationLevel} onChange={(v) => setForm({ ...form, educationLevel: v as ProgramForm['educationLevel'] })} options={EDUCATION_LEVELS} required />
            <PremiumDropdown label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v as ProgramForm['status'] })} options={STATUSES} required />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleCreateSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Program
          </button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal && !!selectedProgram} onClose={() => setShowEditModal(false)} maxWidth="max-w-2xl">
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Edit Program</h3>
              <p className="text-xs text-white/80 mt-0.5">Update {selectedProgram?.code}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <PremiumDropdown label="Department" value={form.departmentId} onChange={(v) => setForm({ ...form, departmentId: v })} options={mockDepartments.map((d) => ({ value: d.id, label: d.name, sublabel: d.code }))} required icon={Building2} searchable />
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Program Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required error={formErrors.name} />
            <PremiumInput label="Program Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required error={formErrors.code} />
          </div>
          <PremiumTextarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="grid grid-cols-2 gap-4">
            <PremiumDropdown label="Education Level" value={form.educationLevel} onChange={(v) => setForm({ ...form, educationLevel: v as ProgramForm['educationLevel'] })} options={EDUCATION_LEVELS} required />
            <PremiumDropdown label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v as ProgramForm['status'] })} options={STATUSES} required />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleEditSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </Modal>

      {/* VIEW MODAL */}
      <Modal isOpen={showViewModal && !!selectedProgram} onClose={() => setShowViewModal(false)} maxWidth="max-w-md">
        <div className="relative px-6 py-8 bg-gradient-to-br from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="text-white min-w-0">
              <h3 className="text-xl font-bold font-mono">{selectedProgram?.code}</h3>
              <p className="text-sm text-white/70 mt-0.5 truncate">{selectedProgram?.name}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {selectedProgram?.description && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-700">{selectedProgram.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</p>
              <p className="text-sm font-bold text-slate-900">{getDepartment(selectedProgram?.department_id || '')?.name || '—'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Education Level</p>
              <p className="text-sm font-bold text-slate-900 capitalize">{selectedProgram?.education_level}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Year Levels</p>
              <p className="text-sm font-bold text-slate-900">{getYearLevelCount(selectedProgram?.id || '')}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowViewModal(false)} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
            Close
          </button>
        </div>
      </Modal>

      {/* ARCHIVE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedProgram} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Program?</h3>
          <p className="text-sm text-slate-500 mb-1">Are you sure you want to archive</p>
          <p className="text-sm font-bold text-slate-900 mb-4">{selectedProgram?.code} — {selectedProgram?.name}?</p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
            <p className="font-bold mb-1">⚠️ This will:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Hide the program from new enrollment</li>
              <li>Preserve historical data</li>
              <li>Allow restoring anytime</li>
            </ul>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            Archive Program
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Programs;