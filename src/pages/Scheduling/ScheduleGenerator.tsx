// src/pages/Scheduling/ScheduleGenerator.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wand2,
  Calendar,
  Building2,
  BookOpen,
  Users,
  DoorOpen,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import { mockDepartments } from '../../mocks/departments';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockSections } from '../../mocks/sections';
import { mockProfessors, mockProfessorQualifications } from '../../mocks/professors';
import { mockSubjects } from '../../mocks/subjects';
import { mockRooms } from '../../mocks/rooms';
import {
  generateSchedule,
  describeUnscheduled,
  type UnscheduledEntry,
} from '../../lib/scheduleEngine';
import type { ClassSchedule } from '../../types';

// ============================================
// CONSTANTS
// ============================================
const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];
const SEMESTERS = [
  { value: 1, label: '1st Semester' },
  { value: 2, label: '2nd Semester' },
];

const SCHEDULING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type WizardStep = 1 | 2 | 3 | 4;

interface GenerationProgress {
  step: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

// ============================================
// STEP INDICATOR
// ============================================
const StepIndicator: React.FC<{ current: WizardStep }> = ({ current }) => {
  const steps = [
    { num: 1, label: 'Configuration', icon: Calendar },
    { num: 2, label: 'Constraints', icon: AlertTriangle },
    { num: 3, label: 'Generate', icon: Sparkles },
    { num: 4, label: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {steps.map((step, i) => {
        const isActive = current === step.num;
        const isDone = current > step.num;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-navy to-navy-dark text-white shadow-lg shadow-navy/30 scale-110'
                    : isDone
                    ? 'bg-gradient-to-br from-cyan to-cyan-dark text-white shadow-md shadow-cyan/20'
                    : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs font-semibold hidden md:inline ${
                  isActive ? 'text-navy' : isDone ? 'text-cyan-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-colors min-w-[12px] ${
                  isDone ? 'bg-cyan-400' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================
// CONSTRAINT TOGGLE
// ============================================
const ConstraintToggle: React.FC<{
  label: string;
  description: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}> = ({ label, description, icon: Icon, checked, onChange, locked }) => (
  <button
    type="button"
    onClick={() => !locked && onChange(!checked)}
    disabled={locked}
    className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
      checked ? 'border-cyan bg-cyan-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
    } ${locked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${checked ? 'bg-cyan-100' : 'bg-slate-100'}`}>
      <Icon className={`w-5 h-5 ${checked ? 'text-cyan-600' : 'text-slate-400'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        {locked && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
            REQUIRED
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <div
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-2 transition-all ${
        checked ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'
      }`}
    >
      {checked && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
  </button>
);

// ============================================
// MAIN
// ============================================
export const ScheduleGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<WizardStep>(1);

  // Configuration
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState<1 | 2>(1);
  const [departmentId, setDepartmentId] = useState('');
  const [programId, setProgramId] = useState('');
  const [yearLevelId, setYearLevelId] = useState('');
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

  // Constraints
  const [constraints, setConstraints] = useState({
    checkProfessorConflicts: true,
    checkSectionConflicts: true,
    checkRoomConflicts: true,
    checkAvailability: true,
    checkQualifications: true,
    checkCapacity: true,
    checkBreaks: true,
  });

  // Progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress[]>([]);

  // Result
  const [result, setResult] = useState<{
    totalClassesGenerated: number;
    totalUnscheduled: number;
    totalConflicts: number;
    scheduleVersionId: string;
  } | null>(null);

  // Generated data (for optional preview)
  const [generatedSchedules, setGeneratedSchedules] = useState<ClassSchedule[]>([]);
  const [unscheduledEntries, setUnscheduledEntries] = useState<UnscheduledEntry[]>([]);

  // ============================================
  // DERIVED
  // ============================================
  const filteredPrograms = useMemo(
    () => (departmentId ? mockPrograms.filter((p) => p.department_id === departmentId) : []),
    [departmentId]
  );

  const filteredYearLevels = useMemo(
    () => (programId ? mockYearLevels.filter((y) => y.program_id === programId) : []),
    [programId]
  );

  const filteredSections = useMemo(
    () =>
      yearLevelId
        ? mockSections.filter((s) => s.year_level_id === yearLevelId && s.is_active)
        : [],
    [yearLevelId]
  );

  const departmentOptions = mockDepartments.map((d) => ({
    value: d.id,
    label: d.name,
    sublabel: d.code,
  }));
  const programOptions = filteredPrograms.map((p) => ({
    value: p.id,
    label: p.name,
    sublabel: p.code,
  }));
  const yearLevelOptions = filteredYearLevels.map((y) => ({
    value: y.id,
    label: y.name,
  }));
  const academicYearOptions = ACADEMIC_YEARS.map((y) => ({ value: y, label: y }));
  const semesterOptions = SEMESTERS.map((s) => ({ value: s.value, label: s.label }));

  const allSectionsSelected =
    filteredSections.length > 0 && selectedSectionIds.length === filteredSections.length;

  // ============================================
  // HANDLERS
  // ============================================
  const handleToggleAllSections = () => {
    if (allSectionsSelected) setSelectedSectionIds([]);
    else setSelectedSectionIds(filteredSections.map((s) => s.id));
  };

  const handleToggleSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setDepartmentId('');
    setProgramId('');
    setYearLevelId('');
    setSelectedSectionIds([]);
    setStep(1);
    setProgress([]);
    setResult(null);
    setGeneratedSchedules([]);
    setUnscheduledEntries([]);
  };

  // ============================================
  // GENERATE SCHEDULE — real engine
  // ============================================
  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress([]);

    const progressSteps: GenerationProgress[] = [
      { step: 'Collecting academic data...', status: 'pending' },
      { step: 'Loading sections...', status: 'pending' },
      { step: 'Loading subjects...', status: 'pending' },
      { step: 'Checking professor availability...', status: 'pending' },
      { step: 'Checking room availability...', status: 'pending' },
      { step: 'Checking section requirements...', status: 'pending' },
      { step: 'Finding valid time slots...', status: 'pending' },
      { step: 'Assigning rooms...', status: 'pending' },
      { step: 'Validating schedule...', status: 'pending' },
    ];

    setProgress(progressSteps.map((p) => ({ ...p })));

    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 220));
      setProgress((prev) => {
        const next = [...prev];
        if (next[i]) next[i] = { ...next[i], status: 'active' };
        if (next[i - 1]) next[i - 1] = { ...next[i - 1], status: 'done' };
        return next;
      });
    }

    // ─── Determine sections to schedule ───
    const sectionsToSchedule =
      selectedSectionIds.length > 0
        ? filteredSections.filter((s) => selectedSectionIds.includes(s.id))
        : filteredSections.length > 0
        ? filteredSections
        : mockSections.filter((s) => s.is_active);

    // ─── Run the real engine ───
    const engineResult = generateSchedule({
      academicYear,
      semester,
      sectionIds: sectionsToSchedule.map((s) => s.id),
      sections: mockSections,
      subjects: mockSubjects,
      professors: mockProfessors,
      qualifications: mockProfessorQualifications,
      rooms: mockRooms,
      existingSchedules: [],
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayStart: '07:00',
      dayEnd: '21:00',
      slotMinutes: 30,
      constraints,
    });

    // ─── Final delay + mark all done ───
    await new Promise((r) => setTimeout(r, 300));
    setProgress((prev) => prev.map((p) => ({ ...p, status: 'done' })));

    setResult({
      totalClassesGenerated: engineResult.summary.totalClassesGenerated,
      totalUnscheduled: engineResult.summary.totalUnscheduled,
      totalConflicts: engineResult.summary.totalConflicts,
      scheduleVersionId: engineResult.summary.scheduleVersionId,
    });

    setGeneratedSchedules(engineResult.schedules);
    setUnscheduledEntries(engineResult.unscheduled);

    setIsGenerating(false);
    setStep(4);

    if (engineResult.summary.totalConflicts === 0 && engineResult.summary.totalUnscheduled === 0) {
      showToast(
        'success',
        'Schedule Generated',
        `${engineResult.summary.totalClassesGenerated} classes scheduled successfully.`
      );
    } else if (engineResult.summary.totalConflicts > 0) {
      showToast(
        'warning',
        'Generated with Conflicts',
        `${engineResult.summary.totalClassesGenerated} scheduled · ${engineResult.summary.totalConflicts} conflicts.`
      );
    } else {
      showToast(
        'warning',
        'Generated with Warnings',
        `${engineResult.summary.totalClassesGenerated} scheduled · ${engineResult.summary.totalUnscheduled} unscheduled.`
      );
    }
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const handleNextStep = () => {
    if (step === 1) {
      if (!academicYear || !semester) {
        showToast('warning', 'Missing Info', 'Please select academic year and semester.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      handleGenerate();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-navy flex items-center justify-center shadow-md shadow-cyan/20">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-bold rounded-full">
              <Sparkles className="w-3 h-3" />
              AUTOMATED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Automatic Schedule Generator
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            The engine will build a conflict-free schedule based on your academic data.
          </p>
        </div>
        <Button
          onClick={handleReset}
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          disabled={isGenerating}
        >
          Reset
        </Button>
      </div>

      {/* STEP INDICATOR */}
      <Card className="p-6">
        <StepIndicator current={step} />
      </Card>

      {/* STEP 1: CONFIGURATION */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Academic Configuration</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the period and scope of the schedule to generate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PremiumDropdown
                label="Academic Year"
                value={academicYear}
                onChange={setAcademicYear}
                options={academicYearOptions}
                icon={Calendar}
                required
              />
              <PremiumDropdown
                label="Semester"
                value={semester.toString()}
                onChange={(v) => setSemester(Number(v) as 1 | 2)}
                options={semesterOptions}
                required
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Scope (Optional)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Narrow down which sections to include. Leave blank to schedule everything.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PremiumDropdown
                label="Department"
                value={departmentId}
                onChange={(v) => {
                  setDepartmentId(v);
                  setProgramId('');
                  setYearLevelId('');
                  setSelectedSectionIds([]);
                }}
                options={departmentOptions}
                placeholder="All departments"
                icon={Building2}
                searchable
              />
              <PremiumDropdown
                label="Program"
                value={programId}
                onChange={(v) => {
                  setProgramId(v);
                  setYearLevelId('');
                  setSelectedSectionIds([]);
                }}
                options={programOptions}
                placeholder="All programs"
                icon={BookOpen}
                disabled={!departmentId}
                helperText={!departmentId ? 'Select department first' : undefined}
                searchable
              />
              <PremiumDropdown
                label="Year Level"
                value={yearLevelId}
                onChange={(v) => {
                  setYearLevelId(v);
                  setSelectedSectionIds([]);
                }}
                options={yearLevelOptions}
                placeholder="All year levels"
                disabled={!programId}
                helperText={!programId ? 'Select program first' : undefined}
              />
            </div>
          </Card>

          {filteredSections.length > 0 && (
            <Card className="p-6 animate-in fade-in">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Sections ({filteredSections.length})
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedSectionIds.length === 0
                          ? 'No sections selected — all sections will be scheduled'
                          : `${selectedSectionIds.length} section${selectedSectionIds.length !== 1 ? 's' : ''} selected`}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleAllSections}
                      className="text-xs font-semibold text-navy hover:text-cyan transition-colors px-3 py-1.5 hover:bg-slate-100 rounded-lg"
                    >
                      {allSectionsSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSections.map((section) => {
                  const isSelected = selectedSectionIds.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleToggleSection(section.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-cyan bg-cyan-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{section.name}</p>
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{section.code}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {section.current_enrollment}/{section.max_capacity} students
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STEP 2: CONSTRAINTS */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Scheduling Constraints</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hard constraints are always enforced. Toggle additional checks below.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <ConstraintToggle
                label="Professor Conflict Check"
                description="Prevent a professor from teaching two classes at the same time"
                icon={Users}
                checked={constraints.checkProfessorConflicts}
                onChange={(v) => setConstraints((c) => ({ ...c, checkProfessorConflicts: v }))}
                locked
              />
              <ConstraintToggle
                label="Section Conflict Check"
                description="Prevent a section from attending two classes at the same time"
                icon={BookOpen}
                checked={constraints.checkSectionConflicts}
                onChange={(v) => setConstraints((c) => ({ ...c, checkSectionConflicts: v }))}
                locked
              />
              <ConstraintToggle
                label="Room Conflict Check"
                description="Prevent a room from hosting two classes at the same time"
                icon={DoorOpen}
                checked={constraints.checkRoomConflicts}
                onChange={(v) => setConstraints((c) => ({ ...c, checkRoomConflicts: v }))}
                locked
              />
              <ConstraintToggle
                label="Professor Availability"
                description="Only schedule classes during professor's declared availability"
                icon={Calendar}
                checked={constraints.checkAvailability}
                onChange={(v) => setConstraints((c) => ({ ...c, checkAvailability: v }))}
                locked
              />
              <ConstraintToggle
                label="Professor Qualifications"
                description="Only assign professors qualified to teach the subject"
                icon={CheckCircle2}
                checked={constraints.checkQualifications}
                onChange={(v) => setConstraints((c) => ({ ...c, checkQualifications: v }))}
              />
              <ConstraintToggle
                label="Room Capacity"
                description="Only assign rooms with capacity >= section enrollment"
                icon={Users}
                checked={constraints.checkCapacity}
                onChange={(v) => setConstraints((c) => ({ ...c, checkCapacity: v }))}
                locked
              />
              <ConstraintToggle
                label="Break / Recess Rules"
                description="Respect configured break/recess periods"
                icon={Calendar}
                checked={constraints.checkBreaks}
                onChange={(v) => setConstraints((c) => ({ ...c, checkBreaks: v }))}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Scheduling Days</h3>
            <div className="flex flex-wrap gap-2">
              {SCHEDULING_DAYS.map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold rounded-lg"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 leading-relaxed">
                <span className="font-semibold">ℹ️ Note:</span> Not every section will have classes every day. Vacant days and vacant periods are valid and will be preserved by the engine.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: GENERATING */}
      {step === 3 && (
        <Card className="p-8 animate-in fade-in">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan to-navy flex items-center justify-center shadow-xl shadow-cyan/20 mb-4">
              {isGenerating ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Sparkles className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isGenerating ? 'Generating Schedule...' : 'Generation Complete'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isGenerating
                ? 'The engine is analyzing constraints and building a valid schedule.'
                : 'The schedule has been generated.'}
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            {progress.map((p, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  p.status === 'done'
                    ? 'bg-emerald-50 border-emerald-200'
                    : p.status === 'active'
                    ? 'bg-cyan-50 border-cyan-200 animate-pulse'
                    : p.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {p.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : p.status === 'active' ? (
                    <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
                  ) : p.status === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <p
                  className={`text-xs font-medium ${
                    p.status === 'done'
                      ? 'text-emerald-700'
                      : p.status === 'active'
                      ? 'text-cyan-700'
                      : p.status === 'error'
                      ? 'text-red-700'
                      : 'text-slate-500'
                  }`}
                >
                  {p.step}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* STEP 4: RESULTS */}
      {step === 4 && result && (
        <div className="space-y-4 animate-in fade-in">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  result.totalUnscheduled === 0 && result.totalConflicts === 0
                    ? 'bg-emerald-100'
                    : 'bg-amber-100'
                }`}
              >
                {result.totalUnscheduled === 0 && result.totalConflicts === 0 ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">
                  {result.totalUnscheduled === 0 && result.totalConflicts === 0
                    ? 'Schedule Generated Successfully'
                    : 'Schedule Generated with Warnings'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Review the summary below before publishing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-700">Generated</p>
                </div>
                <p className="text-2xl font-bold text-emerald-800">
                  {result.totalClassesGenerated}
                </p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-xs font-semibold text-red-700">Conflicts</p>
                </div>
                <p className="text-2xl font-bold text-red-800">{result.totalConflicts}</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-700">Unscheduled</p>
                </div>
                <p className="text-2xl font-bold text-amber-800">{result.totalUnscheduled}</p>
              </div>
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <p className="text-xs font-semibold text-cyan-700">Version</p>
                </div>
                <p className="text-sm font-bold text-cyan-800 font-mono">
                  {result.scheduleVersionId.slice(-8)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
              <Button onClick={() => navigate('/scheduling/class')} leftIcon={<Calendar className="w-4 h-4" />}>
                View Schedule
              </Button>
              <Button
                onClick={() => navigate('/scheduling/conflicts')}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                Review Conflicts
              </Button>
              <Button onClick={handleReset} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
                Generate Again
              </Button>
            </div>
          </Card>

          {/* Unscheduled preview */}
          {unscheduledEntries.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Unscheduled Classes ({unscheduledEntries.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {unscheduledEntries.slice(0, 10).map((entry, i) => (
                  <div
                    key={i}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <p className="text-xs font-semibold text-amber-900">
                      {describeUnscheduled(entry, mockSections, mockSubjects)}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Reason: {entry.reason}
                    </p>
                  </div>
                ))}
                {unscheduledEntries.length > 10 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    + {unscheduledEntries.length - 10} more
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Generated schedules preview */}
          {generatedSchedules.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Generated Classes Preview ({Math.min(generatedSchedules.length, 8)} of {generatedSchedules.length})
              </h3>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {generatedSchedules.slice(0, 8).map((s) => {
                  const subj = mockSubjects.find((x) => x.id === s.subject_id);
                  const section = mockSections.find((x) => x.id === s.section_id);
                  const prof = mockProfessors.find((x) => x.id === s.professor_id);
                  const room = mockRooms.find((x) => x.id === s.room_id);
                  const profName = prof
                    ? `${prof.profiles?.first_name ?? ''} ${prof.profiles?.last_name ?? ''}`.trim()
                    : '—';
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <span className="font-bold text-navy min-w-[60px]">{s.day.slice(0, 3)}</span>
                      <span className="font-mono text-slate-600 min-w-[110px]">
                        {s.start_time}–{s.end_time}
                      </span>
                      <span className="font-semibold text-slate-900 truncate flex-1">
                        {subj?.code} · {section?.name}
                      </span>
                      <span className="text-slate-500 truncate max-w-[100px]">{profName}</span>
                      <span className="text-slate-500 font-mono">{room?.room_number}</span>
                    </div>
                  );
                })}
                {generatedSchedules.length > 8 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    + {generatedSchedules.length - 8} more classes
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* FOOTER NAV */}
      {step < 3 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            onClick={handlePrevStep}
            variant="outline"
            disabled={step === 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={isGenerating}
            rightIcon={step === 2 ? <Play className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          >
            {step === 2 ? 'Generate Schedule' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScheduleGenerator;