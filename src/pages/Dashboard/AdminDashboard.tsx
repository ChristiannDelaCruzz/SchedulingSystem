// src/pages/Dashboard/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Briefcase,
  DoorOpen,
  CalendarDays,
  AlertTriangle,
  Wand2,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import { mockRooms } from '../../mocks/rooms';
import { mockSections } from '../../mocks/sections';
import { mockSubjects } from '../../mocks/subjects';
import { mockProfessors } from '../../mocks/professors';
import { mockClassSchedules } from '../../mocks/schedules';

// ============================================
// STAT CARD
// ============================================
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; isPositive: boolean };
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  trend,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-cyan/40 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {trend && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {trend.isPositive && <TrendingUp className="w-3 h-3" />}
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
  </button>
);

// ============================================
// QUICK ACTION
// ============================================
const QuickAction: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  primary?: boolean;
}> = ({ icon: Icon, label, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
      primary
        ? 'bg-gradient-to-r from-navy to-navy-dark text-white shadow-md shadow-navy/20 hover:shadow-lg hover:shadow-navy/30 hover:-translate-y-0.5'
        : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan/40 hover:bg-slate-50'
    }`}
  >
    <Icon className={`w-4 h-4 ${primary ? 'text-white' : 'text-cyan'}`} />
    <span>{label}</span>
  </button>
);

// ============================================
// ACTIVITY ITEM
// ============================================
const ActivityItem: React.FC<{
  user: string;
  action: string;
  time: string;
  status: 'completed' | 'pending' | 'conflict';
}> = ({ user, action, time, status }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {user
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-900">
        <span className="font-semibold">{user}</span>{' '}
        <span className="text-slate-500">{action}</span>
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{time}</p>
    </div>
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
        status === 'completed'
          ? 'bg-emerald-50 text-emerald-700'
          : status === 'conflict'
          ? 'bg-red-50 text-red-700'
          : 'bg-amber-50 text-amber-700'
      }`}
    >
      {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'conflict' && <AlertTriangle className="w-3 h-3" />}
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  </div>
);

// ============================================
// MAIN
// ============================================
export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  // ─── Computed stats from mock data ───
  const activeSections = mockSections.filter((s) => s.is_active).length;
  const totalSubjects = mockSubjects.filter((s) => s.is_active).length;
  const assignedProfessors = mockProfessors.filter((p) => p.is_active).length;
  const availableRooms = mockRooms.filter(
    (r) => r.is_active && r.status === 'available'
  ).length;
  const scheduledClasses = mockClassSchedules.length;
  const detectedConflicts = 0;

  // Weekly distribution
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyData = days.map((day) => ({
    day: day.slice(0, 3),
    value: mockClassSchedules.filter((c) => c.day === day).length,
  }));
  const maxWeekly = Math.max(...weeklyData.map((d) => d.value), 1);

  // Schedule status donut
  const statusData = {
    total: scheduledClasses,
    generated: scheduledClasses,
    published: 0,
    pendingReview: 0,
    withConflicts: detectedConflicts,
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ─── Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {greeting}, {user?.firstName || 'Admin'}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening with your academic schedule today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => navigate('/scheduling/generator')}
            leftIcon={<Wand2 className="w-4 h-4" />}
          >
            Generate Schedule
          </Button>
          <Button
            onClick={() => navigate('/scheduling/class')}
            variant="outline"
            leftIcon={<CalendarDays className="w-4 h-4" />}
          >
            View Timetable
          </Button>
          <Button
            onClick={() => navigate('/scheduling/conflicts')}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            leftIcon={<AlertTriangle className="w-4 h-4" />}
          >
            Review Conflicts
          </Button>
        </div>
      </div>

      {/* ─── Stats grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-slate-100 mb-4" />
                <div className="h-8 w-20 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-24 bg-slate-100 rounded" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Active Sections"
              value={activeSections}
              iconBg="bg-cyan-50"
              iconColor="text-cyan-600"
              onClick={() => navigate('/admin/sections')}
            />
            <StatCard
              icon={BookOpen}
              label="Subjects"
              value={totalSubjects}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              onClick={() => navigate('/admin/subjects')}
            />
            <StatCard
              icon={Briefcase}
              label="Professors"
              value={assignedProfessors}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              onClick={() => navigate('/admin/professors')}
            />
            <StatCard
              icon={DoorOpen}
              label="Available Rooms"
              value={availableRooms}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              onClick={() => navigate('/admin/rooms')}
            />
            <StatCard
              icon={CalendarDays}
              label="Scheduled Classes"
              value={scheduledClasses}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              onClick={() => navigate('/scheduling/class')}
            />
            <StatCard
              icon={AlertTriangle}
              label="Detected Conflicts"
              value={detectedConflicts}
              iconBg="bg-red-50"
              iconColor="text-red-600"
              onClick={() => navigate('/scheduling/conflicts')}
            />
          </>
        )}
      </div>

      {/* ─── Charts row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly distribution */}
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Class Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Classes per day this semester</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.value}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{ height: `${Math.max((item.value / maxWeekly) * 100, 4)}%` }}
                />
                <span className="text-xs font-medium text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Schedule status donut */}
        <Card>
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-900">Schedule Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Current overview</p>
          </div>

          <div className="flex justify-center mb-5">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="12"
                  strokeDasharray="251 251"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-slate-900">{statusData.total}</p>
                <p className="text-xs text-slate-500">Total Classes</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Generated', value: 100, color: 'bg-cyan-500' },
              { label: 'Published', value: 0, color: 'bg-navy' },
              { label: 'Pending Review', value: 0, color: 'bg-amber-500' },
              { label: 'With Conflicts', value: 0, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs text-slate-600">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── Quick actions + activity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction
              icon={Wand2}
              label="Generate Schedule"
              onClick={() => navigate('/scheduling/generator')}
              primary
            />
            <QuickAction
              icon={Users}
              label="Add Section"
              onClick={() => navigate('/admin/sections')}
            />
            <QuickAction
              icon={Briefcase}
              label="Add Professor"
              onClick={() => navigate('/admin/professors')}
            />
            <QuickAction
              icon={DoorOpen}
              label="Add Room"
              onClick={() => navigate('/admin/rooms')}
            />
            <QuickAction
              icon={AlertTriangle}
              label="View Conflicts"
              onClick={() => navigate('/scheduling/conflicts')}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Scheduling Activity</h3>
            <button className="text-xs font-semibold text-navy hover:text-cyan transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <ActivityItem
              user="Admin Juan"
              action="generated the 1st Semester BSIT schedule"
              time="10 minutes ago"
              status="completed"
            />
            <ActivityItem
              user="Admin Juan"
              action="approved enrollment for Ana Lopez"
              time="1 hour ago"
              status="completed"
            />
            <ActivityItem
              user="Staff Maria"
              action="flagged a professor conflict"
              time="2 hours ago"
              status="conflict"
            />
            <ActivityItem
              user="Admin Juan"
              action="archived Room 104"
              time="Yesterday"
              status="completed"
            />
            <ActivityItem
              user="Staff Maria"
              action="submitted enrollment review"
              time="Yesterday"
              status="pending"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;