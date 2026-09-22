// src/components/layout/TopNavbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, Calendar, Check } from 'lucide-react';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];

const SEMESTERS = [
  { value: 1, label: '1st Semester' },
  { value: 2, label: '2nd Semester' },
];

interface TopNavbarProps {
  onMenuClick: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);

  const yearDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPeriod = (year: string, semester: 1 | 2) => {
    setSelectedYear(year);
    setSelectedSemester(semester);
    setIsYearDropdownOpen(false);
  };

  const semesterLabel =
    SEMESTERS.find((s) => s.value === selectedSemester)?.label || '1st Semester';

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Academic period dropdown */}
        <div className="hidden md:block relative" ref={yearDropdownRef}>
          <button
            onClick={() => setIsYearDropdownOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
              isYearDropdownOpen
                ? 'bg-cyan-50 border-cyan-300 ring-2 ring-cyan-100'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-cyan-600" />
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <span>{selectedYear}</span>
              <span className="text-slate-300">·</span>
              <span className="text-cyan-600">{semesterLabel}</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                isYearDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isYearDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden z-50">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Academic Period
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select the active academic year and semester
                </p>
              </div>

              <div className="max-h-[400px] overflow-y-auto sidebar-scroll p-3">
                {ACADEMIC_YEARS.map((year) => (
                  <div key={year} className="mb-2 last:mb-0">
                    <p className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      AY {year}
                    </p>
                    {SEMESTERS.map((sem) => {
                      const isActive =
                        selectedYear === year && selectedSemester === sem.value;
                      return (
                        <button
                          key={`${year}-${sem.value}`}
                          onClick={() => handleSelectPeriod(year, sem.value as 1 | 2)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                            isActive
                              ? 'bg-cyan-50 text-cyan-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex-1">
                            {sem.label}
                            {isActive && (
                              <span className="ml-2 text-[10px] text-cyan-600 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </span>
                          {isActive && <Check className="w-4 h-4 text-cyan-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, professors, subjects, sections, rooms..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white transition-all duration-200"
            />
            <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;