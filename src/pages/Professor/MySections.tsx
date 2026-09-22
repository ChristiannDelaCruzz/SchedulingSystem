// src/pages/Professor/MySections.tsx
import React, { useMemo, useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  MapPin,
  Search,
  X,
  Mail,
  ArrowRight,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { mockClassSchedules } from '../../mocks/schedules';
import { mockSections } from '../../mocks/sections';
import { mockSubjects } from '../../mocks/subjects';
import { mockRooms } from '../../mocks/rooms';
import { mockProfessors } from '../../mocks/professors';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockDepartments } from '../../mocks/departments';
import { mockEnrollments } from '../../mocks/enrollments';
import { formatTime } from '../../lib/scheduleUtils';
import type { Section } from '../../types';

// The professor we simulate being logged in as
const DEMO_PROFESSOR_ID = 'prof-1';

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export const MySections: React.FC = () => {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  const activeProfessorId = DEMO_PROFESSOR_ID;

  // Sections this professor teaches (derived from schedules)
  const mySectionIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of mockClassSchedules) {
      if (s.professor_id === activeProfessorId) ids.add(s.section_id);
    }
    return ids;
  }, []);

  const mySections = useMemo(() => {
    return mockSections
      .filter((s) => mySectionIds.has(s.id) && s.is_active)
      .map((sec) => {
        const yl = mockYearLevels.find((y) => y.id === sec.year_level_id);
        const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
        const dept = prog ? mockDepartments.find((d) => d.id === prog.department_id) : null;
        const classSchedules = mockClassSchedules.filter(
          (s) => s.section_id === sec.id && s.professor_id === activeProfessorId
        );
        const subjectIds = new Set(classSchedules.map((s) => s.subject_id));
        const subjects = mockSubjects.filter((s) => subjectIds.has(s.id));
        // Count total enrolled students (from approved enrollments)
        const enrolledStudents = mockEnrollments.filter(
          (e) => e.section_id === sec.id && e.status === 'approved'
        );
        const studentCount = enrolledStudents.length || sec.current_enrollment;
        return {
          section: sec,
          yl,
          prog,
          dept,
          subjects,
          schedules: classSchedules,
          studentCount,
        };
      });
  }, [mySectionIds]);

  // Filtered sections by search
  const filteredSections = useMemo(() => {
    if (!searchQuery) return mySections;
    const q = searchQuery.toLowerCase();
    return mySections.filter((s) => {
      return (
        s.section.name.toLowerCase().includes(q) ||
        s.section.code.toLowerCase().includes(q) ||
        (s.prog?.code || '').toLowerCase().includes(q) ||
        (s.yl?.name || '').toLowerCase().includes(q)
      );
    });
  }, [mySections, searchQuery]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalSections = mySections.length;
    const totalStudents = mySections.reduce((sum, s) => sum + s.studentCount, 0);
    const totalClasses = mySections.reduce((sum, s) => sum + s.schedules.length, 0);
    const totalSubjects = new Set(
      mySections.flatMap((s) => s.subjects.map((sub) => sub.id))
    ).size;
    return { totalSections, totalStudents, totalClasses, totalSubjects };
  }, [mySections]);

  const professor = mockProfessors.find((p) => p.id === activeProfessorId);
  const profName = professor
    ? `${professor.profiles?.first_name ?? ''} ${professor.profiles?.last_name ?? ''}`.trim()
    : user
    ? `${user.firstName} ${user.lastName}`
    : 'Professor';

  // ---- Students modal data ----
  const studentsInSelectedSection: StudentRow[] = useMemo(() => {
    if (!selectedSection) return [];
    const approved = mockEnrollments.filter(
      (e) => e.section_id === selectedSection.id && e.status === 'approved'
    );
    const fromEnrollments = approved.map((e) => ({
      id: e.student_id,
      firstName: e.student?.first_name ?? '—',
      lastName: e.student?.last_name ?? '—',
      email: e.student?.email ?? '—',
      status: 'Enrolled',
    }));
    if (fromEnrollments.length > 0) return fromEnrollments;

    // Fallback: generate generic students to match enrollment count
    const count = selectedSection.current_enrollment;
    return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      id: `gen-${i}`,
      firstName: `Student ${i + 1}`,
      lastName: selectedSection.name,
      email: `student${i + 1}@test.com`,
      status: 'Enrolled',
    }));
  }, [selectedSection]);

  const openStudentsModal = (sec: Section) => {
    setSelectedSection(sec);
    setShowStudentsModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Sections
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Sections {profName} teaches this semester
          </p>
        </div>
      </div>

      {/* OVERALL STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Sections', value: overallStats.totalSections, color: 'bg-cyan-50 text-cyan-600', icon: GraduationCap },
          { label: 'Total Students', value: overallStats.totalStudents, color: 'bg-blue-50 text-blue-600', icon: Users },
          { label: 'Weekly Classes', value: overallStats.totalClasses, color: 'bg-emerald-50 text-emerald-600', icon: Calendar },
          { label: 'Subjects Taught', value: overallStats.totalSubjects, color: 'bg-purple-50 text-purple-600', icon: BookOpen },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-slate-900 leading-none">{s.value}</p>
              <p className="text-sm text-slate-600 mt-1.5 font-medium">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* SEARCH */}
      <Card noPadding>
        <div className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by section, program, or year level..."
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
      </Card>

      {/* SECTION CARDS */}
      {filteredSections.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No sections found</h2>
          <p className="text-sm text-slate-500 mt-2">
            {searchQuery
              ? 'Try a different search term.'
              : "You don't have any sections assigned yet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSections.map((item) => {
            const { section, yl, prog, dept, subjects, schedules, studentCount } = item;
            const occupancy = section.max_capacity
              ? Math.round((studentCount / section.max_capacity) * 100)
              : 0;

            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-cyan/40 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white flex-shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                          {section.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {section.code}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {dept && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-medium text-slate-600">
                        {dept.code}
                      </span>
                    )}
                    {prog && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-medium text-slate-600">
                        {prog.code}
                      </span>
                    )}
                    {yl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-medium text-slate-600">
                        {yl.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 border border-cyan-200 rounded-full text-[10px] font-bold text-cyan-700">
                      {section.semester === 1 ? '1st' : '2nd'} Sem
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Student count */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-500" />
                        Students
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {studentCount}/{section.max_capacity}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancy >= 90
                            ? 'bg-red-500'
                            : occupancy >= 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>

                  {/* Subjects taught */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                      Subjects Taught ({subjects.length})
                    </p>
                    <div className="space-y-1.5">
                      {subjects.map((subj) => (
                        <div
                          key={subj.id}
                          className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <span className="text-[10px] font-bold font-mono text-navy">
                            {subj.code}
                          </span>
                          <span className="text-xs text-slate-600 truncate flex-1">
                            {subj.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {subj.units}u
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly schedule preview */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                      Weekly Schedule ({schedules.length})
                    </p>
                    <div className="space-y-1.5">
                      {schedules.slice(0, 3).map((sch) => {
                        const subj = mockSubjects.find((s) => s.id === sch.subject_id);
                        const room = mockRooms.find((r) => r.id === sch.room_id);
                        return (
                          <div
                            key={sch.id}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <span className="font-bold text-navy min-w-[42px]">
                              {sch.day.slice(0, 3)}
                            </span>
                            <span className="font-mono text-slate-500">
                              {formatTime(sch.start_time)}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="font-medium text-slate-700">
                              {subj?.code ?? '—'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-500 ml-auto">
                              <MapPin className="w-3 h-3" />
                              {room?.room_number ?? '—'}
                            </span>
                          </div>
                        );
                      })}
                      {schedules.length > 3 && (
                        <p className="text-[10px] text-slate-400 italic">
                          + {schedules.length - 3} more classes this week
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => openStudentsModal(section)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Users className="w-4 h-4" />
                    View Students
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STUDENTS MODAL */}
      <Modal
        isOpen={showStudentsModal && !!selectedSection}
        onClose={() => setShowStudentsModal(false)}
        maxWidth="max-w-2xl"
      >
        {selectedSection && (
          <>
            <div className="relative px-6 py-5 bg-gradient-to-r from-navy to-navy-dark">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-white min-w-0">
                  <h3 className="text-lg font-bold truncate">
                    {selectedSection.name} — Students
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {studentsInSelectedSection.length} enrolled student
                    {studentsInSelectedSection.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {studentsInSelectedSection.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-base font-semibold text-slate-700">
                    No students enrolled
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    No approved enrollments for this section yet.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                        #
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsInSelectedSection.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {student.firstName[0] ?? '?'}
                              {student.lastName[0] ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">
                                {student.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {student.email}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowStudentsModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MySections;