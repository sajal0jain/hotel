/**
 * API client for the Hotel Platform backend.
 *
 * Set VITE_API_BASE_URL in a .env file at the frontend root if the backend
 * isn't running on the default http://localhost:8000, e.g.:
 *   VITE_API_BASE_URL=http://localhost:8000
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      // response wasn't JSON; leave body null
    }
    throw new ApiError(`Request to ${path} failed (${res.status})`, res.status, body);
  }

  // 204 No Content etc.
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // ---------- Dashboard ----------
  getOccupancyToday: () => request("/api/dashboard/occupancy-today"),
  getOccupancyTrend: (days = 7) => request(`/api/dashboard/occupancy-trend?days=${days}`),
  getRoomStatusSummary: () => request("/api/dashboard/room-status-summary"),

  // ---------- Rooms ----------
  listRooms: () => request("/api/rooms"),
  getRoom: (roomId) => request(`/api/rooms/${roomId}`),
  updateRoomStatus: (roomId, status) =>
    request(`/api/rooms/${roomId}/status?status=${status}`, { method: "PATCH" }),
  createRoom: (room) =>
    request("/api/rooms", { method: "POST", body: JSON.stringify(room) }),

  // ---------- Reservations ----------
  listReservations: () => request("/api/reservations"),
  getReservation: (reservationId) => request(`/api/reservations/${reservationId}`),
  createReservation: (reservation) =>
    request("/api/reservations", { method: "POST", body: JSON.stringify(reservation) }),
};

export { ApiError };
