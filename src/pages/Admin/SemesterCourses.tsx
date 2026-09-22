// src/pages/Admin/SemesterCourses.tsx
import React, { useMemo, useState } from 'react';
import {
  Calendar,
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  Building2,
  Layers,
  Users,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import { mockDepartments } from '../../mocks/departments';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockSubjects } from '../../mocks/subjects';

// ============================================
// TYPES
// ============================================
interface SemesterCourseMap {
  /** key = `${yearLevelId}_sem${1|2}` -> array of subject IDs */
  [key: string]: string[];
}

const seedCurriculum: SemesterCourseMap = {
  'yl-bsit-3_sem1': ['subj-it301', 'subj-it302', 'subj-it303', 'subj-it304', 'subj-fe301', 'subj-it305'],
  'yl-bsit-3_sem2': ['subj-it301', 'subj-it302', 'subj-it303'],
  'yl-bscs-3_sem1': ['subj-cs301', 'subj-cs302', 'subj-it301'],
};

// ============================================
// STATS
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
export const SemesterCourses: React.FC = () => {
  const { showToast } = useToast();

  const [curriculum, setCurriculum, resetCurriculum] = usePersistentState<SemesterCourseMap>(
    'smart_sched_curriculum',
    seedCurriculum
  );

  const [departmentId, setDepartmentId] = useState('dept-computing');
  const [programId, setProgramId] = useState('prog-bsit');
  const [yearLevelId, setYearLevelId] = useState('yl-bsit-3');
  const [semester, setSemester] = useState<1 | 2>(1);

  const programs = useMemo(
    () => (departmentId ? mockPrograms.filter((p) => p.department_id === departmentId) : []),
    [departmentId]
  );

  const yearLevels = useMemo(
    () => (programId ? mockYearLevels.filter((y) => y.program_id === programId) : []),
    [programId]
  );

  const currentKey = yearLevelId ? `${yearLevelId}_sem${semester}` : '';
  const currentSubjectIds = currentKey ? curriculum[currentKey] ?? [] : [];

  const currentSubjects = useMemo(
    () => mockSubjects.filter((s) => currentSubjectIds.includes(s.id)),
    [currentSubjectIds]
  );

  const totalUnits = currentSubjects.reduce((sum, s) => sum + s.units, 0);

  const availableSubjects = useMemo(
    () =>
      mockSubjects
        .filter((s) => s.is_active && !currentSubjectIds.includes(s.id))
        .map((s) => ({
          value: s.id,
          label: `${s.code} — ${s.name}`,
          sublabel: `${s.units} units · ${s.subject_type.replace(/_/g, ' ')}`,
        })),
    [currentSubjectIds]
  );

  const handleAddSubject = (subjectId: string) => {
    if (!currentKey) return;
    setCurriculum((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] ?? []), subjectId],
    }));
    showToast('success', 'Course Added', 'Added to semester curriculum.');
  };

  const handleRemoveSubject = (subjectId: string) => {
    if (!currentKey) return;
    setCurriculum((prev) => ({
      ...prev,
      [currentKey]: (prev[currentKey] ?? []).filter((id) => id !== subjectId),
    }));
    showToast('success', 'Course Removed', 'Removed from semester curriculum.');
  };

  const handleReset = () => {
    resetCurriculum();
    showToast('info', 'Curriculum Reset', 'Restored to default.');
  };

  const getProgramName = (id: string) => mockPrograms.find((p) => p.id === id)?.code || '—';
  const getYearLevelName = (id: string) => mockYearLevels.find((y) => y.id === id)?.name || '—';
  const getDepartmentName = (id: string) => mockDepartments.find((d) => d.id === id)?.code || '—';


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Semester Courses
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configure which subjects belong to each program, year level, and semester
          </p>
        </div>
        <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
          Reset
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Curriculum Entries" value={Object.keys(curriculum).length} color="bg-cyan-50 text-cyan-600" subtitle="Configured semester maps" />
        <StatCard icon={BookOpen} label="Current Courses" value={currentSubjects.length} color="bg-blue-50 text-blue-600" subtitle="In selected semester" />
        <StatCard icon={Users} label="Total Units" value={totalUnits} color="bg-emerald-50 text-emerald-600" subtitle="Across current courses" />
        <StatCard icon={Calendar} label="Semester" value={`${semester === 1 ? '1st' : '2nd'} Sem`} color="bg-purple-50 text-purple-600" subtitle={`${getYearLevelName(yearLevelId)}`} />
      </div>

      {/* CONFIGURATOR */}
      <Card>
        <h2 className="text-base font-bold text-slate-900 mb-5">Configure Curriculum</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <PremiumDropdown
            label="Department"
            value={departmentId}
            onChange={(v) => {
              setDepartmentId(v);
              const firstProg = mockPrograms.find((p) => p.department_id === v);
              setProgramId(firstProg?.id ?? '');
              const firstYl = firstProg ? mockYearLevels.find((y) => y.program_id === firstProg.id) : null;
              setYearLevelId(firstYl?.id ?? '');
            }}
            options={mockDepartments.map((d) => ({ value: d.id, label: d.name, sublabel: d.code }))}
            icon={Building2}
          />
          <PremiumDropdown
            label="Program"
            value={programId}
            onChange={(v) => {
              setProgramId(v);
              const firstYl = mockYearLevels.find((y) => y.program_id === v);
              setYearLevelId(firstYl?.id ?? '');
            }}
            options={programs.map((p) => ({ value: p.id, label: p.name, sublabel: p.code }))}
            placeholder="Select program"
            icon={GraduationCap}
            disabled={!departmentId}
          />
          <PremiumDropdown
            label="Year Level"
            value={yearLevelId}
            onChange={setYearLevelId}
            options={yearLevels.map((y) => ({ value: y.id, label: y.name }))}
            placeholder="Select year level"
            disabled={!programId}
          />
          <PremiumDropdown
            label="Semester"
            value={String(semester)}
            onChange={(v) => setSemester(Number(v) as 1 | 2)}
            options={[
              { value: '1', label: '1st Semester' },
              { value: '2', label: '2nd Semester' },
            ]}
            icon={Calendar}
          />
        </div>

        {/* Breadcrumb context */}
        <div className="mb-5 p-3 bg-gradient-to-r from-cyan-50 to-white border border-cyan-200 rounded-xl">
          <p className="text-xs font-semibold text-cyan-800">
            {getDepartmentName(departmentId)} → {getProgramName(programId)} → {getYearLevelName(yearLevelId)} → {semester === 1 ? '1st' : '2nd'} Semester
          </p>
          <p className="text-[11px] text-cyan-600 mt-0.5">
            {currentSubjects.length} courses · {totalUnits} total units
          </p>
        </div>

        {/* Add course */}
        <div className="mb-5">
          <PremiumDropdown
            label="Add Course"
            value=""
            onChange={(v) => v && handleAddSubject(v)}
            options={availableSubjects}
            placeholder={availableSubjects.length === 0 ? 'All subjects already added' : 'Search and select a subject...'}
            icon={Plus}
            searchable
            disabled={availableSubjects.length === 0}
          />
        </div>

        {/* Current courses */}
        {currentSubjects.length === 0 ? (
          <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No courses configured</p>
            <p className="text-xs text-slate-400 mt-1">Add courses above to build this semester's curriculum.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Courses ({currentSubjects.length})
            </p>
            {currentSubjects.map((subj) => (
              <div
                key={subj.id}
                className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-cyan/40 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {subj.code} — {subj.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {subj.units} units · {subj.subject_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveSubject(subj.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-navy/5 to-cyan/5 border-2 border-navy/10 rounded-xl">
              <span className="text-sm font-bold text-slate-700">Total Units</span>
              <span className="text-xl font-bold text-navy">{totalUnits}</span>
            </div>
          </div>
        )}
      </Card>

      {/* OVERVIEW TABLE */}
      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">All Configured Curricula</h2>
          <p className="text-xs text-slate-500 mt-0.5">Overview of all semester course lists</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Program / Year</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Courses</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockYearLevels.map((yl) => {
                const prog = mockPrograms.find((p) => p.id === yl.program_id);
                return [1, 2].map((sem) => {
                  const key = `${yl.id}_sem${sem}`;
                  const ids = curriculum[key] ?? [];
                  if (ids.length === 0) return null;
                  const subjs = mockSubjects.filter((s) => ids.includes(s.id));
                  const units = subjs.reduce((sum, s) => sum + s.units, 0);
                  return (
                    <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{prog?.code} · {yl.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-700">
                          <Calendar className="w-3 h-3" />
                          {sem === 1 ? '1st' : '2nd'} Semester
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{subjs.length} courses · {units} units</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setProgramId(yl.program_id);
                            setYearLevelId(yl.id);
                            setSemester(sem as 1 | 2);
                            const dept = mockPrograms.find((p) => p.id === yl.program_id)?.department_id;
                            if (dept) setDepartmentId(dept);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-xs font-semibold text-navy hover:text-cyan transition-colors"
                        >
                          Edit →
                        </button>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SemesterCourses;