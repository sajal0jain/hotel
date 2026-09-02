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
  const total = occupancy?.total_rooms || rooms.length || 70;
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

  // Dynamic floors detection
  const detectedFloors = [...new Set(rooms.map(r => r.floor))].filter(Boolean).sort((a, b) => a - b);
  const floors = detectedFloors.length > 0 ? detectedFloors : [1, 2, 3, 4, 5, 6, 7];

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
        <div className="bg-white p-4 rounded-2xl border border-stone-200 border-t-2 border-t-teal-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Occupancy</p>
            <p className="font-heading text-2xl font-black text-stone-900">{occPct}%</p>
            <p className="text-[11px] text-stone-600 font-medium">{occupiedCount} of {total} booked</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 border-t-2 border-t-blue-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Occupied</p>
            <p className="font-heading text-2xl font-black text-blue-700">{occupiedCount}</p>
            <p className="text-[11px] text-stone-600 font-medium">Resident guests</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 border-t-2 border-t-emerald-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Clean & Ready</p>
            <p className="font-heading text-2xl font-black text-emerald-700">{cleanCount}</p>
            <p className="text-[11px] text-stone-600 font-medium">Ready for check-in</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 border-t-2 border-t-amber-500 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Dirty Turnaround</p>
            <p className="font-heading text-2xl font-black text-amber-700">{dirtyCount}</p>
            <p className="text-[11px] text-stone-600 font-medium">Housekeeping queue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 border-t-2 border-t-rose-600 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Maintenance</p>
            <p className="font-heading text-2xl font-black text-rose-700">{maintCount}</p>
            <p className="text-[11px] text-stone-600 font-medium">Out of order</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Floor & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-stone-700">Status:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'clean', 'occupied', 'dirty', 'maintenance'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st 
                    ? 'bg-teal-600 text-white font-bold shadow-sm' 
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-stone-700">Floor:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', ...floors].map(fl => (
              <button
                key={fl}
                onClick={() => setFloorFilter(fl.toString())}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  floorFilter === fl.toString()
                    ? 'bg-teal-600 text-white font-bold shadow-sm' 
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {fl === 'all' ? 'All Floors' : `Floor ${fl}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 70-Room Visual Grid by Floor */}
      <div className="space-y-6">
        {floors.map(floorNum => {
          const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
          if (floorRooms.length === 0 && floorFilter !== 'all') return null;

          const allFloorRooms = rooms.filter(r => r.floor === floorNum);
          const roomTypes = [...new Set(allFloorRooms.map(r => r.room_type))].join(' & ');
          const roomRange = allFloorRooms.length > 0 
            ? `Rooms ${allFloorRooms[0].room_number}-${allFloorRooms[allFloorRooms.length - 1].room_number}` 
            : `Floor ${floorNum}`;

          return (
            <div key={floorNum} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-teal-800">Floor {floorNum}</span>
                  <span className="text-xs text-stone-500 font-medium">
                    ({floorRooms.length} rooms)
                  </span>
                </div>
                <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                  {roomRange} ({roomTypes || 'Standard / Deluxe'})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
                {floorRooms.map(room => {
                  let statusBg = 'border-stone-200 bg-stone-50/60 hover:border-stone-400';
                  let statusText = 'text-stone-700';
                  let badgeClass = 'badge-clean';

                  if (room.status === 'occupied') {
                    statusBg = 'border-blue-200 bg-blue-50/70 hover:border-blue-400';
                    statusText = 'text-blue-900';
                    badgeClass = 'badge-occupied';
                  } else if (room.status === 'clean') {
                    statusBg = 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-400';
                    statusText = 'text-emerald-900';
                    badgeClass = 'badge-clean';
                  } else if (room.status === 'dirty') {
                    statusBg = 'border-amber-200 bg-amber-50/70 hover:border-amber-400';
                    statusText = 'text-amber-900';
                    badgeClass = 'badge-dirty';
                  } else if (room.status === 'maintenance') {
                    statusBg = 'border-rose-300 bg-rose-50/80 hover:border-rose-400';
                    statusText = 'text-rose-900';
                    badgeClass = 'badge-maintenance';
                  }

                  return (
                    <button
                      key={room.id}
                      onClick={() => handleOpenRoomModal(room)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 ${statusBg}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-heading font-extrabold text-base text-stone-900">{room.room_number}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${badgeClass}`}>
                          {room.status}
                        </span>
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <p className="text-[10px] text-stone-500 font-medium truncate">{room.room_type}</p>
                        <p className="text-[11px] font-bold text-teal-800">₹{room.base_rate.toLocaleString()}</p>
                      </div>

                      {room.notes && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-rose-700 truncate font-semibold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 space-y-5 border border-stone-200 border-t-4 border-t-teal-600 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-stone-900 flex items-center gap-2">
                  Room {selectedRoom.room_number}
                  <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-semibold">
                    {selectedRoom.room_type}
                  </span>
                </h3>
                <p className="text-xs text-stone-500 font-medium">Floor {selectedRoom.floor} • Heritage Boutique Wing</p>
              </div>
              <button 
                onClick={() => setSelectedRoom(null)}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700">Update Room Status:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'clean', label: 'Clean & Ready', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                  { id: 'occupied', label: 'Occupied (Resident)', bg: 'bg-blue-50 text-blue-800 border-blue-300' },
                  { id: 'dirty', label: 'Dirty (Housekeeping)', bg: 'bg-amber-50 text-amber-900 border-amber-300' },
                  { id: 'maintenance', label: 'Maintenance / Repair', bg: 'bg-rose-50 text-rose-900 border-rose-300' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setModalStatus(opt.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      modalStatus === opt.id 
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                        : `${opt.bg} hover:opacity-90`
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Base Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                Nightly Base Rate (₹):
              </label>
              <input
                type="number"
                value={modalRate}
                onChange={(e) => setModalRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-sm font-semibold outline-none focus:border-teal-600"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Housekeeping & Maintenance Notes:</label>
              <textarea
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="e.g. AC service required, extra bathrobes added, VIP arrival"
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium outline-none focus:border-teal-600"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoomModal}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95"
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
