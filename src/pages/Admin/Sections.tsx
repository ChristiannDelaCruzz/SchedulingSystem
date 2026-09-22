// src/pages/Admin/Sections.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  X,
  Check,
  Building2,
  BookOpen,
  Save,
  RotateCcw,
  Calendar,
  MapPin,
  AlertTriangle,
  Loader2,
  Archive,
  DoorOpen,
  Star,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { mockSections } from '../../mocks/sections';
import { mockDepartments } from '../../mocks/departments';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockRooms } from '../../mocks/rooms';
import type { Section, Room } from '../../types';

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];
const SEMESTERS = [
  { value: 1, label: '1st Semester' },
  { value: 2, label: '2nd Semester' },
];

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

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
}> = ({ icon: Icon, label, value, color, subtitle, trend }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          <TrendingUp className={`w-3 h-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
          {trend.value}
        </span>
      )}
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

const RoomConfiguration: React.FC<{
  rooms: Room[];
  eligibleRooms: string[];
  preferredRooms: string[];
  onAddRoom: (id: string) => void;
  onRemoveRoom: (id: string) => void;
  onTogglePreferred: (id: string) => void;
}> = ({ rooms, eligibleRooms, preferredRooms, onAddRoom, onRemoveRoom, onTogglePreferred }) => {
  const availableRooms = rooms
    .filter((r) => r.is_active && !eligibleRooms.includes(r.id))
    .map((r) => ({
      value: r.id,
      label: `${r.room_number} — ${getRoomTypeLabel(r.room_type)}`,
      sublabel: `${r.building}${r.floor ? ` · Floor ${r.floor}` : ''} · ${r.capacity} seats`,
    }));

  const selectedRooms = eligibleRooms
    .map((id) => rooms.find((r) => r.id === id))
    .filter(Boolean) as Room[];

  return (
    <div className="pt-2 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
          <DoorOpen className="w-4 h-4 text-cyan-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Room Configuration</p>
          <p className="text-xs text-slate-500">Rooms this section may use</p>
        </div>
      </div>

      <div className="mb-3">
        <PremiumDropdown
          label="Add Eligible Room"
          value=""
          onChange={(v) => {
            if (v) onAddRoom(v);
          }}
          options={availableRooms}
          placeholder={availableRooms.length === 0 ? 'All rooms already added' : 'Select a room to add...'}
          icon={Plus}
          searchable
          disabled={availableRooms.length === 0}
          helperText={
            availableRooms.length === 0
              ? 'No more active rooms available'
              : `${availableRooms.length} room${availableRooms.length !== 1 ? 's' : ''} available`
          }
        />
      </div>

      {selectedRooms.length === 0 ? (
        <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
          <DoorOpen className="w-6 h-6 text-slate-300 mx-auto mb-1" />
          <p className="text-xs text-slate-500">
            No rooms assigned yet. The section can still be scheduled without room restrictions.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {selectedRooms.map((room) => {
            const isPreferred = preferredRooms.includes(room.id);
            return (
              <div
                key={room.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  isPreferred ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${isPreferred ? 'bg-amber-100 border-amber-200' : 'bg-cyan-50 border-cyan-200'}`}>
                  <DoorOpen className={`w-4 h-4 ${isPreferred ? 'text-amber-600' : 'text-cyan-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{room.room_number}</p>
                    {isPreferred && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        PREFERRED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {room.building}
                    {room.floor ? ` · Floor ${room.floor}` : ''} · {getRoomTypeLabel(room.room_type)} · {room.capacity} seats
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePreferred(room.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    isPreferred
                      ? 'bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-amber-500'
                  }`}
                  title={isPreferred ? 'Remove from preferred' : 'Mark as preferred'}
                >
                  <Star className={`w-4 h-4 ${isPreferred ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveRoom(room.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 leading-relaxed">
          <span className="font-semibold">ℹ️ Note:</span> Eligible rooms are{' '}
          <span className="font-semibold">not permanently reserved</span> for this section.
          The scheduler will pick the best room based on availability, capacity, and room type.
        </p>
      </div>
    </div>
  );
};

interface SectionForm {
  yearLevelId: string;
  name: string;
  code: string;
  maxCapacity: number;
  academicYear: string;
  semester: 1 | 2;
  eligibleRooms: string[];
  preferredRooms: string[];
}

const emptyForm: SectionForm = {
  yearLevelId: '',
  name: '',
  code: '',
  maxCapacity: 45,
  academicYear: '2026-2027',
  semester: 1,
  eligibleRooms: [],
  preferredRooms: [],
};

export const Sections: React.FC = () => {
  const { showToast } = useToast();

  const [sections, setSections, resetSections] = usePersistentState<Section[]>(
    'smart_sched_sections',
    mockSections.map((s) => ({ ...s }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartmentId, setFilterDepartmentId] = useState('');
  const [filterProgramId, setFilterProgramId] = useState('');
  const [filterYearLevelId, setFilterYearLevelId] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<SectionForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalDepartmentId, setModalDepartmentId] = useState('');
  const [modalProgramId, setModalProgramId] = useState('');

  const getYearLevel = (id: string) => mockYearLevels.find((y) => y.id === id);
  const getProgram = (id: string) => mockPrograms.find((p) => p.id === id);
  const getDepartment = (id: string) => mockDepartments.find((d) => d.id === id);

  const filterPrograms = useMemo(() => {
    if (!filterDepartmentId) return mockPrograms;
    return mockPrograms.filter((p) => p.department_id === filterDepartmentId);
  }, [filterDepartmentId]);

  const filterYearLevels = useMemo(() => {
    if (!filterProgramId) return mockYearLevels;
    return mockYearLevels.filter((y) => y.program_id === filterProgramId);
  }, [filterProgramId]);

  const modalPrograms = useMemo(() => {
    if (!modalDepartmentId) return [];
    return mockPrograms.filter((p) => p.department_id === modalDepartmentId);
  }, [modalDepartmentId]);

  const modalYearLevels = useMemo(() => {
    if (!modalProgramId) return [];
    return mockYearLevels.filter((y) => y.program_id === modalProgramId);
  }, [modalProgramId]);

  useEffect(() => {
    setModalProgramId('');
    setForm((f) => ({ ...f, yearLevelId: '' }));
  }, [modalDepartmentId]);

  useEffect(() => {
    setForm((f) => ({ ...f, yearLevelId: '' }));
  }, [modalProgramId]);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const yl = getYearLevel(s.year_level_id);
        const prog = yl ? getProgram(yl.program_id) : null;
        const dept = prog ? getDepartment(prog.department_id) : null;
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (yl?.name || '').toLowerCase().includes(q) ||
          (prog?.code || '').toLowerCase().includes(q) ||
          (dept?.code || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterYearLevelId && s.year_level_id !== filterYearLevelId) return false;
      if (filterProgramId) {
        const yl = getYearLevel(s.year_level_id);
        if (!yl || yl.program_id !== filterProgramId) return false;
      }
      if (filterDepartmentId) {
        const yl = getYearLevel(s.year_level_id);
        const prog = yl ? getProgram(yl.program_id) : null;
        if (!prog || prog.department_id !== filterDepartmentId) return false;
      }
      return true;
    });
  }, [sections, searchQuery, filterYearLevelId, filterProgramId, filterDepartmentId]);

  const stats = useMemo(() => {
    const active = sections.filter((s) => s.is_active);
    const totalStudents = active.reduce((s, x) => s + x.current_enrollment, 0);
    const totalCapacity = active.reduce((s, x) => s + x.max_capacity, 0);
    return {
      total: active.length,
      active: active.filter((s) => s.status === 'active').length,
      full: active.filter((s) => s.status === 'full').length,
      totalStudents,
      avgOccupancy: totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0,
    };
  }, [sections]);

  const activeFiltersCount =
    (filterDepartmentId ? 1 : 0) +
    (filterProgramId ? 1 : 0) +
    (filterYearLevelId ? 1 : 0);

  const resetFilters = () => {
    setFilterDepartmentId('');
    setFilterProgramId('');
    setFilterYearLevelId('');
    setSearchQuery('');
  };

  const handleCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setModalDepartmentId('');
    setModalProgramId('');
    setShowCreateModal(true);
  };

  const handleEdit = (s: Section) => {
    setSelectedSection(s);
    setForm({
      yearLevelId: s.year_level_id,
      name: s.name,
      code: s.code,
      maxCapacity: s.max_capacity,
      academicYear: s.academic_year,
      semester: s.semester,
      eligibleRooms: [...s.eligible_rooms],
      preferredRooms: [...s.preferred_rooms],
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleView = (s: Section) => {
    setSelectedSection(s);
    setShowViewModal(true);
  };

  const handleDeleteClick = (s: Section) => {
    setSelectedSection(s);
    setShowDeleteModal(true);
  };

  const handleAddRoom = (id: string) => {
    setForm((f) => ({ ...f, eligibleRooms: [...f.eligibleRooms, id] }));
  };

  const handleRemoveRoom = (id: string) => {
    setForm((f) => ({
      ...f,
      eligibleRooms: f.eligibleRooms.filter((r) => r !== id),
      preferredRooms: f.preferredRooms.filter((r) => r !== id),
    }));
  };

  const handleTogglePreferred = (id: string) => {
    setForm((f) => ({
      ...f,
      preferredRooms: f.preferredRooms.includes(id)
        ? f.preferredRooms.filter((r) => r !== id)
        : [...f.preferredRooms, id],
    }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (showCreateModal && !modalProgramId) e.yearLevelId = 'Program is required';
    if (!form.yearLevelId) e.yearLevelId = 'Year level is required';
    if (!form.name.trim()) e.name = 'Section name is required';
    if (!form.code.trim()) e.code = 'Section code is required';
    if (!form.academicYear) e.academicYear = 'Academic year is required';
    if (!form.maxCapacity || form.maxCapacity < 1) e.maxCapacity = 'Capacity must be at least 1';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      year_level_id: form.yearLevelId,
      name: form.name,
      code: form.code,
      max_capacity: form.maxCapacity,
      current_enrollment: 0,
      academic_year: form.academicYear,
      semester: form.semester,
      status: 'active',
      is_active: true,
      eligible_rooms: form.eligibleRooms,
      preferred_rooms: form.preferredRooms,
      created_at: new Date().toISOString(),
    };
    setSections((prev) => [...prev, newSection]);
    showToast('success', 'Section Created', `${form.name} has been added.`);
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleEditSubmit = () => {
    if (!selectedSection || !validate()) return;
    setIsSubmitting(true);
    setSections((prev) =>
      prev.map((s) =>
        s.id === selectedSection.id
          ? {
              ...s,
              name: form.name,
              code: form.code,
              max_capacity: form.maxCapacity,
              academic_year: form.academicYear,
              semester: form.semester,
              eligible_rooms: form.eligibleRooms,
              preferred_rooms: form.preferredRooms,
            }
          : s
      )
    );
    showToast('success', 'Section Updated', `${form.name} has been updated.`);
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedSection) return;
    setIsSubmitting(true);
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSection.id ? { ...s, is_active: false } : s))
    );
    showToast('success', 'Section Archived', `${selectedSection.name} has been archived.`);
    setShowDeleteModal(false);
    setIsSubmitting(false);
  };

  const handleRestore = (s: Section) => {
    setSections((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, is_active: true } : x))
    );
    showToast('success', 'Section Restored', `${s.name} is now active.`);
  };

  const handleReset = () => {
    resetSections();
    showToast('info', 'Sections Reset', 'Restored to default mock data.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sections</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage class sections, capacity, and room configuration
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
            Add Section
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Sections" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle={`${stats.active} active`} />
        <StatCard icon={Check} label="Active" value={stats.active} color="bg-emerald-50 text-emerald-600" subtitle={`${stats.total - stats.active} inactive/full`} />
        <StatCard icon={AlertCircle} label="Full" value={stats.full} color="bg-amber-50 text-amber-600" subtitle={stats.full > 0 ? 'Requires attention' : 'All have capacity'} />
        <StatCard icon={GraduationCap} label="Total Students" value={stats.totalStudents} color="bg-purple-50 text-purple-600" subtitle={`${stats.avgOccupancy}% avg occupancy`} />
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
                  <h3 className="text-sm font-bold text-slate-900">Filter Sections</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} match
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

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PremiumDropdown
                label="Department"
                value={filterDepartmentId}
                onChange={(v) => {
                  setFilterDepartmentId(v);
                  setFilterProgramId('');
                  setFilterYearLevelId('');
                }}
                options={mockDepartments.map((d) => ({ value: d.id, label: d.name, sublabel: d.code }))}
                placeholder="All departments"
                icon={Building2}
                searchable
              />
              <PremiumDropdown
                label="Program"
                value={filterProgramId}
                onChange={(v) => {
                  setFilterProgramId(v);
                  setFilterYearLevelId('');
                }}
                options={filterPrograms.map((p) => ({ value: p.id, label: p.name, sublabel: p.code }))}
                placeholder="All programs"
                icon={BookOpen}
                disabled={!filterDepartmentId}
                helperText={!filterDepartmentId ? 'Select department first' : undefined}
                searchable
              />
              <PremiumDropdown
                label="Year Level"
                value={filterYearLevelId}
                onChange={setFilterYearLevelId}
                options={filterYearLevels.map((y) => ({ value: y.id, label: y.name }))}
                placeholder="All year levels"
                disabled={!filterProgramId}
                helperText={!filterProgramId ? 'Select program first' : undefined}
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                {filteredSections.length} of {sections.length} sections
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
              placeholder="Search by section, code, program, or department..."
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

        {filteredSections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No sections found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters or search term'
                : 'Create your first section to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Program & Year</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Rooms</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSections.map((s) => {
                  const yl = getYearLevel(s.year_level_id);
                  const prog = yl ? getProgram(yl.program_id) : null;
                  const dept = prog ? getDepartment(prog.department_id) : null;
                  const isArchived = !s.is_active;
                  const occupancy = s.max_capacity ? Math.round((s.current_enrollment / s.max_capacity) * 100) : 0;

                  return (
                    <tr key={s.id} className={`transition-colors ${isArchived ? 'bg-slate-50/70' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isArchived ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'}`}>
                            <Users className={`w-5 h-5 ${isArchived ? 'text-slate-400' : 'text-cyan-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-bold ${isArchived ? 'text-slate-500' : 'text-slate-900'}`}>{s.name}</p>
                              {isArchived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                  <Archive className="w-2.5 h-2.5" /> ARCHIVED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 font-mono">{s.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">
                          <p className="font-medium">{prog?.code || '—'} · {yl?.name || '—'}</p>
                          <p className="text-xs text-slate-500">
                            {dept?.code || '—'} · AY {s.academic_year} · {s.semester === 1 ? '1st' : '2nd'} Sem
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex-1 max-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-600">
                              {s.current_enrollment}/{s.max_capacity}
                            </span>
                            <span className={`text-[10px] font-bold ${occupancy >= 90 ? 'text-red-600' : occupancy >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {occupancy}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPin className="w-4 h-4 text-cyan-500" />
                          <span className="font-medium">
                            {s.eligible_rooms.length > 0 ? `${s.eligible_rooms.length} room${s.eligible_rooms.length !== 1 ? 's' : ''}` : 'No rooms'}
                          </span>
                        </div>
                        {s.preferred_rooms.length > 0 && (
                          <p className="text-xs text-slate-500 mt-0.5 ml-6 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {s.preferred_rooms.length} preferred
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isArchived ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                            <Archive className="w-3 h-3" /> ARCHIVED
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : s.status === 'full' ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {s.status.toUpperCase()}
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
              <h3 className="text-lg font-bold">Create New Section</h3>
              <p className="text-xs text-white/70 mt-0.5">Select department → program → year level</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <PremiumDropdown
            label="Department"
            value={modalDepartmentId}
            onChange={setModalDepartmentId}
            options={mockDepartments.map((d) => ({ value: d.id, label: d.name, sublabel: d.code }))}
            placeholder="Select department"
            icon={Building2}
            required
            searchable
          />
          <PremiumDropdown
            label="Program"
            value={modalProgramId}
            onChange={setModalProgramId}
            options={modalPrograms.map((p) => ({ value: p.id, label: p.name, sublabel: p.code }))}
            placeholder="Select program"
            icon={BookOpen}
            required
            disabled={!modalDepartmentId}
            helperText={!modalDepartmentId ? 'Select department first' : undefined}
            searchable
          />
          <PremiumDropdown
            label="Year Level"
            value={form.yearLevelId}
            onChange={(v) => setForm({ ...form, yearLevelId: v })}
            options={modalYearLevels.map((y) => ({ value: y.id, label: y.name }))}
            placeholder="Select year level"
            required
            error={formErrors.yearLevelId}
            disabled={!modalProgramId}
            helperText={!modalProgramId ? 'Select program first' : undefined}
          />

          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Section Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g., Block A" required error={formErrors.name} icon={Users} />
            <PremiumInput label="Section Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="e.g., SEC-001" required error={formErrors.code} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PremiumDropdown label="Academic Year" value={form.academicYear} onChange={(v) => setForm({ ...form, academicYear: v })} options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} icon={Calendar} required />
            <PremiumDropdown label="Semester" value={String(form.semester)} onChange={(v) => setForm({ ...form, semester: Number(v) as 1 | 2 })} options={SEMESTERS.map((s) => ({ value: s.value, label: s.label }))} required />
          </div>

          <PremiumInput
            label="Maximum Capacity"
            type="number"
            value={form.maxCapacity}
            onChange={(v) => setForm({ ...form, maxCapacity: Number(v) })}
            required
            error={formErrors.maxCapacity}
            icon={Users}
            helperText="Maximum number of students allowed"
          />

          <RoomConfiguration
            rooms={mockRooms}
            eligibleRooms={form.eligibleRooms}
            preferredRooms={form.preferredRooms}
            onAddRoom={handleAddRoom}
            onRemoveRoom={handleRemoveRoom}
            onTogglePreferred={handleTogglePreferred}
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleCreateSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Section
          </button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal && !!selectedSection} onClose={() => setShowEditModal(false)} maxWidth="max-w-2xl">
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Edit Section</h3>
              <p className="text-xs text-white/80 mt-0.5">Update {selectedSection?.name}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Section Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required error={formErrors.name} icon={Users} />
            <PremiumInput label="Section Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required error={formErrors.code} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PremiumDropdown label="Academic Year" value={form.academicYear} onChange={(v) => setForm({ ...form, academicYear: v })} options={ACADEMIC_YEARS.map((y) => ({ value: y, label: y }))} icon={Calendar} required />
            <PremiumDropdown label="Semester" value={String(form.semester)} onChange={(v) => setForm({ ...form, semester: Number(v) as 1 | 2 })} options={SEMESTERS.map((s) => ({ value: s.value, label: s.label }))} required />
          </div>

          <PremiumInput
            label="Maximum Capacity"
            type="number"
            value={form.maxCapacity}
            onChange={(v) => setForm({ ...form, maxCapacity: Number(v) })}
            required
            error={formErrors.maxCapacity}
            icon={Users}
            helperText={selectedSection ? `Currently ${selectedSection.current_enrollment} students enrolled` : ''}
          />

          <RoomConfiguration
            rooms={mockRooms}
            eligibleRooms={form.eligibleRooms}
            preferredRooms={form.preferredRooms}
            onAddRoom={handleAddRoom}
            onRemoveRoom={handleRemoveRoom}
            onTogglePreferred={handleTogglePreferred}
          />
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
      <Modal isOpen={showViewModal && !!selectedSection} onClose={() => setShowViewModal(false)} maxWidth="max-w-md">
        <div className="relative px-6 py-8 bg-gradient-to-br from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-white min-w-0">
              <h3 className="text-xl font-bold">{selectedSection?.name}</h3>
              <p className="text-sm text-white/70 font-mono mt-0.5">{selectedSection?.code}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {selectedSection && (
            <>
              {(() => {
                const yl = getYearLevel(selectedSection.year_level_id);
                const prog = yl ? getProgram(yl.program_id) : null;
                const dept = prog ? getDepartment(prog.department_id) : null;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</p>
                      <p className="text-sm font-bold text-slate-900">{dept?.code || '—'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Program</p>
                      <p className="text-sm font-bold text-slate-900">{prog?.code || '—'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Year Level</p>
                      <p className="text-sm font-bold text-slate-900">{yl?.name || '—'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Year</p>
                      <p className="text-sm font-bold text-slate-900">{selectedSection.academic_year}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="p-4 bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-200">
                <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-2">Capacity</p>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedSection.current_enrollment}
                    <span className="text-slate-400 text-base font-medium"> / {selectedSection.max_capacity}</span>
                  </p>
                  <p className="text-sm font-bold text-cyan-700">
                    {Math.round((selectedSection.current_enrollment / selectedSection.max_capacity) * 100)}%
                  </p>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-cyan-100">
                  <div
                    className="h-full bg-gradient-to-r from-cyan to-navy rounded-full"
                    style={{ width: `${(selectedSection.current_enrollment / selectedSection.max_capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" /> Room Configuration
                </p>
                {selectedSection.eligible_rooms.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSection.eligible_rooms.map((roomId) => {
                      const room = mockRooms.find((r) => r.id === roomId);
                      if (!room) return null;
                      const isPreferred = selectedSection.preferred_rooms.includes(roomId);
                      return (
                        <div key={roomId} className={`flex items-center gap-2 p-2.5 rounded-lg border ${isPreferred ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                          <DoorOpen className={`w-4 h-4 flex-shrink-0 ${isPreferred ? 'text-amber-600' : 'text-cyan-600'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{room.room_number} — {room.building}</p>
                            <p className="text-[10px] text-slate-500">{getRoomTypeLabel(room.room_type)} · {room.capacity} seats</p>
                          </div>
                          {isPreferred && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <MapPin className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">No rooms assigned yet</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          {selectedSection?.is_active ? (
            <button
              onClick={() => {
                setShowViewModal(false);
                if (selectedSection) handleEdit(selectedSection);
              }}
              className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <button
              onClick={() => {
                setShowViewModal(false);
                if (selectedSection) handleRestore(selectedSection);
              }}
              className="flex-1 py-3 bg-white border-2 border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Restore
            </button>
          )}
          <button onClick={() => setShowViewModal(false)} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
            Close
          </button>
        </div>
      </Modal>

      {/* ARCHIVE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedSection} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Section?</h3>
          <p className="text-sm text-slate-500 mb-1">Are you sure you want to archive</p>
          <p className="text-sm font-bold text-slate-900 mb-4">{selectedSection?.name}?</p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
            <p className="font-bold mb-1">⚠️ This will:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Hide the section from active lists</li>
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
            Archive Section
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Sections;