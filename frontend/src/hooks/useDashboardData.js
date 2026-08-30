import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

/**
 * Fetches live room data + KPIs and shapes them into the `occupancy` /
 * `roomStatus` / `rooms` props that OccupancyGrid and Navbar expect.
 *
 * Uses api.js (the real client matching backend/routers/*.py) — NOT
 * api/client.js, which pointed at endpoints (/api/rooms, /api/dashboard/*)
 * that don't exist in this backend. Rooms live under /api/operations/rooms,
 * and KPIs (occupancy/ADR/RevPAR/room-status counts) come from the
 * already-built /api/analytics/dashboard-kpis endpoint.
 *
 * Poll or call `refresh()` after actions (e.g. after a room status change)
 * to keep the dashboard in sync.
 */
export function useDashboardData() {
  const [data, setData] = useState({
    occupancy: null,
    roomStatus: null,
    rooms: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpis, rooms] = await Promise.all([
        api.getDashboardKPIs(),
        api.getRooms(),
      ]);

      setData({
        occupancy: {
          total_rooms: kpis.total_rooms,
          occupancy_pct: kpis.occupancy_rate,
          adr: kpis.adr,
          revpar: kpis.revpar,
          room_revenue_today: kpis.room_revenue,
        },
        roomStatus: {
          occupied: kpis.occupied_rooms,
          clean_ready: kpis.clean_rooms,
          dirty_turnaround: kpis.dirty_rooms,
          maintenance: kpis.maintenance_rooms,
        },
        rooms,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refresh: fetchAll };
}
