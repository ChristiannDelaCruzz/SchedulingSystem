// src/pages/Enrollment/EnrollmentForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  RotateCcw,
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  UserCheck,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import { mockDepartments } from '../../mocks/departments';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockSections } from '../../mocks/sections';
import { mockSubjects } from '../../mocks/subjects';
import type { EnrollmentType } from '../../types';

// ============================================
// ENROLLMENT TYPES
// ============================================
const ENROLLMENT_TYPES: Array<{
  value: EnrollmentType;
  label: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    value: 'new',
    label: 'New Student',
    description: 'First time enrolling at this institution',
    icon: 'GraduationCap',
    color: 'from-cyan to-cyan-dark',
  },
  {
    value: 'continuing',
    label: 'Continuing Student',
    description: 'Currently enrolled and continuing next semester',
    icon: 'ArrowRight',
    color: 'from-navy to-navy-dark',
  },
  {
    value: 'returnee',
    label: 'Returnee',
    description: 'Previously stopped and returning to continue',
    icon: 'RotateCcw',
    color: 'from-amber-500 to-amber-600',
  },
  {
    value: 'transferee',
    label: 'Transferee',
    description: 'Transferring from another institution',
    icon: 'ArrowLeftRight',
    color: 'from-purple-500 to-purple-600',
  },
];

const enrollmentIcons: Record<string, React.ElementType> = {
  GraduationCap,
  ArrowRight,
  RotateCcw,
  ArrowLeftRight,
};

// ============================================
// PREMIUM DATE PICKER
// ============================================
const PremiumDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}> = ({ value, onChange, label, required, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        const d = parseInt(parts[2]);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setSelectedYear(y);
          setSelectedMonth(m);
          setSelectedDay(d);
        }
      }
    }
  }, [value]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 1900; y <= currentYear + 10; y++) years.push(y);

  const handleDateSelect = (day: number, month: number, year: number) => {
    const date = new Date(Date.UTC(year, month, day));
    onChange(date.toISOString().split('T')[0]);
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
    setIsOpen(false);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
    const dim = getDaysInMonth(selectedYear, month);
    const validDay = Math.min(selectedDay, dim);
    setSelectedDay(validDay);
    const date = new Date(Date.UTC(selectedYear, month, validDay));
    onChange(date.toISOString().split('T')[0]);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const day = parseInt(e.target.value);
    setSelectedDay(day);
    const date = new Date(Date.UTC(selectedYear, selectedMonth, day));
    onChange(date.toISOString().split('T')[0]);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    const dim = getDaysInMonth(year, selectedMonth);
    const validDay = Math.min(selectedDay, dim);
    setSelectedDay(validDay);
    const date = new Date(Date.UTC(year, selectedMonth, validDay));
    onChange(date.toISOString().split('T')[0]);
  };

  const displayValue = value
    ? (() => {
        const parts = value.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0]);
          const m = parseInt(parts[1]) - 1;
          const d = parseInt(parts[2]);
          const date = new Date(Date.UTC(y, m, d));
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          });
        }
        return '';
      })()
    : '';

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];
  const prevMonthDays = getDaysInMonth(selectedYear, selectedMonth - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isCurrentMonth: true });
  }
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({ day: d, isCurrentMonth: false });
  }

  const dayOptions: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) dayOptions.push(d);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          className={`flex items-center w-full px-5 py-3.5 bg-white border-2 rounded-xl cursor-pointer transition-all ${
            error
              ? 'border-red-300 focus:ring-red-100'
              : isOpen
              ? 'ring-4 ring-cyan/10 border-cyan'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="w-5 h-5 text-cyan flex-shrink-0 mr-3" />
          <span className={`flex-1 text-sm ${displayValue ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
            {displayValue || 'Select date'}
          </span>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border-2 border-slate-200 rounded-xl shadow-2xl p-5 min-w-[340px] animate-in fade-in">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-cyan"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Day</label>
                <select
                  value={selectedDay}
                  onChange={handleDayChange}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-cyan"
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-cyan"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-bold text-slate-700 mb-2">{months[selectedMonth]} {selectedYear}</p>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {daysOfWeek.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, i) => {
                  const isSelected = selectedDay === item.day && item.isCurrentMonth;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => item.isCurrentMonth && handleDateSelect(item.day, selectedMonth, selectedYear)}
                      disabled={!item.isCurrentMonth}
                      className={`text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !item.isCurrentMonth
                          ? 'text-slate-300 cursor-default'
                          : isSelected
                          ? 'bg-navy text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  handleDateSelect(today.getDate(), today.getMonth(), today.getFullYear());
                }}
                className="text-xs font-semibold text-cyan hover:text-cyan-dark"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const EnrollmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('new');
  const [studentVerified, setStudentVerified] = useState(false);
  const [previousStudentNumber, setPreviousStudentNumber] = useState('');

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    address: '',
  });

  const [academicInfo, setAcademicInfo] = useState({
    departmentId: '',
    programId: '',
    yearLevelId: '',
    academicYear: '2026-2027',
    semester: 1 as 1 | 2,
  });

  // Filtered lists
  const filteredPrograms = academicInfo.departmentId
    ? mockPrograms.filter((p) => p.department_id === academicInfo.departmentId)
    : [];

  const filteredYearLevels = academicInfo.programId
    ? mockYearLevels.filter((y) => y.program_id === academicInfo.programId)
    : [];

  const filteredSections = academicInfo.yearLevelId
    ? mockSections.filter(
        (s) => s.year_level_id === academicInfo.yearLevelId && s.is_active
      )
    : [];

  // Get curriculum for the selected section's year level
  const semesterCourses = mockSubjects.slice(0, 6);

  // ============================================
  // HANDLERS
  // ============================================
  const handlePersonalChange = (field: keyof typeof personalInfo) => (value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerifyStudent = () => {
    if (!previousStudentNumber.trim()) {
      showToast('warning', 'Missing Student Number', 'Please enter your student number.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setStudentVerified(true);
      setPersonalInfo({
        firstName: 'Ana',
        lastName: 'Lopez',
        middleName: 'Reyes',
        dateOfBirth: '2004-05-12',
        contactNumber: '+63 912 345 6789',
        email: 'ana.lopez@test.com',
        address: '123 Main St, Manila',
      });
      setIsLoading(false);
      showToast('success', 'Verified', 'Welcome back, Ana!');
    }, 500);
  };

  const nextStep = () => {
    if (step === 0) {
      if (enrollmentType === 'continuing' || enrollmentType === 'returnee') {
        if (!studentVerified) {
          showToast('warning', 'Verify First', 'Please verify your student number.');
          return;
        }
      }
    }
    if (step === 1) {
      const { firstName, lastName, dateOfBirth, contactNumber, email, address } = personalInfo;
      if (!firstName || !lastName || !dateOfBirth || !contactNumber || !email || !address) {
        showToast('warning', 'Missing Information', 'Please fill in all required fields.');
        return;
      }
    }
    if (step === 2) {
      const { departmentId, programId, yearLevelId } = academicInfo;
      if (!departmentId || !programId || !yearLevelId) {
        showToast('warning', 'Missing Information', 'Please select your academic details.');
        return;
      }
    }
    if (step === 3) {
      if (!selectedSectionId) {
        showToast('warning', 'No Section Selected', 'Please select a section.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(5);
      showToast('success', 'Application Submitted! 🎉', 'Your enrollment application is now under review.');
    }, 800);
  };

  const resetForm = () => {
    setStep(0);
    setEnrollmentType('new');
    setStudentVerified(false);
    setPreviousStudentNumber('');
    setSelectedSectionId('');
    setPersonalInfo({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      contactNumber: '',
      email: '',
      address: '',
    });
    setAcademicInfo({
      departmentId: '',
      programId: '',
      yearLevelId: '',
      academicYear: '2026-2027',
      semester: 1,
    });
  };

  const semesterLabel = academicInfo.semester === 1 ? '1st Semester' : '2nd Semester';

  // ============================================
  // STEP INDICATOR
  // ============================================
  const renderStepIndicator = () => {
    const steps = ['Student Type', 'Personal Info', 'Academic Info', 'Select Section', 'Review'];

    return (
      <div className="mb-10">
        <div className="hidden md:flex items-start justify-center px-2">
          {steps.map((label, index) => {
            const isActive = step === index;
            const isDone = step > index;
            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center gap-3 min-w-[100px] flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-navy to-navy-dark text-white shadow-xl ring-8 ring-navy/10 scale-110'
                        : isDone
                        ? 'bg-gradient-to-br from-cyan to-cyan-dark text-white shadow-lg'
                        : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`text-xs font-semibold text-center whitespace-nowrap ${isActive ? 'text-navy' : isDone ? 'text-cyan-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-shrink-0 h-[3px] mt-6 rounded-full transition-colors ${isDone ? 'bg-cyan-400' : 'bg-slate-200'}`}
                    style={{ width: '60px' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="md:hidden">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy to-navy-dark rounded-full shadow-md">
              <span className="text-xs font-bold text-white">Step {step + 1} of {steps.length}</span>
              <span className="w-px h-3 bg-white/30" />
              <span className="text-xs font-semibold text-white">{steps[step]}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  step === index ? 'w-8 bg-navy' : step > index ? 'w-4 bg-cyan' : 'w-4 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER STEP
  // ============================================
  const renderStep = () => {
    // STEP 0: STUDENT TYPE
    if (step === 0) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Welcome! Let's get started</h3>
              <p className="text-sm text-slate-500 mt-0.5">First, tell us about your enrollment status.</p>
            </div>
          </div>

          <div className="space-y-3">
            {ENROLLMENT_TYPES.map((type) => {
              const Icon = enrollmentIcons[type.icon] || GraduationCap;
              const isSelected = enrollmentType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setEnrollmentType(type.value);
                    setStudentVerified(false);
                    setPreviousStudentNumber('');
                  }}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-cyan bg-gradient-to-br from-cyan/5 to-white shadow-lg ring-2 ring-cyan/20 scale-[1.01]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${type.color} shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-bold text-slate-900">{type.label}</p>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {(enrollmentType === 'continuing' || enrollmentType === 'returnee') && (
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 animate-in fade-in">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan" />
                  Enter your Student Number <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previousStudentNumber}
                  onChange={(e) => {
                    setPreviousStudentNumber(e.target.value.toUpperCase());
                    setStudentVerified(false);
                  }}
                  placeholder="e.g., SP-2025-00123"
                  disabled={studentVerified}
                  className="flex-1 px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all font-mono uppercase tracking-wider disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={handleVerifyStudent}
                  disabled={isLoading || studentVerified || !previousStudentNumber.trim()}
                  className="px-6 py-3.5 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  ) : studentVerified ? (
                    <><CheckCircle2 className="w-4 h-4" /> Verified</>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
              {studentVerified && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Verified successfully!
                  </p>
                  <p className="text-xs text-green-700 mt-1">We've pre-filled your information. Please review and continue.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-6">
            <Button
              onClick={nextStep}
              disabled={(enrollmentType === 'continuing' || enrollmentType === 'returnee') && !studentVerified}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          </div>
        </div>
      );
    }

    // STEP 1: PERSONAL INFO
    if (step === 1) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Personal Information</h3>
              <p className="text-sm text-slate-500 mt-0.5">Please provide your personal details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="First Name" value={personalInfo.firstName} onChange={(e) => handlePersonalChange('firstName')(e.target.value)} placeholder="Enter your first name" required />
            <Input label="Last Name" value={personalInfo.lastName} onChange={(e) => handlePersonalChange('lastName')(e.target.value)} placeholder="Enter your last name" required />
          </div>
          <Input label="Middle Name (Optional)" value={personalInfo.middleName} onChange={(e) => handlePersonalChange('middleName')(e.target.value)} placeholder="Enter your middle name" />
          <PremiumDatePicker label="Date of Birth" value={personalInfo.dateOfBirth} onChange={handlePersonalChange('dateOfBirth')} required />
          <Input label="Contact Number" value={personalInfo.contactNumber} onChange={(e) => handlePersonalChange('contactNumber')(e.target.value)} placeholder="+63 912 345 6789" required />
          <Input label="Email Address" type="email" value={personalInfo.email} onChange={(e) => handlePersonalChange('email')(e.target.value)} placeholder="you@example.com" required />
          <Input label="Address" value={personalInfo.address} onChange={(e) => handlePersonalChange('address')(e.target.value)} placeholder="Enter your complete address" required />

          <div className="flex justify-between pt-6">
            <Button onClick={prevStep} variant="outline">Back</Button>
            <Button onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>Next Step</Button>
          </div>
        </div>
      );
    }

    // STEP 2: ACADEMIC INFO
    if (step === 2) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Academic Information</h3>
              <p className="text-sm text-slate-500 mt-0.5">Select your department, program, and year level.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
            <select
              value={academicInfo.departmentId}
              onChange={(e) => setAcademicInfo({ ...academicInfo, departmentId: e.target.value, programId: '', yearLevelId: '' })}
              className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all"
            >
              <option value="">Select Department</option>
              {mockDepartments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Program <span className="text-red-500">*</span></label>
            <select
              value={academicInfo.programId}
              onChange={(e) => setAcademicInfo({ ...academicInfo, programId: e.target.value, yearLevelId: '' })}
              disabled={!academicInfo.departmentId}
              className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all disabled:bg-slate-50"
            >
              <option value="">Select Program</option>
              {filteredPrograms.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
            {!academicInfo.departmentId && <p className="mt-1.5 text-xs text-slate-400">Please select a department first.</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Year Level <span className="text-red-500">*</span></label>
            <select
              value={academicInfo.yearLevelId}
              onChange={(e) => setAcademicInfo({ ...academicInfo, yearLevelId: e.target.value })}
              disabled={!academicInfo.programId}
              className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all disabled:bg-slate-50"
            >
              <option value="">Select Year Level</option>
              {filteredYearLevels.map((y) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Academic Year</label>
              <div className="w-full px-5 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-600 font-medium">2026-2027</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Semester</label>
              <div className="w-full px-5 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-600 font-medium">{semesterLabel}</div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button onClick={prevStep} variant="outline">Back</Button>
            <Button onClick={nextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>Next Step</Button>
          </div>
        </div>
      );
    }

    // STEP 3: SELECT SECTION
    if (step === 3) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Select Section</h3>
              <p className="text-sm text-slate-500 mt-0.5">Choose your preferred section.</p>
            </div>
          </div>

          {filteredSections.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-slate-500 font-medium text-lg">No sections available</p>
              <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                No sections are currently available for your selected program, year level, and semester.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSections.map((section) => {
                const isFull = section.status === 'full';
                const occupancy = Math.round((section.current_enrollment / section.max_capacity) * 100);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => !isFull && setSelectedSectionId(section.id)}
                    disabled={isFull}
                    className={`p-5 border-2 rounded-xl text-left transition-all ${
                      selectedSectionId === section.id
                        ? 'border-cyan bg-gradient-to-br from-cyan/5 to-cyan/10 shadow-lg ring-2 ring-cyan/20 scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    } ${isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-lg">{section.name}</span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        section.status === 'active' ? 'bg-green-100 text-green-700'
                        : section.status === 'full' ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        {section.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5">
                      {section.current_enrollment} / {section.max_capacity} students
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan to-navy rounded-full transition-all"
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                      <span className="text-xs text-cyan font-semibold">
                        {section.max_capacity - section.current_enrollment} slots left
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button onClick={prevStep} variant="outline">Back</Button>
            <Button onClick={nextStep} disabled={!selectedSectionId} rightIcon={<ArrowRight className="w-4 h-4" />}>Next Step</Button>
          </div>
        </div>
      );
    }

    // STEP 4: REVIEW
    if (step === 4) {
      const totalUnits = semesterCourses.reduce((sum, c) => sum + c.units, 0);
      const selectedSection = filteredSections.find((s) => s.id === selectedSectionId);

      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-cyan to-navy rounded-full" />
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Review Your Application</h3>
              <p className="text-sm text-slate-500 mt-0.5">Please review your information before submitting.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-200">
              <h4 className="font-semibold text-slate-700 mb-3">Enrollment Type</h4>
              <p className="text-sm font-bold text-slate-900 capitalize">{enrollmentType}</p>
              {studentVerified && <p className="text-xs text-slate-600 mt-1 font-mono">{previousStudentNumber}</p>}
            </div>

            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-900">{personalInfo.firstName} {personalInfo.lastName}</span></p>
                <p><span className="text-slate-500">Email:</span> <span className="text-slate-800">{personalInfo.email}</span></p>
                <p><span className="text-slate-500">Contact:</span> <span className="text-slate-800">{personalInfo.contactNumber}</span></p>
                <p><span className="text-slate-500">DOB:</span> <span className="text-slate-800">{personalInfo.dateOfBirth}</span></p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3">Academic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><span className="text-slate-500">Department:</span> <span className="text-slate-800">{mockDepartments.find((d) => d.id === academicInfo.departmentId)?.name || '—'}</span></p>
                <p><span className="text-slate-500">Program:</span> <span className="text-slate-800">{mockPrograms.find((p) => p.id === academicInfo.programId)?.name || '—'}</span></p>
                <p><span className="text-slate-500">Year Level:</span> <span className="text-slate-800">{mockYearLevels.find((y) => y.id === academicInfo.yearLevelId)?.name || '—'}</span></p>
                <p><span className="text-slate-500">Section:</span> <span className="font-medium text-slate-900">{selectedSection?.name || '—'}</span></p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3">Courses ({semesterCourses.length})</h4>
              <div className="space-y-2">
                {semesterCourses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700">{c.code} — {c.name}</span>
                    <span className="text-slate-400 font-medium">{c.units} units</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t-2 border-slate-200 flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Total Units</span>
                <span className="text-navy text-lg">{totalUnits}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button onClick={prevStep} variant="outline">Back</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} isLoading={isSubmitting}>
              Submit Application
            </Button>
          </div>
        </div>
      );
    }

    // STEP 5: SUCCESS
    if (step === 5) {
      return (
        <div className="text-center py-12 animate-in fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center shadow-2xl shadow-green-500/20">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">Application Submitted! 🎉</h3>
          <p className="text-slate-500 mt-4 max-w-md mx-auto">
            Your enrollment application has been submitted successfully. You will receive an email once it has been reviewed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            ) : (
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
            )}
            <Button onClick={resetForm} variant="outline">Submit Another Application</Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Enrollment Application</h1>
            <p className="text-slate-500 mt-1">Academic Year 2026-2027 • 1st Semester</p>
          </div>
          {!isAuthenticated && (
            <Button onClick={() => navigate('/login')} variant="outline" size="sm">
              Sign In
            </Button>
          )}
        </div>

        <Card className="p-8 sm:p-10 lg:p-12 shadow-xl rounded-2xl">
          {step < 5 && renderStepIndicator()}
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

export default EnrollmentForm;