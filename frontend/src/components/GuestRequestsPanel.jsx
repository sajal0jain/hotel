import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  Filter, 
  Sparkles, 
  ShieldAlert,
  User,
  X,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { api } from '../api';

export default function GuestRequestsPanel({ requests, onRefreshRequests }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeReplyRequest, setActiveReplyRequest] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Filter requests
  const filtered = requests.filter(r => {
    if (statusFilter === 'escalated' && !r.escalated) return false;
    if (statusFilter !== 'all' && statusFilter !== 'escalated' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleResolve = async (reqId) => {
    await api.updateGuestRequest(reqId, { status: 'resolved' });
    onRefreshRequests();
  };

  const handleSetInProgress = async (reqId) => {
    await api.updateGuestRequest(reqId, { status: 'in_progress' });
    onRefreshRequests();
  };

  const handleSendReply = async () => {
    if (!activeReplyRequest || !replyText.trim()) return;
    setIsSending(true);
    try {
      if (activeReplyRequest.conversation_id) {
        await api.sendStaffReply(activeReplyRequest.conversation_id, replyText);
      }
      await api.updateGuestRequest(activeReplyRequest.id, {
        status: 'in_progress',
        notes: `${activeReplyRequest.notes}\n\n[Staff replied: "${replyText}"]`
      });
      setIsSending(false);
      setActiveReplyRequest(null);
      setReplyText('');
      onRefreshRequests();
    } catch (err) {
      setIsSending(false);
      alert('Failed to send staff reply: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-stone-700">Status:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'escalated', label: '🚨 Urgent Escalations' },
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-800 font-semibold outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="maintenance">Maintenance</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="food_beverage">Food & Beverage</option>
            <option value="inquiry">Inquiry / FAQ</option>
            <option value="billing">Billing</option>
            <option value="complaint">Complaint</option>
          </select>
        </div>
      </div>

      {/* Requests Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 shadow-sm space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto opacity-80" />
            <p className="text-sm font-bold text-stone-900">No requests found</p>
            <p className="text-xs text-stone-500 font-medium">All guest inquiries in this category have been attended to.</p>
          </div>
        ) : (
          filtered.map(req => {
            const isEscalated = req.escalated && req.status !== 'resolved';
            const isNegative = req.sentiment_score < -0.2;
            const isPositive = req.sentiment_score > 0.2;

            return (
              <div 
                key={req.id} 
                className={`p-5 rounded-2xl transition-all border ${
                  isEscalated 
                    ? 'border-rose-300 bg-rose-50/50 border-l-4 border-l-rose-600 shadow-sm' 
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Room Badge */}
                    <div className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-heading font-extrabold text-xs shadow-xs">
                      {req.room_number ? `Room ${req.room_number}` : 'Guest Inquiry'}
                    </div>

                    {/* Category */}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold capitalize">
                      {req.category?.replace('_', ' ')}
                    </span>

                    {/* Escalation Tag */}
                    {isEscalated && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-900 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Urgent Escalation
                      </span>
                    )}
                  </div>

                  {/* Sentiment & Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      {isPositive && <Smile className="w-4 h-4 text-emerald-600" />}
                      {isNegative && <Frown className="w-4 h-4 text-rose-600" />}
                      {!isPositive && !isNegative && <Meh className="w-4 h-4 text-stone-400" />}
                      <span className="text-stone-500 font-medium">Sentiment:</span>
                      <span className={`font-mono font-bold ${
                        isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-700' : 'text-stone-700'
                      }`}>
                        {req.sentiment_score > 0 ? `+${req.sentiment_score}` : req.sentiment_score}
                      </span>
                    </div>

                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold capitalize ${
                      req.status === 'resolved' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : req.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : isEscalated
                        ? 'bg-rose-200 text-rose-900 border border-rose-400 font-black'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Request Content / Notes */}
                <div className="py-3">
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold">
                    "{req.notes || 'Guest request received via WhatsApp.'}"
                  </p>
                  {req.escalation_reason && (
                    <p className="text-[11px] text-rose-800 mt-1 flex items-center gap-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                      <span>Trigger: {req.escalation_reason}</span>
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                  <span className="text-[11px] text-stone-500 font-medium">
                    Logged: {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {req.status !== 'resolved' && (
                      <>
                        <button
                          onClick={() => setActiveReplyRequest(req)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-bold transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply to WhatsApp</span>
                        </button>

                        {req.status === 'open' && (
                          <button
                            onClick={() => handleSetInProgress(req.id)}
                            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-all"
                          >
                            Mark In Progress
                          </button>
                        )}

                        <button
                          onClick={() => handleResolve(req.id)}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Staff Reply Modal */}
      {activeReplyRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-lg w-full p-6 space-y-4 border border-stone-200 border-t-4 border-t-blue-600 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Staff Reply to {activeReplyRequest.room_number ? `Room ${activeReplyRequest.room_number}` : 'Guest'}
              </h3>
              <button 
                onClick={() => setActiveReplyRequest(null)}
                className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
              <p className="text-[11px] text-stone-500 font-bold mb-1 uppercase tracking-wider">Guest Message:</p>
              <p className="font-medium italic">"{activeReplyRequest.notes}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Type Response (will be sent to Guest WhatsApp):</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Dear Guest, our maintenance manager has been dispatched and is at your door..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-medium outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveReplyRequest(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Send WhatsApp Message'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
