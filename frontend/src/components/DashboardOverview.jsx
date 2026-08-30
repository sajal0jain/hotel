/**
 * Example: wiring the top metric bar + status cards to live backend data.
 *
 * This isn't meant to replace your existing component wholesale — it shows
 * the pattern (hook -> loading/error handling -> render) so you can port
 * your existing JSX/styling into this structure. Swap the placeholder
 * markup below for your actual card components; keep the data-fetching
 * logic (useDashboardData, the loading/error branches).
 */
import { useDashboardData } from "../hooks/useDashboardData";

export default function DashboardOverview() {
  const { occupancy, roomStatus, loading, error, refresh } = useDashboardData();

  if (loading) {
    return <div className="p-6 text-slate-400">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Couldn't reach the backend ({error.message}).{" "}
        <button onClick={refresh} className="underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top metric bar: Occupancy / ADR / RevPAR */}
      <div className="flex gap-4">
        <MetricPill label="Occupancy" value={`${occupancy.occupancy_pct}%`} sub={`(${occupancy.occupied_rooms}/${occupancy.total_rooms})`} />
        <MetricPill label="ADR" value={`₹${occupancy.adr.toLocaleString("en-IN")}`} />
        <MetricPill label="RevPAR" value={`₹${occupancy.revpar.toLocaleString("en-IN")}`} />
      </div>

      {/* Room status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatusCard title="Occupancy Rate" value={`${occupancy.occupancy_pct}%`} sub={`${occupancy.occupied_rooms} of ${occupancy.total_rooms} booked`} />
        <StatusCard title="Occupied" value={roomStatus.occupied} sub="Resident guests" />
        <StatusCard title="Clean & Ready" value={roomStatus.clean_ready} sub="Available for check-in" />
        <StatusCard title="Dirty Turnaround" value={roomStatus.dirty_turnaround} sub="Housekeeping queue" />
        <StatusCard title="Maintenance" value={roomStatus.maintenance} sub="Out of order" />
      </div>
    </div>
  );
}

function MetricPill({ label, value, sub }) {
  return (
    <div className="glass-pill px-4 py-2 rounded-lg">
      <span className="text-slate-400 text-sm">{label}: </span>
      <span className="font-semibold">{value}</span>
      {sub && <span className="text-slate-400 text-sm ml-1">{sub}</span>}
    </div>
  );
}

function StatusCard({ title, value, sub }) {
  return (
    <div className="glass-card glass-card-hover p-5">
      <div className="text-slate-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-slate-500 text-xs">{sub}</div>
    </div>
  );
}
