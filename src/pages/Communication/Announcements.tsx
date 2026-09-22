// src/pages/Communication/Announcements.tsx
import React, { useMemo, useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  X,
  Pin,
  PinOff,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Calendar,
  Tag,
  Eye,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';

// ============================================
// TYPES + SEED DATA
// ============================================
type AnnouncementCategory =
  | 'general'
  | 'academic'
  | 'exam'
  | 'event'
  | 'enrollment'
  | 'system';

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  authorId: string;
  authorName: string;
  authorRole: string;
  pinned: boolean;
  createdAt: string;
}

const CATEGORIES: { value: AnnouncementCategory; label: string; color: string }[] = [
  { value: 'general', label: 'General', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'academic', label: 'Academic', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'exam', label: 'Exam', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'event', label: 'Event', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'enrollment', label: 'Enrollment', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'system', label: 'System', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const getCategoryMeta = (cat: AnnouncementCategory) =>
  CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0];

const seedAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Enrollment for AY 2026-2027 is now open',
    body:
      'The enrollment portal is now accepting applications for the 1st Semester of Academic Year 2026-2027. Please submit your enrollment form through the Enrollment page. The deadline for submission is August 15, 2026.',
    category: 'enrollment',
    authorId: 'u-admin-1',
    authorName: 'Juan Dela Cruz',
    authorRole: 'Admin',
    pinned: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-2',
    title: 'Midterm Examination Schedule Released',
    body:
      'The midterm examination schedule for all year levels has been finalized. Please check your exam schedule in the Exam Schedule section of your dashboard. Exam week runs from October 15–20, 2026.',
    category: 'exam',
    authorId: 'u-admin-1',
    authorName: 'Juan Dela Cruz',
    authorRole: 'Admin',
    pinned: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-3',
    title: 'Faculty Meeting — Friday, September 25',
    body:
      'All faculty members are required to attend the general faculty meeting on Friday, September 25, 2026, at 3:00 PM in the Main Auditorium. Agenda includes curriculum updates and scheduling review for the 2nd Semester.',
    category: 'academic',
    authorId: 'u-admin-1',
    authorName: 'Juan Dela Cruz',
    authorRole: 'Admin',
    pinned: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-4',
    title: 'System Maintenance — September 30, 2026',
    body:
      'The Smart Class Scheduling System will undergo scheduled maintenance on September 30, 2026, from 11:00 PM to 2:00 AM. During this window, the system may be temporarily unavailable.',
    category: 'system',
    authorId: 'u-super-1',
    authorName: 'Super Admin',
    authorRole: 'Super Admin',
    pinned: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-5',
    title: 'IT Week Celebration — Save the Date',
    body:
      'Join us for the annual IT Week celebration from November 10–14, 2026. Expect hackathons, tech talks, and industry speakers. More details to follow.',
    category: 'event',
    authorId: 'u-staff-1',
    authorName: 'Maria Santos',
    authorRole: 'Staff',
    pinned: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-6',
    title: 'Grade Submission Deadline',
    body:
      'All professors must submit final grades for the 1st Semester by October 5, 2026, through the faculty portal. Late submissions may delay student clearance.',
    category: 'academic',
    authorId: 'u-admin-1',
    authorName: 'Juan Dela Cruz',
    authorRole: 'Admin',
    pinned: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================
// PREMIUM INPUT / TEXTAREA
// ============================================
const PremiumInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, placeholder, required, error }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan hover:border-slate-300 transition-all ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
      }`}
    />
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

const PremiumTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, required, error, rows = 6 }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan hover:border-slate-300 transition-all resize-none ${
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
      }`}
    />
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

// ============================================
// RELATIVE TIME
// ============================================
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ============================================
// MAIN
// ============================================
export const Announcements: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isStaff, roleLabel } = useRole();
  const { showToast } = useToast();

  const [announcements, setAnnouncements, resetAnnouncements] = usePersistentState<
    Announcement[]
  >('smart_sched_announcements', seedAnnouncements);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [showComposerModal, setShowComposerModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    body: string;
    category: AnnouncementCategory;
    pinned: boolean;
  }>({
    title: '',
    body: '',
    category: 'general',
    pinned: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canPublish = isAdmin || isStaff;

  // ---- Derived list ----
  const filteredAnnouncements = useMemo(() => {
    let list = [...announcements];

    if (filterCategory) {
      list = list.filter((a) => a.category === filterCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q)
      );
    }

    // Sort: pinned first, then newest first
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [announcements, filterCategory, searchQuery]);

  const activeFiltersCount = filterCategory ? 1 : 0;

  const stats = useMemo(() => {
    const total = announcements.length;
    const pinned = announcements.filter((a) => a.pinned).length;
    const thisWeek = announcements.filter((a) => {
      const diff = Date.now() - new Date(a.createdAt).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length;
    const byCategory = CATEGORIES.reduce((acc, cat) => {
      acc[cat.value] = announcements.filter((a) => a.category === cat.value).length;
      return acc;
    }, {} as Record<string, number>);
    return { total, pinned, thisWeek, byCategory };
  }, [announcements]);

  // ---- Handlers ----
  const resetFilters = () => {
    setFilterCategory('');
    setSearchQuery('');
  };

  const handleCreate = () => {
    setForm({ title: '', body: '', category: 'general', pinned: false });
    setFormErrors({});
    setShowComposerModal(true);
  };

  const handleView = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setShowViewModal(true);
  };

  const handleEdit = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setForm({
      title: a.title,
      body: a.body,
      category: a.category,
      pinned: a.pinned,
    });
    setFormErrors({});
    setShowComposerModal(true);
  };

  const handleDeleteClick = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setShowDeleteModal(true);
  };

  const togglePin = (a: Announcement) => {
    setAnnouncements((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, pinned: !x.pinned } : x))
    );
    showToast(
      'success',
      a.pinned ? 'Unpinned' : 'Pinned',
      `${a.title} has been ${a.pinned ? 'unpinned' : 'pinned to the top'}.`
    );
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.body.trim()) e.body = 'Body is required';
    else if (form.body.trim().length < 10) e.body = 'Body must be at least 10 characters';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const isEditing = !!selectedAnnouncement;

    if (isEditing && selectedAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === selectedAnnouncement.id
            ? {
                ...a,
                title: form.title.trim(),
                body: form.body.trim(),
                category: form.category,
                pinned: form.pinned,
              }
            : a
        )
      );
      showToast('success', 'Announcement Updated', 'Changes saved successfully.');
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        authorId: user?.id ?? 'unknown',
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        authorRole: roleLabel,
        pinned: form.pinned,
        createdAt: new Date().toISOString(),
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      showToast('success', 'Announcement Published', 'Everyone can now see your post.');
    }

    setShowComposerModal(false);
    setSelectedAnnouncement(null);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedAnnouncement) return;
    setIsSubmitting(true);
    setAnnouncements((prev) => prev.filter((a) => a.id !== selectedAnnouncement.id));
    showToast('success', 'Announcement Deleted', 'The announcement has been removed.');
    setShowDeleteModal(false);
    setSelectedAnnouncement(null);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    resetAnnouncements();
    showToast('info', 'Announcements Reset', 'Restored to default sample posts.');
  };

  const isComposerEditMode = !!selectedAnnouncement && showComposerModal;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Announcements
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            School-wide news, updates, and reminders
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>
          {canPublish && (
            <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
              New Announcement
            </Button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: stats.total, color: 'bg-cyan-50 text-cyan-600', icon: Megaphone },
          { label: 'Pinned', value: stats.pinned, color: 'bg-amber-50 text-amber-600', icon: Pin },
          { label: 'This Week', value: stats.thisWeek, color: 'bg-emerald-50 text-emerald-600', icon: Calendar },
          { label: 'Categories', value: CATEGORIES.length, color: 'bg-purple-50 text-purple-600', icon: Tag },
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

      {/* SEARCH + FILTER */}
      <Card noPadding>
        <div className="p-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
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
          <Button
            onClick={() => setShowFilterPanel((v) => !v)}
            variant="outline"
            className="relative"
            leftIcon={<Tag className="w-4 h-4" />}
          >
            Category
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white bg-cyan-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {showFilterPanel && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PremiumDropdown
                label="Category"
                value={filterCategory}
                onChange={setFilterCategory}
                options={[
                  { value: '', label: 'All categories' },
                  ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
                ]}
                placeholder="All categories"
                icon={Tag}
              />
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* LIST */}
      {filteredAnnouncements.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Megaphone className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No announcements</h2>
          <p className="text-sm text-slate-500 mt-2">
            {searchQuery || activeFiltersCount > 0
              ? 'Try adjusting your filters or search term.'
              : 'No announcements have been posted yet.'}
          </p>
          {canPublish && !searchQuery && activeFiltersCount === 0 && (
            <div className="mt-5">
              <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
                Post the first announcement
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => {
            const cat = getCategoryMeta(a.category);
            return (
              <div
                key={a.id}
                className={`group rounded-2xl border-2 transition-all ${
                  a.pinned
                    ? 'bg-gradient-to-br from-amber-50/40 to-white border-amber-200 hover:border-amber-300'
                    : 'bg-white border-slate-200 hover:border-cyan/40 hover:shadow-md'
                }`}
              >
                <div className="p-5">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cat.color}`}
                      >
                        <Tag className="w-3 h-3" />
                        {cat.label}
                      </span>
                      {a.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          <Pin className="w-3 h-3 fill-current" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {canPublish && (
                        <>
                          <button
                            onClick={() => togglePin(a)}
                            className={`p-2 rounded-lg border transition-all ${
                              a.pinned
                                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-amber-500'
                            }`}
                            title={a.pinned ? 'Unpin' : 'Pin to top'}
                          >
                            {a.pinned ? (
                              <PinOff className="w-4 h-4" />
                            ) : (
                              <Pin className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(a)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(a)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-bold text-slate-900 leading-tight cursor-pointer hover:text-navy transition-colors"
                    onClick={() => handleView(a)}
                  >
                    {a.title}
                  </h3>

                  {/* Body preview */}
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {a.body}
                  </p>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {a.authorName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {a.authorName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {a.authorRole} · {formatRelativeTime(a.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleView(a)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-cyan transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Read more
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPOSER MODAL */}
      <Modal
        isOpen={showComposerModal}
        onClose={() => {
          setShowComposerModal(false);
          setSelectedAnnouncement(null);
        }}
        maxWidth="max-w-2xl"
      >
        <div
          className={`relative px-6 py-5 ${
            isComposerEditMode
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : 'bg-gradient-to-r from-navy to-navy-dark'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20 flex-shrink-0">
              {isComposerEditMode ? (
                <Edit2 className="w-6 h-6 text-white" />
              ) : (
                <Megaphone className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">
                {isComposerEditMode ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                {isComposerEditMode
                  ? 'Update the details below'
                  : 'Everyone with portal access will see this post'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <PremiumInput
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            placeholder="e.g., Enrollment for AY 2026-2027 is now open"
            required
            error={formErrors.title}
          />

          <PremiumDropdown
            label="Category"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v as AnnouncementCategory })}
            options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            icon={Tag}
            required
          />

          <PremiumTextarea
            label="Body"
            value={form.body}
            onChange={(v) => setForm({ ...form, body: v })}
            placeholder="Write your announcement here..."
            required
            error={formErrors.body}
            rows={8}
          />

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => setForm({ ...form, pinned: !form.pinned })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              form.pinned
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <Pin
              className={`w-4 h-4 flex-shrink-0 ${
                form.pinned ? 'text-amber-600 fill-current' : 'text-slate-400'
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Pin to top
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Pinned announcements appear first in the list.
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                form.pinned ? 'bg-amber-500 border-amber-500' : 'border-slate-300'
              }`}
            >
              {form.pinned && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => {
              setShowComposerModal(false);
              setSelectedAnnouncement(null);
            }}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-3 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
              isComposerEditMode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-navy to-navy-dark'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isComposerEditMode ? (
              <Save className="w-4 h-4" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            {isComposerEditMode ? 'Save Changes' : 'Publish Announcement'}
          </button>
        </div>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        isOpen={showViewModal && !!selectedAnnouncement}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAnnouncement(null);
        }}
        maxWidth="max-w-2xl"
      >
        {selectedAnnouncement && (
          <>
            <div className="relative px-6 py-6 bg-gradient-to-br from-navy to-navy-dark">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getCategoryMeta(selectedAnnouncement.category).color}`}
                >
                  <Tag className="w-3 h-3" />
                  {getCategoryMeta(selectedAnnouncement.category).label}
                </span>
                {selectedAnnouncement.pinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    <Pin className="w-3 h-3 fill-current" />
                    Pinned
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {selectedAnnouncement.title}
              </h3>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white text-[10px] font-bold">
                  {selectedAnnouncement.authorName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90">
                    {selectedAnnouncement.authorName}
                  </p>
                  <p className="text-[10px] text-white/60">
                    {selectedAnnouncement.authorRole} ·{' '}
                    {formatRelativeTime(selectedAnnouncement.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.body}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAnnouncement(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={showDeleteModal && !!selectedAnnouncement}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAnnouncement(null);
        }}
        maxWidth="max-w-md"
      >
        {selectedAnnouncement && (
          <>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Delete Announcement?
              </h3>
              <p className="text-sm text-slate-500 mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-bold text-slate-900 mb-4">
                "{selectedAnnouncement.title}"?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
                <p className="font-bold mb-1">⚠️ This will:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Permanently remove the announcement</li>
                  <li>Remove it from everyone's view</li>
                  <li>Cannot be undone</li>
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAnnouncement(null);
                }}
                className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Announcements;