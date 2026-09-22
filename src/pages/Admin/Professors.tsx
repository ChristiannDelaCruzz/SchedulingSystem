// src/pages/Admin/Professors.tsx
import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Archive,
  Mail,
  Briefcase,
  GraduationCap,
  BookOpen,
  Award,
  Copy,
  CheckCircle2,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import {
  mockProfessors,
  mockProfessorQualifications,
} from '../../mocks/professors';
import { mockSubjects } from '../../mocks/subjects';
import type { Professor, ProfessorQualification } from '../../types';

const QUALIFICATION_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const getLevelLabel = (v: string) =>
  QUALIFICATION_LEVELS.find((l) => l.value === v)?.label || v;

const getLevelColor = (v: string) => {
  switch (v) {
    case 'basic': return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'intermediate': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'advanced': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'expert': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
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
  disabled?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', icon: Icon, required, error, helperText, disabled }) => (
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
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan hover:border-slate-300 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-500 ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
        }`}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
  </div>
);

interface ProfessorForm {
  email: string;
  password: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  employeeId: string;
  specialization: string;
  educationalAttainment: string;
  yearsOfExperience: number | undefined;
}

const emptyForm: ProfessorForm = {
  email: '',
  password: '',
  firstName: '',
  middleName: '',
  lastName: '',
  contactNumber: '',
  employeeId: '',
  specialization: '',
  educationalAttainment: '',
  yearsOfExperience: undefined,
};

export const Professors: React.FC = () => {
  const { showToast } = useToast();

  const [professors, setProfessors, resetProfessors] = usePersistentState<Professor[]>(
    'smart_sched_professors',
    mockProfessors.map((p) => ({ ...p }))
  );

  const [qualifications, setQualifications, resetQualifications] = usePersistentState<
    ProfessorQualification[]
  >(
    'smart_sched_qualifications',
    mockProfessorQualifications.map((q) => ({ ...q }))
  );

  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showMasteryModal, setShowMasteryModal] = useState(false);

  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const [form, setForm] = useState<ProfessorForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [showAddQualification, setShowAddQualification] = useState(false);
  const [qualificationForm, setQualificationForm] = useState<{
    subjectId: string;
    level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  }>({
    subjectId: '',
    level: 'intermediate',
  });
  const [qualificationError, setQualificationError] = useState('');

  const getFullName = (p: Professor) =>
    `${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim() || '—';

  const getInitials = (p: Professor) =>
    `${p.profiles?.first_name?.[0] || ''}${p.profiles?.last_name?.[0] || ''}`.toUpperCase();

  const generatePassword = () =>
    `Prof${new Date().getFullYear()}!${Math.floor(1000 + Math.random() * 9000)}`;

  const filteredProfessors = useMemo(() => {
    if (!searchQuery) return professors;
    const q = searchQuery.toLowerCase();
    return professors.filter((p) => {
      const name = getFullName(p).toLowerCase();
      return (
        name.includes(q) ||
        (p.profiles?.email || '').toLowerCase().includes(q) ||
        (p.employee_id || '').toLowerCase().includes(q)
      );
    });
  }, [professors, searchQuery]);

  const stats = useMemo(() => {
    const active = professors.filter((p) => p.is_active);
    const withExp = active.filter((p) => (p.years_of_experience || 0) > 0);
    const avg =
      withExp.length > 0
        ? Math.round(
            withExp.reduce((s, p) => s + (p.years_of_experience || 0), 0) / withExp.length
          )
        : 0;
    return {
      total: active.length,
      withExperience: withExp.length,
      avgExperience: avg,
    };
  }, [professors]);

  const handleCreate = () => {
    setForm({ ...emptyForm, password: generatePassword() });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (p: Professor) => {
    setSelectedProfessor(p);
    setForm({
      email: p.profiles?.email || '',
      password: '',
      firstName: p.profiles?.first_name || '',
      middleName: p.profiles?.middle_name || '',
      lastName: p.profiles?.last_name || '',
      contactNumber: p.profiles?.contact_number || '',
      employeeId: p.employee_id || '',
      specialization: p.specialization || '',
      educationalAttainment: p.educational_attainment || '',
      yearsOfExperience: p.years_of_experience,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleView = (p: Professor) => {
    setSelectedProfessor(p);
    setShowViewModal(true);
  };

  const handleDeleteClick = (p: Professor) => {
    setSelectedProfessor(p);
    setShowDeleteModal(true);
  };

  const handleManageQualifications = (p: Professor) => {
    setSelectedProfessor(p);
    setShowMasteryModal(true);
    setShowAddQualification(false);
    setQualificationForm({ subjectId: '', level: 'intermediate' });
    setQualificationError('');
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (showCreateModal) {
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
      if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    }
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const newProfessor: Professor = {
      id: `prof-${Date.now()}`,
      user_id: `u-${Date.now()}`,
      employee_id: form.employeeId,
      specialization: form.specialization,
      educational_attainment: form.educationalAttainment,
      years_of_experience: form.yearsOfExperience,
      is_active: true,
      created_at: new Date().toISOString(),
      profiles: {
        id: `u-${Date.now()}`,
        email: form.email,
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
        contact_number: form.contactNumber,
      },
    };

    setProfessors((prev) => [...prev, newProfessor]);
    setCreatedCredentials({ email: form.email, password: form.password });
    setShowCreateModal(false);
    setShowCredentialsModal(true);
    showToast('success', 'Professor Created', `${form.firstName} ${form.lastName} added.`);
    setIsSubmitting(false);
  };

  const handleEditSubmit = () => {
    if (!selectedProfessor || !validate()) return;
    setIsSubmitting(true);

    setProfessors((prev) =>
      prev.map((p) =>
        p.id === selectedProfessor.id
          ? {
              ...p,
              employee_id: form.employeeId,
              specialization: form.specialization,
              educational_attainment: form.educationalAttainment,
              years_of_experience: form.yearsOfExperience,
              profiles: p.profiles
                ? {
                    ...p.profiles,
                    first_name: form.firstName,
                    middle_name: form.middleName,
                    last_name: form.lastName,
                    contact_number: form.contactNumber,
                  }
                : undefined,
            }
          : p
      )
    );

    showToast('success', 'Professor Updated', 'Changes saved.');
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedProfessor) return;
    setIsSubmitting(true);
    setProfessors((prev) =>
      prev.map((p) => (p.id === selectedProfessor.id ? { ...p, is_active: false } : p))
    );
    showToast('success', 'Professor Archived', 'Professor has been archived.');
    setShowDeleteModal(false);
    setIsSubmitting(false);
  };

  const handleRestore = (p: Professor) => {
    setProfessors((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_active: true } : x))
    );
    showToast('success', 'Professor Restored', 'Professor is now active.');
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    navigator.clipboard.writeText(
      `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
    );
    showToast('success', 'Copied', 'Credentials copied to clipboard.');
  };

  const currentProfessorQuals = useMemo(
    () =>
      selectedProfessor
        ? qualifications.filter((q) => q.professor_id === selectedProfessor.id)
        : [],
    [qualifications, selectedProfessor]
  );

  const availableSubjects = useMemo(() => {
    const usedIds = new Set(currentProfessorQuals.map((q) => q.subject_id));
    return mockSubjects
      .filter((s) => s.is_active && !usedIds.has(s.id))
      .map((s) => ({
        value: s.id,
        label: s.name,
        sublabel: `${s.code} · ${s.units} units`,
      }));
  }, [currentProfessorQuals]);

  const handleAddQualification = () => {
    if (!selectedProfessor || !qualificationForm.subjectId) {
      setQualificationError('Please select a subject');
      return;
    }
    setIsSubmitting(true);

    const newQual: ProfessorQualification = {
      id: `pq-${Date.now()}`,
      professor_id: selectedProfessor.id,
      subject_id: qualificationForm.subjectId,
      qualification_level: qualificationForm.level,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setQualifications((prev) => [...prev, newQual]);
    showToast('success', 'Qualification Added', 'Mastery added successfully.');
    setShowAddQualification(false);
    setQualificationForm({ subjectId: '', level: 'intermediate' });
    setQualificationError('');
    setIsSubmitting(false);
  };

  const handleRemoveQualification = (qualId: string) => {
    setQualifications((prev) => prev.filter((q) => q.id !== qualId));
    showToast('success', 'Qualification Removed', 'Mastery removed.');
  };

  const handleReset = () => {
    resetProfessors();
    resetQualifications();
    showToast('info', 'Professors Reset', 'Restored to default mock data.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Professors</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage professor accounts, qualifications, and assignments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button onClick={handleCreate} leftIcon={<UserPlus className="w-4 h-4" />}>
            Add Professor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Professors" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="Active faculty" />
        <StatCard icon={Briefcase} label="With Experience" value={stats.withExperience} color="bg-blue-50 text-blue-600" subtitle="Have prior teaching" />
        <StatCard icon={GraduationCap} label="Avg Experience" value={`${stats.avgExperience} yrs`} color="bg-purple-50 text-purple-600" subtitle="Across faculty" />
        <StatCard icon={Award} label="Mastery Manager" value="—" color="bg-amber-50 text-amber-600" subtitle="Per professor" />
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or employee ID..."
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

        {filteredProfessors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No professors found</p>
            <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Professor</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfessors.map((p) => {
                  const isArchived = !p.is_active;
                  return (
                    <tr key={p.id} className={`transition-colors ${isArchived ? 'bg-slate-50/70' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isArchived ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 'bg-gradient-to-br from-navy to-cyan'}`}>
                            {getInitials(p)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-bold ${isArchived ? 'text-slate-500' : 'text-slate-900'}`}>{getFullName(p)}</p>
                              {isArchived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                  <Archive className="w-2.5 h-2.5" /> ARCHIVED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{p.profiles?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Briefcase className="w-4 h-4 text-cyan-500" />
                          <span className="font-mono font-medium">{p.employee_id || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">
                          <p className="font-medium truncate max-w-[200px]">{p.specialization || '—'}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{p.educational_attainment || 'No degree info'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.years_of_experience != null ? (
                          <span className="text-sm text-slate-700">{p.years_of_experience} yr{p.years_of_experience !== 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
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
                              <button onClick={() => handleRestore(p)} className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all inline-flex items-center gap-1.5 text-xs font-semibold">
                                <RotateCcw className="w-3.5 h-3.5" /> Restore
                              </button>
                              <button onClick={() => handleView(p)} className="p-2 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-all" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleManageQualifications(p)} className="px-3 py-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 transition-all inline-flex items-center gap-1.5 text-xs font-semibold" title="Manage Mastery">
                                <Award className="w-3.5 h-3.5" /> Mastery
                              </button>
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
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Add New Professor</h3>
              <p className="text-xs text-white/70 mt-0.5">Creates a login account + professor record</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="First Name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} placeholder="e.g., Juan" required error={formErrors.firstName} icon={Users} />
            <PremiumInput label="Last Name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} placeholder="e.g., Dela Cruz" required error={formErrors.lastName} />
          </div>

          <PremiumInput label="Middle Name (Optional)" value={form.middleName} onChange={(v) => setForm({ ...form, middleName: v })} />

          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Email Address" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="professor@school.edu" required error={formErrors.email} icon={Mail} />
            <PremiumInput label="Employee ID" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} placeholder="e.g., EMP-2026-001" required error={formErrors.employeeId} icon={Briefcase} />
          </div>

          <PremiumInput label="Contact Number (Optional)" value={form.contactNumber} onChange={(v) => setForm({ ...form, contactNumber: v })} placeholder="e.g., +63 912 345 6789" />
          <PremiumInput label="Specialization (Optional)" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} placeholder="e.g., Software Engineering" icon={BookOpen} />
          <PremiumInput label="Educational Attainment (Optional)" value={form.educationalAttainment} onChange={(v) => setForm({ ...form, educationalAttainment: v })} placeholder="e.g., Master of Science in IT" icon={GraduationCap} />
          <PremiumInput label="Years of Experience (Optional)" type="number" value={form.yearsOfExperience ?? ''} onChange={(v) => setForm({ ...form, yearsOfExperience: v ? Number(v) : undefined })} placeholder="e.g., 5" />

          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
            <div className="flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-cyan-800 mb-1">Auto-generated Password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-cyan-200 rounded-lg text-xs font-mono text-slate-800">{form.password}</code>
                  <button type="button" onClick={() => setForm({ ...form, password: generatePassword() })} className="p-2 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors" title="Regenerate">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                {formErrors.password && <p className="mt-1.5 text-xs text-red-600">{formErrors.password}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleCreateSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Professor
          </button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal && !!selectedProfessor} onClose={() => setShowEditModal(false)} maxWidth="max-w-2xl">
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Edit Professor</h3>
              <p className="text-xs text-white/80 mt-0.5">{selectedProfessor && getFullName(selectedProfessor)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="First Name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} required error={formErrors.firstName} />
            <PremiumInput label="Last Name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} required error={formErrors.lastName} />
          </div>
          <PremiumInput label="Middle Name (Optional)" value={form.middleName} onChange={(v) => setForm({ ...form, middleName: v })} />
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Email" value={form.email} onChange={() => {}} disabled helperText="Email cannot be changed" icon={Mail} />
            <PremiumInput label="Employee ID" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} required error={formErrors.employeeId} icon={Briefcase} />
          </div>
          <PremiumInput label="Contact Number (Optional)" value={form.contactNumber} onChange={(v) => setForm({ ...form, contactNumber: v })} />
          <PremiumInput label="Specialization (Optional)" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} icon={BookOpen} />
          <PremiumInput label="Educational Attainment (Optional)" value={form.educationalAttainment} onChange={(v) => setForm({ ...form, educationalAttainment: v })} icon={GraduationCap} />
          <PremiumInput label="Years of Experience (Optional)" type="number" value={form.yearsOfExperience ?? ''} onChange={(v) => setForm({ ...form, yearsOfExperience: v ? Number(v) : undefined })} />
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
      <Modal isOpen={showViewModal && !!selectedProfessor} onClose={() => setShowViewModal(false)} maxWidth="max-w-md">
        <div className="relative px-6 py-8 bg-gradient-to-br from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 text-white text-xl font-bold">
              {selectedProfessor && getInitials(selectedProfessor)}
            </div>
            <div className="text-white min-w-0">
              <h3 className="text-xl font-bold truncate">{selectedProfessor && getFullName(selectedProfessor)}</h3>
              <p className="text-sm text-white/70 mt-0.5 font-mono">{selectedProfessor?.employee_id}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-bold text-slate-900 truncate">{selectedProfessor?.profiles?.email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Specialization</p>
              <p className="text-sm font-bold text-slate-900">{selectedProfessor?.specialization || '—'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Experience</p>
              <p className="text-sm font-bold text-slate-900">
                {selectedProfessor?.years_of_experience ?? '—'}
                {selectedProfessor?.years_of_experience != null ? ' years' : ''}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Educational Attainment</p>
              <p className="text-sm font-bold text-slate-900">{selectedProfessor?.educational_attainment || '—'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              {selectedProfessor?.is_active ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" /> ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                  <Archive className="w-3 h-3" /> ARCHIVED
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-500" /> Mastery
                </p>
                {selectedProfessor && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                    {qualifications.filter((q) => q.professor_id === selectedProfessor.id).length}
                  </span>
                )}
              </div>
              {selectedProfessor && qualifications.filter((q) => q.professor_id === selectedProfessor.id).length === 0 ? (
                <div className="py-4 text-center bg-white border border-dashed border-slate-200 rounded-lg">
                  <Award className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">No mastery assigned yet</p>
                </div>
              ) : (
                selectedProfessor && (
                  <div className="space-y-1.5">
                    {qualifications
                      .filter((q) => q.professor_id === selectedProfessor.id)
                      .map((q) => {
                        const subj = mockSubjects.find((s) => s.id === q.subject_id);
                        return (
                          <div key={q.id} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {subj?.code} — {subj?.name}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded-full text-[9px] font-bold border ${getLevelColor(q.qualification_level)}`}>
                                {getLevelLabel(q.qualification_level)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          {selectedProfessor?.is_active && (
            <button
              onClick={() => {
                setShowViewModal(false);
                if (selectedProfessor) handleManageQualifications(selectedProfessor);
              }}
              className="flex-1 py-3 bg-white border-2 border-purple-200 text-purple-700 text-sm font-semibold rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" /> Mastery
            </button>
          )}
          <button onClick={() => setShowViewModal(false)} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
            Close
          </button>
        </div>
      </Modal>

      {/* MASTERY MODAL */}
      <Modal isOpen={showMasteryModal && !!selectedProfessor} onClose={() => setShowMasteryModal(false)} maxWidth="max-w-2xl">
        <div className="relative px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Professor Mastery</h3>
              <p className="text-xs text-white/80 mt-0.5">{selectedProfessor && getFullName(selectedProfessor)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentProfessorQuals.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No mastery assigned yet</p>
              <p className="text-xs text-slate-400 mt-1">Add subjects this professor is qualified to teach.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentProfessorQuals.map((q) => {
                const subj = mockSubjects.find((s) => s.id === q.subject_id);
                return (
                  <div key={q.id} className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{subj?.code} — {subj?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getLevelColor(q.qualification_level)}`}>
                          {getLevelLabel(q.qualification_level)}
                        </span>
                        <span className="text-xs text-slate-400">{subj?.units} units</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveQualification(q.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!showAddQualification ? (
            <button
              onClick={() => setShowAddQualification(true)}
              className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Mastery
            </button>
          ) : (
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-purple-900">Add New Mastery</p>
                <button
                  onClick={() => {
                    setShowAddQualification(false);
                    setQualificationError('');
                    setQualificationForm({ subjectId: '', level: 'intermediate' });
                  }}
                  className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <PremiumDropdown
                label="Subject"
                value={qualificationForm.subjectId}
                onChange={(v) => {
                  setQualificationForm({ ...qualificationForm, subjectId: v });
                  setQualificationError('');
                }}
                options={availableSubjects}
                placeholder={availableSubjects.length === 0 ? 'All subjects already added' : 'Select a subject'}
                icon={BookOpen}
                searchable
                error={qualificationError}
                disabled={availableSubjects.length === 0}
              />

              <PremiumDropdown
                label="Qualification Level"
                value={qualificationForm.level}
                onChange={(v) =>
                  setQualificationForm({
                    ...qualificationForm,
                    level: v as 'basic' | 'intermediate' | 'advanced' | 'expert',
                  })
                }
                options={QUALIFICATION_LEVELS}
                required
              />

              <button
                onClick={handleAddQualification}
                disabled={isSubmitting || !qualificationForm.subjectId}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Add Mastery
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => setShowMasteryModal(false)}
            className="w-full py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* ARCHIVE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedProfessor} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Professor?</h3>
          <p className="text-sm text-slate-500 mb-1">Are you sure you want to archive</p>
          <p className="text-sm font-bold text-slate-900 mb-4">
            {selectedProfessor && getFullName(selectedProfessor)}?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
            <p className="font-bold mb-1">⚠️ This will:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Hide the professor from active lists</li>
              <li>Preserve historical schedules</li>
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
            Archive Professor
          </button>
        </div>
      </Modal>

      {/* CREDENTIALS MODAL */}
      <Modal isOpen={showCredentialsModal && !!createdCredentials} onClose={() => setShowCredentialsModal(false)} maxWidth="max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Professor Account Created</h3>
          <p className="text-sm text-slate-500 mb-4">Share these credentials with the professor.</p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left mb-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">📧 Email</p>
            <p className="text-sm font-mono text-slate-900 break-all mb-3">{createdCredentials?.email}</p>
            <p className="text-xs font-semibold text-slate-500 mb-1">🔑 Password</p>
            <code className="inline-block bg-navy text-cyan-300 px-3 py-1.5 rounded-lg text-sm font-bold font-mono">
              {createdCredentials?.password}
            </code>
          </div>

          <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-800 text-left">
            ⚠️ Save this information. The password cannot be retrieved later.
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleCopyCredentials} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button onClick={() => setShowCredentialsModal(false)} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Professors;