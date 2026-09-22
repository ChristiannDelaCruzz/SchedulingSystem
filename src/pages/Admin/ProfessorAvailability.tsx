// src/pages/Admin/ProfessorAvailability.tsx
import React, { useMemo, useState } from 'react';
import {
  Clock,
  Save,
  RotateCcw,
  Check,
  User as UserIcon,
  Calendar,
  Loader2,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import { mockProfessors } from '../../mocks/professors';

// ============================================
// CONSTANTS
// ============================================
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
type Day = (typeof DAYS)[number];

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00',
];

interface DayAvailability {
  available: boolean;
  startTime: string;
  endTime: string;
}

type AvailabilityMap = Record<string, Record<Day, DayAvailability>>;

const defaultDay: DayAvailability = {
  available: false,
  startTime: '07:00',
  endTime: '17:00',
};

const seedAvailability: AvailabilityMap = {
  'prof-1': {
    Monday: { available: true, startTime: '07:00', endTime: '17:00' },
    Tuesday: { available: true, startTime: '07:00', endTime: '13:00' },
    Wednesday: { available: true, startTime: '07:00', endTime: '19:00' },
    Thursday: { available: true, startTime: '13:00', endTime: '21:00' },
    Friday: { available: false, startTime: '07:00', endTime: '17:00' },
    Saturday: { available: true, startTime: '07:00', endTime: '13:00' },
  },
  'prof-2': {
    Monday: { available: true, startTime: '08:00', endTime: '17:00' },
    Tuesday: { available: true, startTime: '08:00', endTime: '17:00' },
    Wednesday: { available: true, startTime: '08:00', endTime: '17:00' },
    Thursday: { available: true, startTime: '08:00', endTime: '17:00' },
    Friday: { available: true, startTime: '08:00', endTime: '17:00' },
    Saturday: { available: false, startTime: '07:00', endTime: '17:00' },
  },
};

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
export const ProfessorAvailability: React.FC = () => {
  const { showToast } = useToast();

  const [availability, setAvailability, resetAvailability] = usePersistentState<AvailabilityMap>(
    'smart_sched_availability',
    seedAvailability
  );

  const [selectedProfessorId, setSelectedProfessorId] = useState('prof-1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProfessor = useMemo(
    () => mockProfessors.find((p) => p.id === selectedProfessorId),
    [selectedProfessorId]
  );

  const professorAvailability = useMemo(() => {
    const base: Record<Day, DayAvailability> = {} as Record<Day, DayAvailability>;
    for (const day of DAYS) {
      base[day] = availability[selectedProfessorId]?.[day] ?? defaultDay;
    }
    return base;
  }, [availability, selectedProfessorId]);

  // Stats
  const stats = useMemo(() => {
    const days = Object.values(professorAvailability);
    const availableDays = days.filter((d) => d.available).length;
    const totalMinutes = days
      .filter((d) => d.available)
      .reduce((sum, d) => {
        const [sh, sm] = d.startTime.split(':').map(Number);
        const [eh, em] = d.endTime.split(':').map(Number);
        return sum + (eh * 60 + em) - (sh * 60 + sm);
      }, 0);
    return {
      availableDays,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      unavailableDays: DAYS.length - availableDays,
    };
  }, [professorAvailability]);

  const professorOptions = mockProfessors
    .filter((p) => p.is_active)
    .map((p) => {
      const name = `${p.profiles?.first_name ?? ''} ${p.profiles?.last_name ?? ''}`.trim();
      return {
        value: p.id,
        label: name || p.employee_id,
        sublabel: p.specialization ?? p.employee_id,
      };
    });

  const handleToggleDay = (day: Day) => {
    setAvailability((prev) => {
      const current = prev[selectedProfessorId] ?? {};
      const dayData = current[day] ?? defaultDay;
      return {
        ...prev,
        [selectedProfessorId]: {
          ...current,
          [day]: { ...dayData, available: !dayData.available },
        },
      };
    });
  };

  const handleTimeChange = (day: Day, field: 'startTime' | 'endTime', value: string) => {
    setAvailability((prev) => {
      const current = prev[selectedProfessorId] ?? {};
      const dayData = current[day] ?? defaultDay;
      return {
        ...prev,
        [selectedProfessorId]: {
          ...current,
          [day]: { ...dayData, [field]: value },
        },
      };
    });
  };

  const handleMarkAll = (available: boolean) => {
    setAvailability((prev) => {
      const current = prev[selectedProfessorId] ?? {};
      const updated = { ...current };
      for (const day of DAYS) {
        updated[day] = {
          ...(current[day] ?? defaultDay),
          available,
        };
      }
      return { ...prev, [selectedProfessorId]: updated };
    });
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(
        'success',
        'Availability Saved',
        `${selectedProfessor?.profiles?.first_name ?? 'Professor'}'s availability has been updated.`
      );
    }, 400);
  };

  const handleReset = () => {
    resetAvailability();
    showToast('info', 'Availability Reset', 'Restored to default.');
  };

  const profName = selectedProfessor
    ? `${selectedProfessor.profiles?.first_name ?? ''} ${
        selectedProfessor.profiles?.last_name ?? ''
      }`.trim()
    : '—';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Professor Availability
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configure which days and hours each professor is available
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Calendar} label="Available Days" value={stats.availableDays} color="bg-emerald-50 text-emerald-600" subtitle={`Out of ${DAYS.length} days`} />
        <StatCard icon={Clock} label="Weekly Hours" value={`${stats.totalHours}h`} color="bg-cyan-50 text-cyan-600" subtitle="Total available time" />
        <StatCard icon={X} label="Unavailable Days" value={stats.unavailableDays} color="bg-red-50 text-red-600" subtitle="Marked as off" />
      </div>

      {/* Selector + Grid */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2">
            <PremiumDropdown
              label="Professor"
              value={selectedProfessorId}
              onChange={setSelectedProfessorId}
              options={professorOptions}
              placeholder="Select professor"
              icon={UserIcon}
              searchable
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => handleMarkAll(true)} variant="outline" className="flex-1 text-xs">
              Mark all available
            </Button>
            <Button onClick={() => handleMarkAll(false)} variant="outline" className="flex-1 text-xs">
              Mark all off
            </Button>
          </div>
        </div>

        {/* Professor card */}
        {selectedProfessor && (
          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-white border border-cyan-200 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {selectedProfessor.profiles?.first_name?.[0]}
              {selectedProfessor.profiles?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{profName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedProfessor.specialization ?? 'No specialization'} ·{' '}
                {selectedProfessor.employee_id}
              </p>
            </div>
          </div>
        )}

        {/* Days grid */}
        <div className="space-y-3">
          {DAYS.map((day) => {
            const dayData = professorAvailability[day];
            return (
              <div
                key={day}
                className={`flex flex-wrap items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  dayData.available
                    ? 'bg-white border-cyan-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Day toggle */}
                <button
                  onClick={() => handleToggleDay(day)}
                  className={`flex items-center gap-3 min-w-[160px] flex-shrink-0 transition-all ${
                    dayData.available ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      dayData.available ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{day}</p>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        dayData.available ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {dayData.available ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                </button>

                {/* Times */}
                {dayData.available ? (
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">From</span>
                      <select
                        value={dayData.startTime}
                        onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                        className="px-3 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-cyan"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">To</span>
                      <select
                        value={dayData.endTime}
                        onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                        className="px-3 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-cyan"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic flex-1">
                    Not available this day
                  </span>
                )}

                {/* Toggle visual */}
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    dayData.available ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'
                  }`}
                >
                  {dayData.available && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-800 leading-relaxed">
            <span className="font-semibold">ℹ️ Note:</span> The scheduling engine will only place
            classes within these declared availability windows for the selected professor.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProfessorAvailability;