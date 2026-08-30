const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000' : '');

class ApiService {
  constructor() {
    this.token = localStorage.getItem('hotel_token') || '';
    this.currentUser = JSON.parse(localStorage.getItem('hotel_user') || 'null');
  }

  setAuth(token, user) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('hotel_token', token);
    localStorage.setItem('hotel_user', JSON.stringify(user));
  }

  logout() {
    this.token = '';
    this.currentUser = null;
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('hotel_user');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'API Error' }));
        throw new Error(errorData.detail || `Request failed with status ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Operations & 40-Room Matrix
  getRooms(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/operations/rooms${query ? `?${query}` : ''}`);
  }

  updateRoomStatus(roomId, data) {
    return this.request(`/api/operations/rooms/${roomId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  getReservations() {
    return this.request('/api/operations/reservations');
  }

  checkInReservation(resId, roomId) {
    return this.request(`/api/operations/reservations/${resId}/check-in${roomId ? `?room_id=${roomId}` : ''}`, {
      method: 'PUT'
    });
  }

  checkOutReservation(resId) {
    return this.request(`/api/operations/reservations/${resId}/check-out`, {
      method: 'PUT'
    });
  }

  // Concierge & Simulator
  simulateWhatsApp(data) {
    return this.request('/api/concierge/simulator', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getConversations() {
    return this.request('/api/concierge/conversations');
  }

  getConversationMessages(convId) {
    return this.request(`/api/concierge/conversations/${convId}/messages`);
  }

  sendStaffReply(conversationId, message) {
    return this.request('/api/concierge/reply', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, message })
    });
  }

  getGuestRequests(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/concierge/requests${query ? `?${query}` : ''}`);
  }

  updateGuestRequest(reqId, data) {
    return this.request(`/api/concierge/requests/${reqId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Analytics & Q&A
  getDashboardKPIs() {
    return this.request('/api/analytics/dashboard-kpis');
  }

  getTrends(days = 14) {
    return this.request(`/api/analytics/trends?days=${days}`);
  }

  getDailyReport() {
    return this.request('/api/analytics/daily-report');
  }

  askData(query) {
    return this.request('/api/analytics/ask-data', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  // Expenses & PnL
  getExpenses(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/expenses${query ? `?${query}` : ''}`);
  }

  uploadInvoice(formData) {
    const url = `${API_BASE}/api/expenses/upload`;
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
      }
    }).then(res => res.json());
  }

  getMonthlyPnL(month = '2026-08') {
    return this.request(`/api/expenses/pnl/${month}`);
  }

  // Reviews
  getReviews(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/reviews${query ? `?${query}` : ''}`);
  }

  getReviewStats() {
    return this.request('/api/reviews/stats');
  }

  draftReviewResponse(reviewId, customTone = 'empathetic and professional') {
    return this.request('/api/reviews/draft-response', {
      method: 'POST',
      body: JSON.stringify({ review_id: reviewId, custom_tone: customTone })
    });
  }

  approveReviewResponse(reviewId, responseText) {
    return this.request(`/api/reviews/${reviewId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ response_text: responseText })
    });
  }

  // Revenue Optimizer
  getRateRecommendations() {
    return this.request('/api/pricing/recommendations');
  }

  applyRateRecommendation(recId) {
    return this.request(`/api/pricing/apply/${recId}`, {
      method: 'POST'
    });
  }
}

export const api = new ApiService();
