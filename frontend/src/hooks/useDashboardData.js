import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

/**
 * Fetches occupancy-today, room-status-summary, and rooms in parallel.
 * Returns { data, loading, error, refresh }.
 *
 * Poll or call `refresh()` after actions (e.g. after a room status change)
 * to keep the dashboard in sync — this scaffold doesn't set up websockets,
 * so it's pull-based for now.
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
      const [occupancy, roomStatus, rooms] = await Promise.all([
        api.getOccupancyToday(),
        api.getRoomStatusSummary(),
        api.listRooms(),
      ]);
      setData({ occupancy, roomStatus, rooms });
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
