// src/pages/Admin/Subjects.tsx
import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Building2,
  FlaskConical,
  Beaker,
  Users,
  Archive,
  Clock,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { mockSubjects } from '../../mocks/subjects';
import type { Subject, SubjectType } from '../../types';

const SUBJECT_TYPES = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'lecture_lab', label: 'Lecture + Lab' },
];

const ROOM_TYPES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'computer_laboratory', label: 'Computer Laboratory' },
  { value: 'science_laboratory', label: 'Science Laboratory' },
  { value: 'lecture_hall', label: 'Lecture Hall' },
  { value: 'auditorium', label: 'Auditorium' },
  { value: 'conference_room', label: 'Conference Room' },
];

const getSubjectTypeLabel = (v: string) =>
  SUBJECT_TYPES.find((t) => t.value === v)?.label || v;

const getSubjectTypeColor = (v: string) => {
  switch (v) {
    case 'laboratory': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'lecture_lab': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }
};

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

const PremiumInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  required?: boolean;
  error?: string;
  helperText?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', icon: Icon, required, error, helperText }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan hover:border-slate-300 transition-all ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
        }`}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
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

interface SubjectForm {
  code: string;
  name: string;
  description: string;
  units: number;
  subjectType: SubjectType;
  requiredHours: number;
  roomTypeRequired: string;
}

const emptyForm: SubjectForm = {
  code: '',
  name: '',
  description: '',
  units: 3,
  subjectType: 'lecture',
  requiredHours: 3,
  roomTypeRequired: 'classroom',
};

export const Subjects: React.FC = () => {
  const { showToast } = useToast();

  const [subjects, setSubjects, resetSubjects] = usePersistentState<Subject[]>(
    'smart_sched_subjects',
    mockSubjects.map((s) => ({ ...s }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<SubjectForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.code.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filterType && s.subject_type !== filterType) return false;
      return true;
    });
  }, [subjects, searchQuery, filterType]);

  const stats = useMemo(() => {
    const active = subjects.filter((s) => s.is_active);
    return {
      total: active.length,
      lecture: active.filter((s) => s.subject_type === 'lecture').length,
      lab: active.filter((s) => s.subject_type === 'laboratory' || s.subject_type === 'lecture_lab').length,
      totalUnits: active.reduce((sum, s) => sum + s.units, 0),
    };
  }, [subjects]);

  const activeFiltersCount = filterType ? 1 : 0;

  const resetFilters = () => {
    setFilterType('');
    setSearchQuery('');
  };

  const handleCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (s: Subject) => {
    setSelectedSubject(s);
    setForm({
      code: s.code,
      name: s.name,
      description: s.description || '',
      units: s.units,
      subjectType: s.subject_type,
      requiredHours: s.required_hours,
      roomTypeRequired: s.room_type_required,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleView = (s: Subject) => {
    setSelectedSubject(s);
    setShowViewModal(true);
  };

  const handleDeleteClick = (s: Subject) => {
    setSelectedSubject(s);
    setShowDeleteModal(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Subject code is required';
    if (!form.name.trim()) e.name = 'Subject name is required';
    if (!form.units || form.units < 1) e.units = 'Units must be at least 1';
    if (!form.requiredHours || form.requiredHours < 1) e.requiredHours = 'Required hours must be at least 1';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      code: form.code.toUpperCase(),
      name: form.name,
      description: form.description,
      units: form.units,
      subject_type: form.subjectType,
      required_hours: form.requiredHours,
      room_type_required: form.roomTypeRequired,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setSubjects((prev) => [...prev, newSubject]);
    showToast('success', 'Subject Created', `${form.code.toUpperCase()} has been added.`);
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleEditSubmit = () => {
    if (!selectedSubject || !validate()) return;
    setIsSubmitting(true);
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === selectedSubject.id
          ? {
              ...s,
              code: form.code.toUpperCase(),
              name: form.name,
              description: form.description,
              units: form.units,
              subject_type: form.subjectType,
              required_hours: form.requiredHours,
              room_type_required: form.roomTypeRequired,
            }
          : s
      )
    );
    showToast('success', 'Subject Updated', `${form.code.toUpperCase()} has been updated.`);
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    setSubjects((prev) =>
      prev.map((s) => (s.id === selectedSubject.id ? { ...s, is_active: false } : s))
    );
    showToast('success', 'Subject Archived', `${selectedSubject.code} has been archived.`);
    setShowDeleteModal(false);
    setIsSubmitting(false);
  };

  const handleRestore = (s: Subject) => {
    setSubjects((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, is_active: true } : x))
    );
    showToast('success', 'Subject Restored', `${s.code} is now active.`);
  };

  const handleReset = () => {
    resetSubjects();
    showToast('info', 'Subjects Reset', 'Restored to default mock data.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Subjects / Courses
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage subjects, units, and requirements
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
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
          <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Add Subject
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Subjects" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="Active subjects" />
        <StatCard icon={BookOpen} label="Lecture Subjects" value={stats.lecture} color="bg-blue-50 text-blue-600" subtitle="Classroom-based" />
        <StatCard icon={Beaker} label="Lab Subjects" value={stats.lab} color="bg-purple-50 text-purple-600" subtitle="Laboratory-based" />
        <StatCard icon={Users} label="Total Units" value={stats.totalUnits} color="bg-emerald-50 text-emerald-600" subtitle="Across all subjects" />
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
                  <h3 className="text-sm font-bold text-slate-900">Filter Subjects</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} match
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

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PremiumDropdown
                label="Subject Type"
                value={filterType}
                onChange={setFilterType}
                options={SUBJECT_TYPES}
                placeholder="All types"
                icon={BookOpen}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                {filteredSubjects.length} of {subjects.length} subjects
              </p>
              <button
                onClick={resetFilters}
                disabled={activeFiltersCount === 0 && !searchQuery}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
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
              placeholder="Search by subject code or name..."
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

        {filteredSubjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No subjects found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters or search term'
                : 'Create your first subject to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Units</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hours</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Room Type</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((s) => {
                  const isArchived = !s.is_active;
                  return (
                    <tr key={s.id} className={`transition-colors ${isArchived ? 'bg-slate-50/70' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isArchived ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'}`}>
                            <BookOpen className={`w-5 h-5 ${isArchived ? 'text-slate-400' : 'text-cyan-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-bold font-mono ${isArchived ? 'text-slate-500' : 'text-slate-900'}`}>{s.code}</p>
                              {isArchived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                  <Archive className="w-2.5 h-2.5" /> ARCHIVED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{s.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getSubjectTypeColor(s.subject_type)}`}>
                          {s.subject_type === 'laboratory' && <Beaker className="w-3 h-3" />}
                          {s.subject_type === 'lecture' && <BookOpen className="w-3 h-3" />}
                          {s.subject_type === 'lecture_lab' && <FlaskConical className="w-3 h-3" />}
                          {getSubjectTypeLabel(s.subject_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{s.units} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{s.required_hours} hrs/wk</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 capitalize">
                          {s.room_type_required.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isArchived ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                            <Archive className="w-3 h-3" /> ARCHIVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" /> ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isArchived ? (
                            <>
                              <button onClick={() => handleRestore(s)} className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all inline-flex items-center gap-1.5 text-xs font-semibold">
                                <RotateCcw className="w-3.5 h-3.5" /> Restore
                              </button>
                              <button onClick={() => handleView(s)} className="p-2 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleView(s)} className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 transition-all" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleEdit(s)} className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteClick(s)} className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all" title="Archive">
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
              <h3 className="text-lg font-bold">Create New Subject</h3>
              <p className="text-xs text-white/70 mt-0.5">Add a subject to the curriculum</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Subject Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="e.g., IT301" required error={formErrors.code} icon={BookOpen} />
            <PremiumInput label="Subject Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g., Data Structures" required error={formErrors.name} />
          </div>

          <PremiumTextarea label="Description (Optional)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Brief description of the subject..." />

          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Units" type="number" value={form.units} onChange={(v) => setForm({ ...form, units: Number(v) })} required error={formErrors.units} icon={Users} />
            <PremiumInput label="Required Hours / Week" type="number" value={form.requiredHours} onChange={(v) => setForm({ ...form, requiredHours: Number(v) })} required error={formErrors.requiredHours} icon={Clock} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PremiumDropdown label="Subject Type" value={form.subjectType} onChange={(v) => setForm({ ...form, subjectType: v as SubjectType })} options={SUBJECT_TYPES} required />
            <PremiumDropdown label="Room Type Required" value={form.roomTypeRequired} onChange={(v) => setForm({ ...form, roomTypeRequired: v })} options={ROOM_TYPES} icon={Building2} required />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleCreateSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Subject
          </button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal && !!selectedSubject} onClose={() => setShowEditModal(false)} maxWidth="max-w-2xl">
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Edit Subject</h3>
              <p className="text-xs text-white/80 mt-0.5">Update {selectedSubject?.code}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Subject Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required error={formErrors.code} icon={BookOpen} />
            <PremiumInput label="Subject Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required error={formErrors.name} />
          </div>
          <PremiumTextarea label="Description (Optional)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Units" type="number" value={form.units} onChange={(v) => setForm({ ...form, units: Number(v) })} required error={formErrors.units} icon={Users} />
            <PremiumInput label="Required Hours / Week" type="number" value={form.requiredHours} onChange={(v) => setForm({ ...form, requiredHours: Number(v) })} required error={formErrors.requiredHours} icon={Clock} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PremiumDropdown label="Subject Type" value={form.subjectType} onChange={(v) => setForm({ ...form, subjectType: v as SubjectType })} options={SUBJECT_TYPES} required />
            <PremiumDropdown label="Room Type Required" value={form.roomTypeRequired} onChange={(v) => setForm({ ...form, roomTypeRequired: v })} options={ROOM_TYPES} icon={Building2} required />
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
      <Modal isOpen={showViewModal && !!selectedSubject} onClose={() => setShowViewModal(false)} maxWidth="max-w-md">
        <div className="relative px-6 py-8 bg-gradient-to-br from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-white min-w-0">
              <h3 className="text-xl font-bold font-mono">{selectedSubject?.code}</h3>
              <p className="text-sm text-white/70 mt-0.5 truncate">{selectedSubject?.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {selectedSubject?.description && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-700">{selectedSubject.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</p>
              <p className="text-sm font-bold text-slate-900">{selectedSubject && getSubjectTypeLabel(selectedSubject.subject_type)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Units</p>
              <p className="text-sm font-bold text-slate-900">{selectedSubject?.units}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Required Hours</p>
              <p className="text-sm font-bold text-slate-900">{selectedSubject?.required_hours} hrs/wk</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Room Type</p>
              <p className="text-sm font-bold text-slate-900 capitalize">{selectedSubject?.room_type_required.replace(/_/g, ' ')}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              {selectedSubject?.is_active ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" /> ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                  <Archive className="w-3 h-3" /> ARCHIVED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => {
              setShowViewModal(false);
              if (selectedSubject) handleEdit(selectedSubject);
            }}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => setShowViewModal(false)} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
            Close
          </button>
        </div>
      </Modal>

      {/* ARCHIVE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedSubject} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Subject?</h3>
          <p className="text-sm text-slate-500 mb-1">Are you sure you want to archive</p>
          <p className="text-sm font-bold text-slate-900 mb-4">{selectedSubject?.code} — {selectedSubject?.name}?</p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
            <p className="font-bold mb-1">⚠️ This will:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Hide the subject from active lists</li>
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
            Archive Subject
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Subjects;