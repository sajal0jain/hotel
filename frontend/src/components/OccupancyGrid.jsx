import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  UserCheck, 
  Filter, 
  Layers, 
  Sparkles, 
  Edit3, 
  X,
  Info,
  DollarSign
} from 'lucide-react';

export default function OccupancyGrid({ rooms = [], occupancy, roomStatus, onUpdateRoomStatus }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalRate, setModalRate] = useState(0);

  // Dynamic status counts
  const total = occupancy?.total_rooms || rooms.length || 40;
  const occupiedCount = roomStatus ? roomStatus.occupied : rooms.filter(r => r.status === 'occupied').length;
  const cleanCount = roomStatus ? roomStatus.clean_ready : rooms.filter(r => r.status === 'clean').length;
  const dirtyCount = roomStatus ? roomStatus.dirty_turnaround : rooms.filter(r => r.status === 'dirty').length;
  const maintCount = roomStatus ? roomStatus.maintenance : rooms.filter(r => r.status === 'maintenance').length;
  const occPct = occupancy?.occupancy_pct ?? (total > 0 ? Math.round((occupiedCount / total) * 100) : 0);

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    if (statusFilter !== 'all' && room.status !== statusFilter) return false;
    if (floorFilter !== 'all' && room.floor !== parseInt(floorFilter)) return false;
    return true;
  });

  // Group by floor
  const floors = [1, 2, 3, 4];

  const handleOpenRoomModal = (room) => {
    setSelectedRoom(room);
    setModalStatus(room.status);
    setModalNotes(room.notes || '');
    setModalRate(room.base_rate);
  };

  const handleSaveRoomModal = async () => {
    if (!selectedRoom) return;
    await onUpdateRoomStatus(selectedRoom.id, {
      status: modalStatus,
      notes: modalNotes,
      base_rate: parseFloat(modalRate)
    });
    setSelectedRoom(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Occupancy Rate</p>
            <p className="font-heading text-2xl font-bold text-white">{occPct}%</p>
            <p className="text-[11px] text-slate-500">{occupiedCount} of {total} booked</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Occupied</p>
            <p className="font-heading text-2xl font-bold text-blue-400">{occupiedCount}</p>
            <p className="text-[11px] text-slate-500">Resident guests</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Clean & Ready</p>
            <p className="font-heading text-2xl font-bold text-emerald-400">{cleanCount}</p>
            <p className="text-[11px] text-slate-500">Available for check-in</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Dirty Turnaround</p>
            <p className="font-heading text-2xl font-bold text-amber-400">{dirtyCount}</p>
            <p className="text-[11px] text-slate-500">Housekeeping queue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-xs text-slate-400 font-medium">Maintenance</p>
            <p className="font-heading text-2xl font-bold text-red-400">{maintCount}</p>
            <p className="text-[11px] text-slate-500">Out of order</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Floor & Status Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">Status:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'clean', 'occupied', 'dirty', 'maintenance'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  statusFilter === st 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Floor:</span>
          <div className="flex items-center gap-1.5">
            {['all', 1, 2, 3, 4].map(fl => (
              <button
                key={fl}
                onClick={() => setFloorFilter(fl.toString())}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  floorFilter === fl.toString()
                    ? 'bg-blue-500 text-white font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {fl === 'all' ? 'All Floors' : `Floor ${fl}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 40-Room Visual Grid by Floor */}
      <div className="space-y-6">
        {floors.map(floorNum => {
          const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
          if (floorRooms.length === 0 && floorFilter !== 'all') return null;

          return (
            <div key={floorNum} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-amber-400">Floor {floorNum}</span>
                  <span className="text-xs text-slate-500">
                    ({floorRooms.length} rooms)
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {floorNum === 1 && 'Rooms 101-110 (Standard & Deluxe)'}
                  {floorNum === 2 && 'Rooms 201-210 (Standard & Deluxe)'}
                  {floorNum === 3 && 'Rooms 301-310 (Deluxe & Executive)'}
                  {floorNum === 4 && 'Rooms 401-410 (Executive & Royal Suites)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
                {floorRooms.map(room => {
                  let statusBg = 'border-slate-800 bg-slate-900/40 hover:border-slate-700';
                  let statusText = 'text-slate-400';
                  let badgeClass = 'badge-clean';

                  if (room.status === 'occupied') {
                    statusBg = 'border-blue-500/30 bg-blue-500/10 hover:border-blue-400';
                    statusText = 'text-blue-300';
                    badgeClass = 'badge-occupied';
                  } else if (room.status === 'clean') {
                    statusBg = 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400';
                    statusText = 'text-emerald-300';
                    badgeClass = 'badge-clean';
                  } else if (room.status === 'dirty') {
                    statusBg = 'border-amber-500/30 bg-amber-500/10 hover:border-amber-400';
                    statusText = 'text-amber-300';
                    badgeClass = 'badge-dirty';
                  } else if (room.status === 'maintenance') {
                    statusBg = 'border-red-500/40 bg-red-500/15 hover:border-red-400 animate-pulse-urgent';
                    statusText = 'text-red-300';
                    badgeClass = 'badge-maintenance';
                  }

                  return (
                    <button
                      key={room.id}
                      onClick={() => handleOpenRoomModal(room)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group glass-card-hover ${statusBg}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-heading font-bold text-base text-white">{room.room_number}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${badgeClass}`}>
                          {room.status}
                        </span>
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <p className="text-[10px] text-slate-400 truncate">{room.room_type}</p>
                        <p className="text-[11px] font-semibold text-amber-400">₹{room.base_rate.toLocaleString()}</p>
                      </div>

                      {room.notes && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-red-300 truncate">
                          <Info className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{room.notes}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Detail & Status Update Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border border-amber-500/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  Room {selectedRoom.room_number}
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-normal">
                    {selectedRoom.room_type}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Floor {selectedRoom.floor} • Heritage Boutique Wing</p>
              </div>
              <button 
                onClick={() => setSelectedRoom(null)}
                className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Update Room Status:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'clean', label: 'Clean & Ready', color: 'border-emerald-500/40 text-emerald-400' },
                  { id: 'occupied', label: 'Occupied (Resident)', color: 'border-blue-500/40 text-blue-400' },
                  { id: 'dirty', label: 'Dirty (Housekeeping)', color: 'border-amber-500/40 text-amber-400' },
                  { id: 'maintenance', label: 'Maintenance / Repair', color: 'border-red-500/40 text-red-400' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setModalStatus(opt.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      modalStatus === opt.id 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' 
                        : `bg-slate-900/50 ${opt.color} hover:bg-slate-800`
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Base Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Nightly Base Rate (₹):
              </label>
              <input
                type="number"
                value={modalRate}
                onChange={(e) => setModalRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm outline-none focus:border-amber-500"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Housekeeping & Maintenance Notes:</label>
              <textarea
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="e.g. AC service required, extra bathrobes added, VIP arrival"
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoomModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Save Room Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
