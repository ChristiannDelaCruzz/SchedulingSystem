// src/pages/Admin/Rooms.tsx
import React, { useState, useMemo } from 'react';
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Building2,
  Users,
  AirVent,
  Projector,
  Monitor,
  Wrench,
  Archive,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { usePersistentState } from '../../hooks/usePersistentState';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import PremiumDropdown from '../../components/ui/PremiumDropdown';
import Modal from '../../components/ui/Modal';
import { mockRooms } from '../../mocks/rooms';
import type { Room } from '../../types';

const ROOM_TYPES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'computer_laboratory', label: 'Computer Laboratory' },
  { value: 'science_laboratory', label: 'Science Laboratory' },
  { value: 'lecture_hall', label: 'Lecture Hall' },
  { value: 'auditorium', label: 'Auditorium' },
  { value: 'conference_room', label: 'Conference Room' },
];

const ROOM_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'unavailable', label: 'Unavailable' },
];

const getRoomTypeLabel = (v: string) =>
  ROOM_TYPES.find((t) => t.value === v)?.label || v;

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
}> = ({ icon: Icon, label, value, color, subtitle }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
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
  icon?: React.ElementType;
  required?: boolean;
  error?: string;
  helperText?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', icon: Icon, required, error, helperText }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white border-2 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan hover:border-slate-300 transition-all ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
        }`}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
  </div>
);

const FeatureToggle: React.FC<{
  label: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, icon: Icon, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
      checked
        ? 'border-cyan bg-cyan-50 text-cyan-900'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`}
  >
    <Icon className={`w-4 h-4 flex-shrink-0 ${checked ? 'text-cyan-600' : 'text-slate-400'}`} />
    <span className="flex-1 text-sm font-semibold">{label}</span>
    <div
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300'
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
  </button>
);

interface RoomForm {
  roomNumber: string;
  building: string;
  floor: number | null;
  roomType: Room['room_type'];
  capacity: number;
  status: Room['status'];
  hasAircon: boolean;
  hasProjector: boolean;
  hasComputers: boolean;
}

const emptyForm: RoomForm = {
  roomNumber: '',
  building: '',
  floor: null,
  roomType: 'classroom',
  capacity: 40,
  status: 'available',
  hasAircon: false,
  hasProjector: false,
  hasComputers: false,
};

export const Rooms: React.FC = () => {
  const { showToast } = useToast();

  const [rooms, setRooms, resetRooms] = usePersistentState<Room[]>(
    'smart_sched_rooms',
    mockRooms.map((r) => ({ ...r }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.room_number.toLowerCase().includes(q) ||
          r.building.toLowerCase().includes(q) ||
          r.room_type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterType && r.room_type !== filterType) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      return true;
    });
  }, [rooms, searchQuery, filterType, filterStatus]);

  const stats = useMemo(() => {
    const active = rooms.filter((r) => r.is_active);
    return {
      total: active.length,
      available: active.filter((r) => r.status === 'available').length,
      occupied: active.filter((r) => r.status === 'occupied').length,
      maintenance: active.filter((r) => r.status === 'maintenance').length,
      totalCapacity: active.reduce((s, r) => s + r.capacity, 0),
    };
  }, [rooms]);

  const activeFiltersCount = (filterType ? 1 : 0) + (filterStatus ? 1 : 0);

  const resetFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setSearchQuery('');
  };

  const handleCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setForm({
      roomNumber: room.room_number,
      building: room.building,
      floor: room.floor,
      roomType: room.room_type,
      capacity: room.capacity,
      status: room.status,
      hasAircon: room.has_aircon,
      hasProjector: room.has_projector,
      hasComputers: room.has_computers,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleView = (room: Room) => {
    setSelectedRoom(room);
    setShowViewModal(true);
  };

  const handleDeleteClick = (room: Room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.roomNumber.trim()) e.roomNumber = 'Room number is required';
    if (!form.building.trim()) e.building = 'Building is required';
    if (!form.capacity || form.capacity < 1) e.capacity = 'Capacity must be at least 1';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      room_number: form.roomNumber,
      building: form.building,
      floor: form.floor,
      room_type: form.roomType,
      capacity: form.capacity,
      status: form.status,
      has_aircon: form.hasAircon,
      has_projector: form.hasProjector,
      has_computers: form.hasComputers,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setRooms((prev) => [...prev, newRoom]);
    showToast('success', 'Room Created', `${form.roomNumber} has been added.`);
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  const handleEditSubmit = () => {
    if (!selectedRoom || !validate()) return;
    setIsSubmitting(true);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              room_number: form.roomNumber,
              building: form.building,
              floor: form.floor,
              room_type: form.roomType,
              capacity: form.capacity,
              status: form.status,
              has_aircon: form.hasAircon,
              has_projector: form.hasProjector,
              has_computers: form.hasComputers,
            }
          : r
      )
    );
    showToast('success', 'Room Updated', `${form.roomNumber} has been updated.`);
    setShowEditModal(false);
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedRoom) return;
    setIsSubmitting(true);
    setRooms((prev) =>
      prev.map((r) => (r.id === selectedRoom.id ? { ...r, is_active: false } : r))
    );
    showToast('success', 'Room Archived', `${selectedRoom.room_number} has been archived.`);
    setShowDeleteModal(false);
    setIsSubmitting(false);
  };

  const handleRestore = (room: Room) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, is_active: true } : r))
    );
    showToast('success', 'Room Restored', `${room.room_number} is now active.`);
  };

  const handleReset = () => {
    resetRooms();
    showToast('info', 'Rooms Reset', 'Restored to default mock data.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Rooms</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage classrooms, laboratories, and room facilities
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
          <Button
            onClick={() => setShowFilterPanel((v) => !v)}
            variant="outline"
            className="relative"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white bg-cyan-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Add Room
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DoorOpen}
          label="Total Rooms"
          value={stats.total}
          color="bg-cyan-50 text-cyan-600"
          subtitle={`${stats.totalCapacity} total seats`}
        />
        <StatCard
          icon={Check}
          label="Available"
          value={stats.available}
          color="bg-emerald-50 text-emerald-600"
          subtitle={`${Math.round((stats.available / Math.max(stats.total, 1)) * 100)}% of total`}
        />
        <StatCard
          icon={Users}
          label="Occupied"
          value={stats.occupied}
          color="bg-blue-50 text-blue-600"
          subtitle="In use now"
        />
        <StatCard
          icon={Wrench}
          label="Maintenance"
          value={stats.maintenance}
          color="bg-amber-50 text-amber-600"
          subtitle={stats.maintenance > 0 ? 'Under repair' : 'All good'}
        />
      </div>

      {showFilterPanel && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan to-navy flex items-center justify-center shadow-sm">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Filter Rooms</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} match
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PremiumDropdown
                label="Room Type"
                value={filterType}
                onChange={setFilterType}
                options={ROOM_TYPES}
                placeholder="All types"
                icon={DoorOpen}
              />
              <PremiumDropdown
                label="Status"
                value={filterStatus}
                onChange={setFilterStatus}
                options={ROOM_STATUSES}
                placeholder="All statuses"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                {filteredRooms.length} of {rooms.length} rooms
              </p>
              <button
                onClick={resetFilters}
                disabled={activeFiltersCount === 0 && !searchQuery}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Card noPadding>
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room number, building, or type..."
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

        {filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No rooms found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your filters or search term'
                : 'Create your first room to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Features</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => {
                  const isArchived = !room.is_active;
                  const statusColors: Record<string, string> = {
                    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    occupied: 'bg-blue-50 text-blue-700 border-blue-200',
                    maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
                    unavailable: 'bg-red-50 text-red-700 border-red-200',
                  };
                  return (
                    <tr key={room.id} className={`transition-colors ${isArchived ? 'bg-slate-50/70' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isArchived ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'}`}>
                            <DoorOpen className={`w-5 h-5 ${isArchived ? 'text-slate-400' : 'text-cyan-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-bold ${isArchived ? 'text-slate-500' : 'text-slate-900'}`}>{room.room_number}</p>
                              {isArchived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                  <Archive className="w-2.5 h-2.5" />
                                  ARCHIVED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {room.building}{room.floor ? ` · Floor ${room.floor}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 font-medium">{getRoomTypeLabel(room.room_type)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{room.capacity} seats</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {room.has_aircon && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 border border-blue-200" title="Air-conditioned">
                              <AirVent className="w-3.5 h-3.5 text-blue-600" />
                            </span>
                          )}
                          {room.has_projector && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-purple-50 border border-purple-200" title="Projector">
                              <Projector className="w-3.5 h-3.5 text-purple-600" />
                            </span>
                          )}
                          {room.has_computers && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 border border-amber-200" title="Computers">
                              <Monitor className="w-3.5 h-3.5 text-amber-600" />
                            </span>
                          )}
                          {!room.has_aircon && !room.has_projector && !room.has_computers && (
                            <span className="text-xs text-slate-400">No features</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isArchived ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                            <Archive className="w-3 h-3" />
                            ARCHIVED
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[room.status] || statusColors.available}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {room.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isArchived ? (
                            <>
                              <button
                                onClick={() => handleRestore(room)}
                                className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all inline-flex items-center gap-1.5 text-xs font-semibold"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Restore
                              </button>
                              <button
                                onClick={() => handleView(room)}
                                className="p-2 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleView(room)}
                                className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 transition-all"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(room)}
                                className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(room)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                                title="Archive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

      {/* CREATE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="max-w-lg">
        <div className="relative px-6 py-5 bg-gradient-to-r from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Create New Room</h3>
              <p className="text-xs text-white/70 mt-0.5">Add a room to the system</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput
              label="Room Number"
              value={form.roomNumber}
              onChange={(v) => setForm({ ...form, roomNumber: v })}
              placeholder="e.g., 101"
              required
              error={formErrors.roomNumber}
              icon={DoorOpen}
            />
            <PremiumInput
              label="Building"
              value={form.building}
              onChange={(v) => setForm({ ...form, building: v })}
              placeholder="e.g., Main Building"
              required
              error={formErrors.building}
              icon={Building2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PremiumInput
              label="Floor (Optional)"
              type="number"
              value={form.floor ?? ''}
              onChange={(v) => setForm({ ...form, floor: v ? Number(v) : null })}
              placeholder="e.g., 2"
            />
            <PremiumInput
              label="Capacity"
              type="number"
              value={form.capacity}
              onChange={(v) => setForm({ ...form, capacity: Number(v) })}
              required
              error={formErrors.capacity}
              icon={Users}
            />
          </div>

          <PremiumDropdown
            label="Room Type"
            value={form.roomType}
            onChange={(v) => setForm({ ...form, roomType: v as Room['room_type'] })}
            options={ROOM_TYPES}
            required
          />

          <PremiumDropdown
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v as Room['status'] })}
            options={ROOM_STATUSES}
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Facilities
            </label>
            <div className="space-y-2">
              <FeatureToggle label="Air-conditioned" icon={AirVent} checked={form.hasAircon} onChange={(v) => setForm({ ...form, hasAircon: v })} />
              <FeatureToggle label="Has Projector" icon={Projector} checked={form.hasProjector} onChange={(v) => setForm({ ...form, hasProjector: v })} />
              <FeatureToggle label="Has Computers" icon={Monitor} checked={form.hasComputers} onChange={(v) => setForm({ ...form, hasComputers: v })} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={() => setShowCreateModal(false)}
            className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create Room
          </button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={showEditModal && !!selectedRoom} onClose={() => setShowEditModal(false)} maxWidth="max-w-lg">
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">Edit Room</h3>
              <p className="text-xs text-white/80 mt-0.5">Update {selectedRoom?.room_number}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Room Number" value={form.roomNumber} onChange={(v) => setForm({ ...form, roomNumber: v })} required error={formErrors.roomNumber} icon={DoorOpen} />
            <PremiumInput label="Building" value={form.building} onChange={(v) => setForm({ ...form, building: v })} required error={formErrors.building} icon={Building2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Floor (Optional)" type="number" value={form.floor ?? ''} onChange={(v) => setForm({ ...form, floor: v ? Number(v) : null })} />
            <PremiumInput label="Capacity" type="number" value={form.capacity} onChange={(v) => setForm({ ...form, capacity: Number(v) })} required error={formErrors.capacity} icon={Users} />
          </div>
          <PremiumDropdown label="Room Type" value={form.roomType} onChange={(v) => setForm({ ...form, roomType: v as Room['room_type'] })} options={ROOM_TYPES} required />
          <PremiumDropdown label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v as Room['status'] })} options={ROOM_STATUSES} required />
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Facilities</label>
            <div className="space-y-2">
              <FeatureToggle label="Air-conditioned" icon={AirVent} checked={form.hasAircon} onChange={(v) => setForm({ ...form, hasAircon: v })} />
              <FeatureToggle label="Has Projector" icon={Projector} checked={form.hasProjector} onChange={(v) => setForm({ ...form, hasProjector: v })} />
              <FeatureToggle label="Has Computers" icon={Monitor} checked={form.hasComputers} onChange={(v) => setForm({ ...form, hasComputers: v })} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleEditSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </Modal>

      {/* VIEW MODAL */}
      <Modal isOpen={showViewModal && !!selectedRoom} onClose={() => setShowViewModal(false)} maxWidth="max-w-md">
        <div className="relative px-6 py-8 bg-gradient-to-br from-navy to-navy-dark">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/20">
              <DoorOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-white min-w-0">
              <h3 className="text-xl font-bold">{selectedRoom?.room_number}</h3>
              <p className="text-sm text-white/70 mt-0.5">
                {selectedRoom?.building}{selectedRoom?.floor ? ` · Floor ${selectedRoom.floor}` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</p>
              <p className="text-sm font-bold text-slate-900">{selectedRoom && getRoomTypeLabel(selectedRoom.room_type)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Capacity</p>
              <p className="text-sm font-bold text-slate-900">{selectedRoom?.capacity} seats</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm font-bold text-slate-900 uppercase">{selectedRoom?.status}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {selectedRoom?.has_aircon && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                  <AirVent className="w-3.5 h-3.5" /> Air-conditioned
                </span>
              )}
              {selectedRoom?.has_projector && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700">
                  <Projector className="w-3.5 h-3.5" /> Projector
                </span>
              )}
              {selectedRoom?.has_computers && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                  <Monitor className="w-3.5 h-3.5" /> Computers
                </span>
              )}
              {!selectedRoom?.has_aircon && !selectedRoom?.has_projector && !selectedRoom?.has_computers && (
                <p className="text-xs text-slate-400 italic">No additional facilities</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          {selectedRoom?.is_active ? (
            <button
              onClick={() => {
                setShowViewModal(false);
                if (selectedRoom) handleEdit(selectedRoom);
              }}
              className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <button
              onClick={() => {
                setShowViewModal(false);
                if (selectedRoom) handleRestore(selectedRoom);
              }}
              className="flex-1 py-3 bg-white border-2 border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Restore
            </button>
          )}
          <button onClick={() => setShowViewModal(false)} className="flex-1 py-3 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
            Close
          </button>
        </div>
      </Modal>

      {/* ARCHIVE MODAL */}
      <Modal isOpen={showDeleteModal && !!selectedRoom} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Archive Room?</h3>
          <p className="text-sm text-slate-500 mb-1">Are you sure you want to archive</p>
          <p className="text-sm font-bold text-slate-900 mb-4">{selectedRoom?.room_number} ({selectedRoom?.building})?</p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
            <p className="font-bold mb-1">⚠️ This will:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Hide the room from active lists</li>
              <li>Preserve historical schedules</li>
              <li>Allow restoring anytime</li>
            </ul>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleDeleteConfirm} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            Archive Room
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Rooms;