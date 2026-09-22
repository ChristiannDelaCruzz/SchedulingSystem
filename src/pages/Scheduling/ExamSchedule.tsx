// src/pages/Scheduling/ExamSchedule.tsx
import React, { useMemo, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Clock,
  MapPin,
  Users,
  Building2,
  Calendar,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import { mockSections } from '../../mocks/sections';
import { mockSubjects } from '../../mocks/subjects';
import { mockRooms } from '../../mocks/rooms';
import { mockProfessors } from '../../mocks/professors';

// ============================================
// TYPES
// ============================================
interface ExamSchedule {
  id: string;
  subject_id: string;
  section_id: string;
  room_id: string;
  proctor_id: string;
  date: string; // ISO date string
  start_time: string;
  end_time: string;
  num_students: number;
}

const seedExams: ExamSchedule[] = [
  {
    id: 'exam-1',
    subject_id: 'subj-it301',
    section_id: 'sec-3bsit-1',
    room_id: 'room-102',
    proctor_id: 'prof-1',
    date: '2026-10-15',
    start_time: '09:00',
    end_time: '11:00',
    num_students: 42,
  },
  {
    id: 'exam-2',
    subject_id: 'subj-it302',
    section_id: 'sec-3bsit-1',
    room_id: 'room-lab1',
    proctor_id: 'prof-5',
    date: '2026-10-16',
    start_time: '13:00',
    end_time: '15:00',
    num_students: 42,
  },
  {
    id: 'exam-3',
    subject_id: 'subj-it301',
    section_id: 'sec-3bsit-2',
    room_id: 'room-201',
    proctor_id: 'prof-2',
    date: '2026-10-15',
    start_time: '09:00',
    end_time: '11:00',
    num_students: 38,
  },
  {
    id: 'exam-4',
    subject_id: 'subj-it303',
    section_id: 'sec-3bsit-2',
    room_id: 'room-201',
    proctor_id: 'prof-3',
    date: '2026-10-17',
    start_time: '14:00',
    end_time: '16:00',
    num_students: 38,
  },
];

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

const PremiumInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', required, error }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all ${
        error ? 'border-red-300 focus:border-red-500' : 'border-slate-200'
      }`}
    />
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

// ============================================
// MAIN
// ============================================
export const ExamSchedule: React.FC = () => {
  const { showToast } = useToast();

  const [exams, setExams, resetExams] = usePersistentState<ExamSchedule[]>(
    'smart_sched_exams',
    seedExams
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<Omit<ExamSchedule, 'id'>>({
    subject_id: '',
    section_id: '',
    room_id: '',
    proctor_id: '',
    date: '',
    start_time: '09:00',
    end_time: '11:00',
    num_students: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lookups
  const getSubject = (id: string) => mockSubjects.find((s) => s.id === id);
  const getSection = (id: string) => mockSections.find((s) => s.id === id);
  const getRoom = (id: string) => mockRooms.find((r) => r.id === id);
  const getProctor = (id: string) => mockProfessors.find((p) => p.id === id);
  const getProctorName = (id: string) => {
    const p = getProctor(id);
    return p
      ? `${p.profiles?.first_name ?? ''} ${p.profiles?.last_name ?? ''}`.trim() ||
          p.employee_id
      : '—';
  };

  // Filtered
  const filteredExams = useMemo(() => {
    return exams
      .filter((e) => {
        if (filterDate && e.date !== filterDate) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const subj = getSubject(e.subject_id);
          const sec = getSection(e.section_id);
          if (
            !`${subj?.code ?? ''} ${subj?.name ?? ''}`.toLowerCase().includes(q) &&
            !`${sec?.name ?? ''}`.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      });
  }, [exams, filterDate, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = exams.length;
    const upcoming = exams.filter((e) => new Date(e.date) >= new Date()).length;
    const uniqueProctors = new Set(exams.map((e) => e.proctor_id)).size;
    const uniqueRooms = new Set(exams.map((e) => e.room_id)).size;
    return { total, upcoming, uniqueProctors, uniqueRooms };
  }, [exams]);

  // Options
  const subjectOptions = mockSubjects
    .filter((s) => s.is_active)
    .map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }));
  const sectionOptions = mockSections
    .filter((s) => s.is_active)
    .map((s) => ({ value: s.id, label: s.name, sublabel: s.code }));
  const roomOptions = mockRooms
    .filter((r) => r.is_active)
    .map((r) => ({
      value: r.id,
      label: `Room ${r.room_number}`,
      sublabel: `${r.building} · ${r.capacity} seats`,
    }));
  const proctorOptions = mockProfessors
    .filter((p) => p.is_active)
    .map((p) => ({
      value: p.id,
      label: `${p.profiles?.first_name ?? ''} ${p.profiles?.last_name ?? ''}`.trim(),
      sublabel: p.employee_id,
    }));

  // Handlers
  const handleCreate = () => {
    setForm({
      subject_id: '',
      section_id: '',
      room_id: '',
      proctor_id: '',
      date: '',
      start_time: '09:00',
      end_time: '11:00',
      num_students: 0,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (e: ExamSchedule) => {
    setSelectedExam(e);
    setForm({
      subject_id: e.subject_id,
      section_id: e.section_id,
      room_id: e.room_id,
      proctor_id: e.proctor_id,
      date: e.date,
      start_time: e.start_time,
      end_time: e.end_time,
      num_students: e.num_students,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDeleteClick = (e: ExamSchedule) => {
    setSelectedExam(e);
    setShowDeleteModal(true);
  };

  // Conflict detection
  const detectProctorConflict = (exam: Omit<ExamSchedule, 'id'>, excludeId?: string): ExamSchedule | null => {
    return (
      exams.find(
        (e) =>
          e.id !== excludeId &&
          e.proctor_id === exam.proctor_id &&
          e.date === exam.date &&
          e.start_time < exam.end_time &&
          exam.start_time < e.end_time
      ) ?? null
    );
  };

  const detectRoomConflict = (exam: Omit<ExamSchedule, 'id'>, excludeId?: string): ExamSchedule | null => {
    return (
      exams.find(
        (e) =>
          e.id !== excludeId &&
          e.room_id === exam.room_id &&
          e.date === exam.date &&
          e.start_time < exam.end_time &&
          exam.start_time < e.end_time
      ) ?? null
    );
  };

  const validate = (excludeId?: string): boolean => {
    const e: Record<string, string> = {};
    if (!form.subject_id) e.subject_id = 'Subject is required';
    if (!form.section_id) e.section_id = 'Section is required';
    if (!form.room_id) e.room_id = 'Room is required';
    if (!form.proctor_id) e.proctor_id = 'Proctor is required';
    if (!form.date) e.date = 'Date is required';
    if (form.start_time >= form.end_time) e.end_time = 'End time must be after start time';

    const proctorConflict = detectProctorConflict(form, excludeId);
    if (proctorConflict) {
      e.proctor_id = `Proctor already assigned to ${getSubject(proctorConflict.subject_id)?.code} on ${proctorConflict.date}`;
    }
    const roomConflict = detectRoomConflict(form, excludeId);
    if (roomConflict) {
      e.room_id = `Room already booked for ${getSubject(roomConflict.subject_id)?.code} on ${roomConflict.date}`;
    }

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const newExam: ExamSchedule = { id: `exam-${Date.now()}`, ...form };
    setExams((prev) => [...prev, newExam]);
    showToast('success', 'Exam Scheduled', 'The exam has been added to the schedule.');
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleEditSubmit = () => {
    if (!selectedExam || !validate(selectedExam.id)) return;
    setIsSubmitting(true);
    setExams((prev) =>
      prev.map((e) => (e.id === selectedExam.id ? { ...e, ...form } : e))
    );
    showToast('success', 'Exam Updated', 'The exam schedule has been updated.');
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedExam) return;
    setIsSubmitting(true);
    setExams((prev) => prev.filter((e) => e.id !== selectedExam.id));
    showToast('success', 'Exam Removed', 'The exam has been deleted.');
    setShowDeleteModal(false);
    setSelectedExam(null);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    resetExams();
    showToast('info', 'Exams Reset', 'Restored to default.');
  };

  const formModalTitle = showEditModal ? 'Edit Exam' : 'Schedule New Exam';
  const formModalGradient = showEditModal
    ? 'from-amber-500 to-amber-600'
    : 'from-navy to-navy-dark';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Exam Schedule
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage exam dates, times, rooms, and proctors
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Schedule Exam
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Exams" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="Scheduled" />
        <StatCard icon={Calendar} label="Upcoming" value={stats.upcoming} color="bg-emerald-50 text-emerald-600" subtitle="From today onward" />
        <StatCard icon={Users} label="Proctors" value={stats.uniqueProctors} color="bg-purple-50 text-purple-600" subtitle="Assigned" />
        <StatCard icon={Building2} label="Rooms Used" value={stats.uniqueRooms} color="bg-amber-50 text-amber-600" subtitle="For exams" />
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
                placeholder="Search exams..."
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
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-red-600"
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No exams found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || filterDate ? 'Try adjusting your filters' : 'Schedule the first exam'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Proctor</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.map((exam) => {
                  const subj = getSubject(exam.subject_id);
                  const sec = getSection(exam.section_id);
                  const room = getRoom(exam.room_id);
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {new Date(exam.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exam.start_time} – {exam.end_time}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{subj?.code ?? '—'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                          {subj?.name ?? ''}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">{sec?.name ?? '—'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {exam.num_students} students
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {room?.room_number ?? '—'}
                            </p>
                            <p className="text-xs text-slate-500">{room?.building ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {getProctorName(exam.proctor_id)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(exam)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedExam(null);
        }}
        maxWidth="max-w-2xl"
      >
        <div className={`relative px-6 py-5 bg-gradient-to-r ${formModalGradient}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">{formModalTitle}</h3>
              <p className="text-xs text-white/70 mt-0.5">
                Fill in the exam details below
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PremiumDropdown
              label="Subject"
              value={form.subject_id}
              onChange={(v) => setForm({ ...form, subject_id: v })}
              options={subjectOptions}
              placeholder="Select subject"
              required
              error={formErrors.subject_id}
              searchable
            />
            <PremiumDropdown
              label="Section"
              value={form.section_id}
              onChange={(v) => {
                const sec = getSection(v);
                setForm({
                  ...form,
                  section_id: v,
                  num_students: sec?.current_enrollment ?? 0,
                });
              }}
              options={sectionOptions}
              placeholder="Select section"
              required
              error={formErrors.section_id}
              searchable
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PremiumDropdown
              label="Room"
              value={form.room_id}
              onChange={(v) => setForm({ ...form, room_id: v })}
              options={roomOptions}
              placeholder="Select room"
              required
              error={formErrors.room_id}
              searchable
            />
            <PremiumDropdown
              label="Proctor"
              value={form.proctor_id}
              onChange={(v) => setForm({ ...form, proctor_id: v })}
              options={proctorOptions}
              placeholder="Select proctor"
              required
              error={formErrors.proctor_id}
              searchable
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PremiumInput
              label="Date"
              type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
              required
              error={formErrors.date}
            />
            <PremiumInput
              label="Start Time"
              type="time"
              value={form.start_time}
              onChange={(v) => setForm({ ...form, start_time: v })}
              required
            />
            <PremiumInput
              label="End Time"
              type="time"
              value={form.end_time}
              onChange={(v) => setForm({ ...form, end_time: v })}
              required
              error={formErrors.end_time}
            />
          </div>

          <PremiumInput
            label="Number of Students"
            type="number"
            value={form.num_students}
            onChange={(v) => setForm({ ...form, num_students: Number(v) })}
            placeholder="e.g., 40"
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setSelectedExam(null);
            }}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={showEditModal ? handleEditSubmit : handleCreateSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-3 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
              showEditModal
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-navy to-navy-dark'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {showEditModal ? 'Save Changes' : 'Schedule Exam'}
          </button>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedExam} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        {selectedExam && (
          <>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Exam?</h3>
              <p className="text-sm text-slate-500 mb-4">
                Are you sure you want to delete the{' '}
                <strong className="text-slate-900">
                  {getSubject(selectedExam.subject_id)?.code}
                </strong>{' '}
                exam for{' '}
                <strong className="text-slate-900">
                  {getSection(selectedExam.section_id)?.name}
                </strong>
                ?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExamSchedule;