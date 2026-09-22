// src/pages/Scheduling/EventSchedule.tsx
import React, { useMemo, useState } from 'react';
import {
  PartyPopper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Clock,
  MapPin,
  Building2,
  Calendar,
  X,
  Users,
  Flag,
} from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import { mockRooms } from '../../mocks/rooms';

// ============================================
// TYPES
// ============================================
type EventType =
  | 'school_event'
  | 'seminar'
  | 'meeting'
  | 'orientation'
  | 'academic'
  | 'special';

type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

interface EventSchedule {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  expected_attendees: number;
  status: EventStatus;
  organizer: string;
}

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'school_event', label: 'School Event', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'seminar', label: 'Seminar', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'orientation', label: 'Orientation', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'academic', label: 'Academic', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'special', label: 'Special', color: 'bg-red-50 text-red-700 border-red-200' },
];

const STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: 'upcoming', label: 'Upcoming', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'ongoing', label: 'Ongoing', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'completed', label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
];

const getTypeMeta = (t: EventType) => EVENT_TYPES.find((x) => x.value === t) ?? EVENT_TYPES[0];
const getStatusMeta = (s: EventStatus) => STATUSES.find((x) => x.value === s) ?? STATUSES[0];

const seedEvents: EventSchedule[] = [
  {
    id: 'evt-1',
    title: 'IT Week Opening Ceremony',
    description: 'Official kickoff of IT Week 2026 with guest speakers from the industry.',
    type: 'school_event',
    room_id: 'room-102',
    date: '2026-11-10',
    start_time: '08:00',
    end_time: '11:00',
    expected_attendees: 200,
    status: 'upcoming',
    organizer: 'Admin Juan Dela Cruz',
  },
  {
    id: 'evt-2',
    title: 'Faculty General Meeting',
    description: 'Quarterly faculty meeting to review curriculum and scheduling.',
    type: 'meeting',
    room_id: 'room-201',
    date: '2026-09-25',
    start_time: '15:00',
    end_time: '17:00',
    expected_attendees: 45,
    status: 'upcoming',
    organizer: 'Admin Juan Dela Cruz',
  },
  {
    id: 'evt-3',
    title: 'Cybersecurity Seminar',
    description: 'Guest lecture on modern cybersecurity practices.',
    type: 'seminar',
    room_id: 'room-lab1',
    date: '2026-10-05',
    start_time: '13:00',
    end_time: '16:00',
    expected_attendees: 60,
    status: 'upcoming',
    organizer: 'Prof. Sofia Santos',
  },
  {
    id: 'evt-4',
    title: 'Freshmen Orientation',
    description: 'Welcome and orientation for incoming freshmen.',
    type: 'orientation',
    room_id: 'room-102',
    date: '2026-08-15',
    start_time: '09:00',
    end_time: '12:00',
    expected_attendees: 150,
    status: 'completed',
    organizer: 'Staff Maria Santos',
  },
];

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

const PremiumInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', required, error }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all ${
        error ? 'border-red-300 focus:border-red-500' : 'border-slate-200'
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
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all resize-none"
    />
  </div>
);

// ============================================
// MAIN
// ============================================
export const EventSchedule: React.FC = () => {
  const { showToast } = useToast();

  const [events, setEvents, resetEvents] = usePersistentState<EventSchedule[]>(
    'smart_sched_events',
    seedEvents
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<Omit<EventSchedule, 'id'>>({
    title: '',
    description: '',
    type: 'school_event',
    room_id: '',
    date: '',
    start_time: '09:00',
    end_time: '11:00',
    expected_attendees: 0,
    status: 'upcoming',
    organizer: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lookups
  const getRoom = (id: string) => mockRooms.find((r) => r.id === id);

  // Filtered
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (filterType && e.type !== filterType) return false;
        if (filterStatus && e.status !== filterStatus) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (
            !e.title.toLowerCase().includes(q) &&
            !(e.description ?? '').toLowerCase().includes(q) &&
            !e.organizer.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      });
  }, [events, filterType, filterStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter((e) => e.status === 'upcoming').length;
    const ongoing = events.filter((e) => e.status === 'ongoing').length;
    const totalAttendees = events.reduce((sum, e) => sum + e.expected_attendees, 0);
    return { total, upcoming, ongoing, totalAttendees };
  }, [events]);

  // Options
  const roomOptions = mockRooms
    .filter((r) => r.is_active)
    .map((r) => ({
      value: r.id,
      label: `Room ${r.room_number}`,
      sublabel: `${r.building} · ${r.capacity} seats`,
    }));

  // Handlers
  const handleCreate = () => {
    setForm({
      title: '',
      description: '',
      type: 'school_event',
      room_id: '',
      date: '',
      start_time: '09:00',
      end_time: '11:00',
      expected_attendees: 0,
      status: 'upcoming',
      organizer: '',
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (e: EventSchedule) => {
    setSelectedEvent(e);
    const { id: _id, ...rest } = e;
    void _id;
    setForm(rest);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDeleteClick = (e: EventSchedule) => {
    setSelectedEvent(e);
    setShowDeleteModal(true);
  };

  const validate = (excludeId?: string): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.room_id) errs.room_id = 'Room is required';
    if (!form.date) errs.date = 'Date is required';
    if (form.start_time >= form.end_time) errs.end_time = 'End time must be after start time';

    // Room conflict — same room, same date, overlapping time, non-cancelled event
    const conflict = events.find(
      (e) =>
        e.id !== excludeId &&
        e.status !== 'cancelled' &&
        e.room_id === form.room_id &&
        e.date === form.date &&
        e.start_time < form.end_time &&
        form.start_time < e.end_time
    );
    if (conflict) {
      errs.room_id = `Room is already booked for "${conflict.title}" on ${conflict.date}`;
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const newEvent: EventSchedule = {
      id: `evt-${Date.now()}`,
      ...form,
      organizer: form.organizer.trim() || 'Admin',
    };
    setEvents((prev) => [...prev, newEvent]);
    showToast('success', 'Event Created', 'The event has been added to the schedule.');
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleEditSubmit = () => {
    if (!selectedEvent || !validate(selectedEvent.id)) return;
    setIsSubmitting(true);
    setEvents((prev) =>
      prev.map((e) => (e.id === selectedEvent.id ? { ...e, ...form } : e))
    );
    showToast('success', 'Event Updated', 'The event has been updated.');
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedEvent) return;
    setIsSubmitting(true);
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    showToast('success', 'Event Deleted', 'The event has been removed.');
    setShowDeleteModal(false);
    setSelectedEvent(null);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    resetEvents();
    showToast('info', 'Events Reset', 'Restored to default.');
  };

  const formModalTitle = showEditModal ? 'Edit Event' : 'Schedule New Event';
  const formModalGradient = showEditModal
    ? 'from-amber-500 to-amber-600'
    : 'from-navy to-navy-dark';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Event Schedule
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage school events, seminars, meetings, and other activities
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleReset} variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Reset
          </Button>
          <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Schedule Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={PartyPopper} label="Total Events" value={stats.total} color="bg-cyan-50 text-cyan-600" subtitle="All events" />
        <StatCard icon={Calendar} label="Upcoming" value={stats.upcoming} color="bg-emerald-50 text-emerald-600" subtitle="Scheduled" />
        <StatCard icon={Clock} label="Ongoing" value={stats.ongoing} color="bg-amber-50 text-amber-600" subtitle="Happening now" />
        <StatCard icon={Users} label="Total Attendees" value={stats.totalAttendees} color="bg-purple-50 text-purple-600" subtitle="Expected" />
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
                placeholder="Search events..."
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
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: '', label: 'All types' },
                ...EVENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
              ]}
              placeholder="All types"
            />
            <PremiumDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: '', label: 'All statuses' },
                ...STATUSES.map((s) => ({ value: s.value, label: s.label })),
              ]}
              placeholder="All statuses"
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No events found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || filterType || filterStatus
                ? 'Try adjusting your filters'
                : 'Schedule the first event'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => {
                  const room = getRoom(evt.room_id);
                  const typeMeta = getTypeMeta(evt.type);
                  const statusMeta = getStatusMeta(evt.status);
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {new Date(evt.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {evt.start_time} – {evt.end_time}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{evt.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[280px]">
                          {evt.description || '—'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Flag className="w-2.5 h-2.5" />
                          {evt.organizer}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${typeMeta.color}`}
                        >
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {room?.room_number ?? '—'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {evt.expected_attendees} attendees
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusMeta.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(evt)}
                            className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(evt)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedEvent(null);
        }}
        maxWidth="max-w-2xl"
      >
        <div className={`relative px-6 py-5 bg-gradient-to-r ${formModalGradient}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">{formModalTitle}</h3>
              <p className="text-xs text-white/70 mt-0.5">
                Fill in the event details below
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <PremiumInput
            label="Event Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            placeholder="e.g., IT Week Opening Ceremony"
            required
            error={formErrors.title}
          />

          <PremiumTextarea
            label="Description (Optional)"
            value={form.description ?? ''}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="Brief description of the event..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PremiumDropdown
              label="Event Type"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v as EventType })}
              options={EVENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              required
            />
            <PremiumDropdown
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as EventStatus })}
              options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PremiumDropdown
              label="Room"
              value={form.room_id}
              onChange={(v) => setForm({ ...form, room_id: v })}
              options={roomOptions}
              placeholder="Select room"
              icon={Building2}
              required
              error={formErrors.room_id}
              searchable
            />
            <PremiumInput
              label="Date"
              type="date"
              value={form.date}
              onChange={(v) => setForm({ ...form, date: v })}
              required
              error={formErrors.date}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PremiumInput
              label="Start Time"
              type="time"
              value={form.start_time}
              onChange={(v) => setForm({ ...form, start_time: v })}
              required
            />
            <PremiumInput
              label="End Time"
              type="time"
              value={form.end_time}
              onChange={(v) => setForm({ ...form, end_time: v })}
              required
              error={formErrors.end_time}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PremiumInput
              label="Expected Attendees"
              type="number"
              value={form.expected_attendees}
              onChange={(v) => setForm({ ...form, expected_attendees: Number(v) })}
              placeholder="e.g., 100"
            />
            <PremiumInput
              label="Organizer"
              value={form.organizer}
              onChange={(v) => setForm({ ...form, organizer: v })}
              placeholder="e.g., Admin Juan Dela Cruz"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={showEditModal ? handleEditSubmit : handleCreateSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-3 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
              showEditModal
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-navy to-navy-dark'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {showEditModal ? 'Save Changes' : 'Schedule Event'}
          </button>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedEvent} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        {selectedEvent && (
          <>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Event?</h3>
              <p className="text-sm text-slate-500 mb-4">
                Are you sure you want to delete{' '}
                <strong className="text-slate-900">"{selectedEvent.title}"</strong>?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EventSchedule;