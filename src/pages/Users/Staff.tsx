// src/pages/Users/Staff.tsx
import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Search,
  Mail,
  Shield,
  Check,
  X,
  Users,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import { mockUsers } from '../../mocks/users';
import type { User, UserRole } from '../../types';

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

const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-purple-50 text-purple-700 border-purple-200',
  admin: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  staff: 'bg-blue-50 text-blue-700 border-blue-200',
  professor: 'bg-amber-50 text-amber-700 border-amber-200',
  student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ============================================
// MAIN
// ============================================
export const Staff: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const usersWithStaff: User[] = mockUsers;

  const filtered = useMemo(() => {
    return usersWithStaff.filter((u) => {
      if (filterRole && u.role !== filterRole) return false;
      if (filterStatus === 'active' && !u.isActive) return false;
      if (filterStatus === 'inactive' && u.isActive) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = `${u.firstName} ${u.lastName}`.toLowerCase();
        if (!name.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [usersWithStaff, filterRole, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = usersWithStaff.length;
    const active = usersWithStaff.filter((u) => u.isActive).length;
    const staffOnly = usersWithStaff.filter((u) => u.role === 'staff').length;
    const admins = usersWithStaff.filter(
      (u) => u.role === 'admin' || u.role === 'superadmin'
    ).length;
    return { total, active, staffOnly, admins };
  }, [usersWithStaff]);

  const activeFiltersCount = (filterRole ? 1 : 0) + (filterStatus ? 1 : 0);

  const roleLabel = (r: string) =>
    r === 'superadmin' ? 'Super Admin' : r.charAt(0).toUpperCase() + r.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Staff & Users
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          All user accounts in the system
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="All roles" />
        <StatCard icon={Check} label="Active" value={stats.active} color="bg-emerald-50 text-emerald-600" subtitle="Currently enabled" />
        <StatCard icon={Briefcase} label="Staff" value={stats.staffOnly} color="bg-blue-50 text-blue-600" subtitle="Operational" />
        <StatCard icon={Shield} label="Admins" value={stats.admins} color="bg-purple-50 text-purple-600" subtitle="Admin + Super Admin" />
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
                placeholder="Search by name or email..."
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
              value={filterRole}
              onChange={setFilterRole}
              options={[
                { value: '', label: 'All roles' },
                { value: 'superadmin', label: 'Super Admin' },
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
                { value: 'professor', label: 'Professor' },
                { value: 'student', label: 'Student' },
              ]}
              placeholder="All roles"
              icon={Shield}
            />
            <PremiumDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="All statuses"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No users found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters'
                : 'No users in the system'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.firstName[0]}
                          {u.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {u.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${
                          ROLE_COLORS[u.role]
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200 text-xs font-semibold">
                          INACTIVE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Staff;