// src/pages/Admin/ProfessorAssignment.tsx
import React, { useMemo, useState } from 'react';
import {
  UserCheck,
  GraduationCap,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Users,
  Award,
  X,
  Check,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import { mockProfessors, mockProfessorQualifications } from '../../mocks/professors';
import { mockSubjects } from '../../mocks/subjects';
import { mockSections } from '../../mocks/sections';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockDepartments } from '../../mocks/departments';
import type { Professor, ProfessorQualification } from '../../types';

// ============================================
// TYPES
// ============================================
interface Assignment {
  id: string;
  professor_id: string;
  subject_id: string;
  section_id: string;
}

const seedAssignments: Assignment[] = [
  { id: 'as-1', professor_id: 'prof-1', subject_id: 'subj-it301', section_id: 'sec-3bsit-1' },
  { id: 'as-2', professor_id: 'prof-1', subject_id: 'subj-it302', section_id: 'sec-3bsit-1' },
  { id: 'as-3', professor_id: 'prof-2', subject_id: 'subj-it303', section_id: 'sec-3bsit-1' },
  { id: 'as-4', professor_id: 'prof-2', subject_id: 'subj-it301', section_id: 'sec-3bsit-2' },
  { id: 'as-5', professor_id: 'prof-5', subject_id: 'subj-it302', section_id: 'sec-3bsit-2' },
  { id: 'as-6', professor_id: 'prof-3', subject_id: 'subj-it303', section_id: 'sec-3bsit-2' },
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

// ============================================
// MAIN
// ============================================
export const ProfessorAssignment: React.FC = () => {
  const { showToast } = useToast();

  const [assignments, setAssignments, resetAssignments] = usePersistentState<Assignment[]>(
    'smart_sched_assignments',
    seedAssignments
  );

  const [, ,] = usePersistentState<ProfessorQualification[]>(
    'smart_sched_qualifications',
    mockProfessorQualifications.map((q) => ({ ...q }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProfessorId, setFilterProfessorId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    professorId: '',
    subjectId: '',
    sectionId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lookups
  const getProfessor = (id: string) => mockProfessors.find((p) => p.id === id);
  const getSubject = (id: string) => mockSubjects.find((s) => s.id === id);
  const getSection = (id: string) => mockSections.find((s) => s.id === id);

  const getProfessorName = (p: Professor | undefined) => {
    if (!p) return '—';
    return `${p.profiles?.first_name ?? ''} ${p.profiles?.last_name ?? ''}`.trim() || p.employee_id;
  };

  const getSectionContext = (sectionId: string) => {
    const sec = mockSections.find((s) => s.id === sectionId);
    if (!sec) return null;
    const yl = mockYearLevels.find((y) => y.id === sec.year_level_id);
    const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
    const dept = prog ? mockDepartments.find((d) => d.id === prog.department_id) : null;
    return { sec, yl, prog, dept };
  };

  // Filtered
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (filterProfessorId && a.professor_id !== filterProfessorId) return false;
      if (filterSectionId && a.section_id !== filterSectionId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const prof = getProfessor(a.professor_id);
        const subj = getSubject(a.subject_id);
        const sec = getSection(a.section_id);
        const profName = getProfessorName(prof).toLowerCase();
        const subjName = `${subj?.code ?? ''} ${subj?.name ?? ''}`.toLowerCase();
        const secName = `${sec?.name ?? ''} ${sec?.code ?? ''}`.toLowerCase();
        if (!profName.includes(q) && !subjName.includes(q) && !secName.includes(q))
          return false;
      }
      return true;
    });
  }, [assignments, filterProfessorId, filterSectionId, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const uniqueProfessors = new Set(assignments.map((a) => a.professor_id)).size;
    const uniqueSections = new Set(assignments.map((a) => a.section_id)).size;
    const uniqueSubjects = new Set(assignments.map((a) => a.subject_id)).size;
    return { totalAssignments, uniqueProfessors, uniqueSections, uniqueSubjects };
  }, [assignments]);

  // Form options
  const professorOptions = mockProfessors
    .filter((p) => p.is_active)
    .map((p) => ({
      value: p.id,
      label: getProfessorName(p),
      sublabel: p.employee_id,
    }));

  const sectionOptions = mockSections
    .filter((s) => s.is_active)
    .map((s) => ({
      value: s.id,
      label: s.name,
      sublabel: s.code,
    }));

  // Only show subjects the professor is qualified for
  const availableSubjectsForProf = useMemo(() => {
    if (!form.professorId) return [];
    const qualIds = new Set(
      mockProfessorQualifications
        .filter((q) => q.professor_id === form.professorId && q.is_active)
        .map((q) => q.subject_id)
    );
    return mockSubjects
      .filter((s) => s.is_active && qualIds.has(s.id))
      .map((s) => ({
        value: s.id,
        label: `${s.code} — ${s.name}`,
        sublabel: `${s.units} units`,
      }));
  }, [form.professorId]);

  // Handlers
  const handleCreate = () => {
    setForm({ professorId: '', subjectId: '', sectionId: '' });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleDeleteClick = (a: Assignment) => {
    setSelectedAssignment(a);
    setShowDeleteModal(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.professorId) e.professorId = 'Professor is required';
    if (!form.subjectId) e.subjectId = 'Subject is required';
    if (!form.sectionId) e.sectionId = 'Section is required';
    // Check duplicate
    const dup = assignments.find(
      (a) =>
        a.professor_id === form.professorId &&
        a.subject_id === form.subjectId &&
        a.section_id === form.sectionId
    );
    if (dup) e.form = 'This assignment already exists';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const newAssignment: Assignment = {
      id: `as-${Date.now()}`,
      professor_id: form.professorId,
      subject_id: form.subjectId,
      section_id: form.sectionId,
    };
    setAssignments((prev) => [...prev, newAssignment]);
    showToast('success', 'Assignment Created', 'Professor has been assigned.');
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedAssignment) return;
    setIsSubmitting(true);
    setAssignments((prev) => prev.filter((a) => a.id !== selectedAssignment.id));
    showToast('success', 'Assignment Removed', 'The assignment has been removed.');
    setShowDeleteModal(false);
    setSelectedAssignment(null);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    resetAssignments();
    showToast('info', 'Assignments Reset', 'Restored to default.');
  };

  const activeFiltersCount = (filterProfessorId ? 1 : 0) + (filterSectionId ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Professor Assignment
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Assign professors to subjects per section
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
            New Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCheck} label="Total Assignments" value={stats.totalAssignments} color="bg-cyan-50 text-cyan-600" subtitle="Professor-subject-section" />
        <StatCard icon={Users} label="Professors Assigned" value={stats.uniqueProfessors} color="bg-purple-50 text-purple-600" subtitle="Teaching this term" />
        <StatCard icon={GraduationCap} label="Sections Covered" value={stats.uniqueSections} color="bg-blue-50 text-blue-600" subtitle="With at least 1 subject" />
        <StatCard icon={BookOpen} label="Unique Subjects" value={stats.uniqueSubjects} color="bg-emerald-50 text-emerald-600" subtitle="Across all assignments" />
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
                placeholder="Search assignments..."
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
              value={filterProfessorId}
              onChange={setFilterProfessorId}
              options={[{ value: '', label: 'All professors' }, ...professorOptions]}
              placeholder="All professors"
              icon={Users}
            />
            <PremiumDropdown
              value={filterSectionId}
              onChange={setFilterSectionId}
              options={[{ value: '', label: 'All sections' }, ...sectionOptions]}
              placeholder="All sections"
              icon={GraduationCap}
            />
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No assignments found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'Create the first assignment'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Professor</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((a) => {
                  const prof = getProfessor(a.professor_id);
                  const subj = getSubject(a.subject_id);
                  const ctx = getSectionContext(a.section_id);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {prof?.profiles?.first_name?.[0] ?? ''}
                            {prof?.profiles?.last_name?.[0] ?? ''}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{getProfessorName(prof)}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{prof?.employee_id ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold font-mono text-slate-900">{subj?.code ?? '—'}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[220px]">{subj?.name ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{ctx?.sec?.name ?? '—'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ctx?.prog?.code ?? '—'} · {ctx?.yl?.name ?? '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(a)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* CREATE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="max-w-lg">
        <div className="relative px-6 py-5 bg-gradient-to-r from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">New Assignment</h3>
              <p className="text-xs text-white/70 mt-0.5">Professor → Subject → Section</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <PremiumDropdown
            label="Professor"
            value={form.professorId}
            onChange={(v) => setForm({ ...form, professorId: v, subjectId: '' })}
            options={professorOptions}
            placeholder="Select professor"
            icon={Users}
            required
            error={formErrors.professorId}
            searchable
          />
          <PremiumDropdown
            label="Subject"
            value={form.subjectId}
            onChange={(v) => setForm({ ...form, subjectId: v })}
            options={availableSubjectsForProf}
            placeholder={
              !form.professorId
                ? 'Select professor first'
                : availableSubjectsForProf.length === 0
                ? 'Professor has no qualifications'
                : 'Select subject'
            }
            icon={BookOpen}
            required
            error={formErrors.subjectId}
            disabled={!form.professorId}
            helperText={
              form.professorId && availableSubjectsForProf.length === 0
                ? 'Add qualifications in Professors → Mastery'
                : undefined
            }
            searchable
          />
          <PremiumDropdown
            label="Section"
            value={form.sectionId}
            onChange={(v) => setForm({ ...form, sectionId: v })}
            options={sectionOptions}
            placeholder="Select section"
            icon={GraduationCap}
            required
            error={formErrors.sectionId}
            searchable
          />

          {formErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {formErrors.form}
            </div>
          )}

          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
            <p className="text-xs text-cyan-800 flex items-start gap-2">
              <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Only subjects the professor is qualified to teach appear in the Subject dropdown.
                Manage qualifications in <strong>Professors → Mastery</strong>.
              </span>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleCreateSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Create Assignment
          </button>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedAssignment} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        {selectedAssignment && (
          <>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Assignment?</h3>
              <p className="text-sm text-slate-500 mb-4">
                This will remove the assignment of{' '}
                <strong className="text-slate-900">
                  {getSubject(selectedAssignment.subject_id)?.code}
                </strong>{' '}
                to{' '}
                <strong className="text-slate-900">
                  {getProfessorName(getProfessor(selectedAssignment.professor_id))}
                </strong>
                .
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Remove
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProfessorAssignment;