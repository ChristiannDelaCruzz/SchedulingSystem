// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  Clock,
  DoorOpen,
  Wand2,
  CalendarDays,
  UserCog,
  Building2,
  FileText,
  PartyPopper,
  AlertTriangle,
  FileCheck,
  Gauge,
  Briefcase,
  Shield,
  Megaphone,
  Bell,
  MessageSquare,
  History,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
} from 'lucide-react';
import { getNavigationByRole } from '../../config/navigation';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../ui/Logo/Logo';

// ============================================
// ICON MAP
// ============================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  Clock,
  DoorOpen,
  Wand2,
  CalendarDays,
  UserCog,
  Building2,
  FileText,
  PartyPopper,
  AlertTriangle,
  FileCheck,
  Gauge,
  UserGraduate: GraduationCap,
  UserTie: Briefcase,
  Briefcase,
  Shield,
  Megaphone,
  Bell,
  MessageSquare,
  History,
  Settings,
  RefreshCw,
  Mail,
};

// ============================================
// PROPS
// ============================================
interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { role } = useRole();
  const { user } = useAuth();
  const location = useLocation();

  const navigation = getNavigationByRole(role);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isCollapsed ? (
            <div className="flex-shrink-0 mx-auto">
              <Logo variant="icon" />
            </div>
          ) : (
            <Logo />
          )}
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Academic year badge */}
      {!isCollapsed && (
        <div className="px-5 py-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-500">Active</span>
            </div>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-700">AY 2026-2027</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 tracking-wider uppercase">
            1st Semester
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 sidebar-scroll">
        {navigation.map((section) => (
          <div key={section.section}>
            {isCollapsed ? (
              <div className="my-2 mx-2 border-t border-slate-200" />
            ) : (
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 relative
                        ${isCollapsed ? 'justify-center' : ''}
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-navy to-navy-dark text-white shadow-sm shadow-navy/20'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }
                      `}
                    >
                      {Icon && (
                        <Icon
                          className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-navy'
                          }`}
                        />
                      )}
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`ml-auto flex-shrink-0 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badge === 'conflicts'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-cyan-100 text-cyan-700'
                          }`}
                        >
                          {item.badge === 'conflicts' ? '3' : item.badge === 'notifications' ? '5' : '2'}
                        </span>
                      )}
                      {isCollapsed && item.badge && (
                        <span
                          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                            item.badge === 'conflicts' ? 'bg-red-500' : 'bg-cyan-500'
                          }`}
                        />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User at bottom */}
      {!isCollapsed && user && (
        <div className="px-4 py-3 border-t border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">
                {role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="hidden lg:flex items-center justify-end px-3 py-2 border-t border-slate-200/80">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-30 bg-white transition-all duration-300 ${
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-white transform transition-transform duration-300 ease-out lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;