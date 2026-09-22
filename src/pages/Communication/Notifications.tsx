// src/pages/Communication/Notifications.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Inbox,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  FileCheck,
  Megaphone,
  AlertTriangle,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import { useNotifications } from '../../hooks/useNotifications';
import type { NotificationCategory, NotificationType } from '../../types';

const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  schedule: Calendar,
  enrollment: FileCheck,
  exam: FileCheck,
  announcement: Megaphone,
  conflict: AlertTriangle,
  system: Info,
  request: FileCheck,
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  schedule: 'bg-cyan-100 text-cyan-700',
  enrollment: 'bg-emerald-100 text-emerald-700',
  exam: 'bg-purple-100 text-purple-700',
  announcement: 'bg-blue-100 text-blue-700',
  conflict: 'bg-red-100 text-red-700',
  system: 'bg-slate-100 text-slate-700',
  request: 'bg-amber-100 text-amber-700',
};

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-cyan-500',
};

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

type FilterTab = 'all' | 'unread' | NotificationCategory;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'enrollment', label: 'Enrollment' },
  { key: 'conflict', label: 'Conflicts' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'system', label: 'System' },
];

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread' && n.is_read) return false;
      if (activeTab !== 'all' && activeTab !== 'unread' && n.category !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const handleClick = (id: string, actionUrl?: string) => {
    markAsRead(id);
    if (actionUrl) navigate(actionUrl);
  };

  const stats = useMemo(() => {
    const total = notifications.length;
    const schedule = notifications.filter((n) => n.category === 'schedule').length;
    const enrollment = notifications.filter((n) => n.category === 'enrollment').length;
    const conflicts = notifications.filter((n) => n.category === 'conflict').length;
    return { total, schedule, enrollment, conflicts };
  }, [notifications]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" leftIcon={<CheckCheck className="w-4 h-4" />}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-cyan-50 text-cyan-600', icon: Bell },
          { label: 'Schedule', value: stats.schedule, color: 'bg-blue-50 text-blue-600', icon: Calendar },
          { label: 'Enrollment', value: stats.enrollment, color: 'bg-emerald-50 text-emerald-600', icon: FileCheck },
          { label: 'Conflicts', value: stats.conflicts, color: 'bg-red-50 text-red-600', icon: AlertTriangle },
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

      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
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

          <div className="flex flex-wrap gap-2 mt-4">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.key === 'all'
                  ? notifications.length
                  : tab.key === 'unread'
                  ? unreadCount
                  : notifications.filter((n) => n.category === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-navy text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-2.5 w-20 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No notifications</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeTab !== 'all'
                ? 'Try adjusting your filters or search term'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((notif) => {
              const CategoryIcon = CATEGORY_ICONS[notif.category] ?? Info;
              const TypeIcon = TYPE_ICONS[notif.type] ?? Info;
              const colorClass = CATEGORY_COLORS[notif.category] ?? CATEGORY_COLORS.system;
              const typeColor = TYPE_COLORS[notif.type] ?? TYPE_COLORS.info;

              return (
                <li
                  key={notif.id}
                  className={`group transition-colors ${
                    notif.is_read ? 'hover:bg-slate-50' : 'bg-cyan-50/30 hover:bg-cyan-50/60'
                  }`}
                >
                  <div className="flex items-start gap-4 p-5">
                    <button
                      onClick={() => handleClick(notif.id, notif.action_url)}
                      className="flex items-start gap-4 flex-1 text-left min-w-0"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${notif.is_read ? 'font-medium' : 'font-bold'} text-slate-900 flex items-center gap-1.5`}>
                            <TypeIcon className={`w-4 h-4 flex-shrink-0 ${typeColor}`} />
                            <span className="truncate">{notif.title}</span>
                          </p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-400">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                            {notif.category}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notif.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Notifications;