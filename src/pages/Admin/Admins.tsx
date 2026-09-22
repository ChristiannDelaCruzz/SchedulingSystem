// src/pages/Admin/Admins.tsx
import React, { useMemo, useState } from 'react';
import { Shield, Search, Mail, Check, X, Users, Star } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import { mockUsers } from '../../mocks/users';
import type { UserRole } from '../../types';

const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-purple-50 text-purple-700 border-purple-200',
  admin: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  staff: 'bg-blue-50 text-blue-700 border-blue-200',
  professor: 'bg-amber-50 text-amber-700 border-amber-200',
  student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

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

export const Admins: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const adminUsers = useMemo(
    () => mockUsers.filter((u) => u.role === 'admin' || u.role === 'superadmin'),
    []
  );

  const filtered = useMemo(() => {
    return adminUsers.filter((u) => {
      if (filterRole && u.role !== filterRole) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = `${u.firstName} ${u.lastName}`.toLowerCase();
        if (!name.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [adminUsers, filterRole, searchQuery]);

  const stats = useMemo(() => {
    const total = adminUsers.length;
    const superadmins = adminUsers.filter((u) => u.role === 'superadmin').length;
    const admins = adminUsers.filter((u) => u.role === 'admin').length;
    const active = adminUsers.filter((u) => u.isActive).length;
    return { total, superadmins, admins, active };
  }, [adminUsers]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Admins
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Super Admin and Admin accounts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Admins" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="All admin roles" />
        <StatCard icon={Star} label="Super Admins" value={stats.superadmins} color="bg-purple-50 text-purple-600" subtitle="Highest access" />
        <StatCard icon={Shield} label="Admins" value={stats.admins} color="bg-cyan-50 text-cyan-600" subtitle="Standard admin" />
        <StatCard icon={Check} label="Active" value={stats.active} color="bg-emerald-50 text-emerald-600" subtitle="Currently enabled" />
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
                { value: '', label: 'All admin roles' },
                { value: 'superadmin', label: 'Super Admin' },
                { value: 'admin', label: 'Admin' },
              ]}
              placeholder="All admin roles"
              icon={Shield}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</th>
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-xs font-bold">
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {u.firstName} {u.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {u.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${ROLE_COLORS[u.role]}`}>
                      <Shield className="w-3 h-3" />
                      {u.role === 'superadmin' ? 'Super Admin' : 'Admin'}
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
      </Card>
    </div>
  );
};

export default Admins;