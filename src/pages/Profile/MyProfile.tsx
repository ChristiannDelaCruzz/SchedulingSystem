// src/pages/Profile/MyProfile.tsx
import React, { useMemo, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  Save,
  Loader2,
  CheckCircle2,
  Building2,
  Clock,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useToast } from '../../hooks/useToast';
import { mockProfessors } from '../../mocks/professors';
import { mockSections } from '../../mocks/sections';
import { mockPrograms } from '../../mocks/programs';
import { mockYearLevels } from '../../mocks/yearLevels';
import { mockDepartments } from '../../mocks/departments';

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-purple-50 text-purple-700 border-purple-200',
  admin: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  staff: 'bg-blue-50 text-blue-700 border-blue-200',
  professor: 'bg-amber-50 text-amber-700 border-amber-200',
  student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const InfoRow: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-cyan-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900 break-words">{value}</p>
    </div>
  </div>
);

export const MyProfile: React.FC = () => {
  const { user } = useAuth();
  const { roleLabel } = useRole();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    middleName: user?.middleName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: '+63 912 345 6789',
    address: '123 Main St, Manila',
  });

  // Professor-specific info
  const professor = useMemo(() => {
    if (user?.role !== 'professor') return null;
    return mockProfessors.find((p) => p.profiles?.email === user.email) ?? null;
  }, [user]);

  // Student-specific info (hardcoded demo section)
  const studentSection = useMemo(() => {
    if (user?.role !== 'student') return null;
    return mockSections.find((s) => s.id === 'sec-3bsit-1') ?? null;
  }, [user]);

  const studentContext = useMemo(() => {
    if (!studentSection) return null;
    const yl = mockYearLevels.find((y) => y.id === studentSection.year_level_id);
    const prog = yl ? mockPrograms.find((p) => p.id === yl.program_id) : null;
    const dept = prog ? mockDepartments.find((d) => d.id === prog.department_id) : null;
    return { yl, prog, dept };
  }, [studentSection]);

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditing(false);
      showToast('success', 'Profile Updated', 'Your changes have been saved.');
    }, 500);
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName ?? '',
      middleName: user?.middleName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: '+63 912 345 6789',
      address: '123 Main St, Manila',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          View and manage your account information
        </p>
      </div>

      {/* PROFILE CARD */}
      <Card>
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg shadow-cyan/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${ROLE_COLORS[user.role]}`}
              >
                <Shield className="w-3 h-3" />
                {roleLabel}
              </span>
              {user.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200 text-xs font-bold uppercase tracking-wider">
                  Inactive
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200 text-xs font-medium font-mono">
                {user.id}
              </span>
            </div>
          </div>
          <div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-cyan-500" />
            Personal Information
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Number
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow icon={UserIcon} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Phone} label="Contact Number" value={form.phone} />
              <InfoRow icon={MapPin} label="Address" value={form.address} />
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
            </div>
          )}
        </Card>

        {/* Role-specific info */}
        <Card>
          {user.role === 'professor' && professor && (
            <>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-500" />
                Faculty Information
              </h3>
              <div className="space-y-3">
                <InfoRow icon={Briefcase} label="Employee ID" value={professor.employee_id} />
                <InfoRow
                  icon={BookOpen}
                  label="Specialization"
                  value={professor.specialization ?? 'Not specified'}
                />
                <InfoRow
                  icon={GraduationCap}
                  label="Educational Attainment"
                  value={professor.educational_attainment ?? 'Not specified'}
                />
                <InfoRow
                  icon={Award}
                  label="Years of Experience"
                  value={
                    professor.years_of_experience != null
                      ? `${professor.years_of_experience} years`
                      : 'Not specified'
                  }
                />
                <InfoRow icon={Clock} label="Employment Status" value="Full-Time Faculty" />
              </div>
            </>
          )}

          {user.role === 'student' && studentSection && studentContext && (
            <>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-500" />
                Academic Information
              </h3>
              <div className="space-y-3">
                <InfoRow icon={Building2} label="Department" value={studentContext.dept?.name ?? '—'} />
                <InfoRow icon={GraduationCap} label="Program" value={studentContext.prog?.name ?? '—'} />
                <InfoRow icon={BookOpen} label="Year Level" value={studentContext.yl?.name ?? '—'} />
                <InfoRow icon={UserIcon} label="Section" value={studentSection.name} />
                <InfoRow
                  icon={Calendar}
                  label="Academic Year"
                  value={`${studentSection.academic_year} · ${studentSection.semester === 1 ? '1st' : '2nd'} Semester`}
                />
                <InfoRow icon={Clock} label="Enrollment Status" value="Enrolled" />
              </div>
            </>
          )}

          {(user.role === 'admin' || user.role === 'superadmin') && (
            <>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-500" />
                Administrative Access
              </h3>
              <div className="space-y-3">
                <InfoRow icon={Shield} label="Role" value={roleLabel} />
                <InfoRow icon={Building2} label="Scope" value="Full system access" />
                <InfoRow icon={CheckCircle2} label="Permissions" value="Manage academics, scheduling, users, enrollment" />
                <InfoRow
                  icon={Calendar}
                  label="Member Since"
                  value={new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
              </div>
            </>
          )}

          {user.role === 'staff' && (
            <>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-500" />
                Staff Information
              </h3>
              <div className="space-y-3">
                <InfoRow icon={Shield} label="Role" value="Staff" />
                <InfoRow icon={Building2} label="Scope" value="Operational access" />
                <InfoRow
                  icon={CheckCircle2}
                  label="Permissions"
                  value="View academics, manage enrollment applications"
                />
                <InfoRow
                  icon={Calendar}
                  label="Member Since"
                  value={new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;