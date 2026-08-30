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
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">Status:</span>
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
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === st.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none cursor-pointer"
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
          <div className="glass-card p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
            <p className="text-sm font-semibold text-slate-300">No requests found</p>
            <p className="text-xs text-slate-500">All guest inquiries in this category have been attended to.</p>
          </div>
        ) : (
          filtered.map(req => {
            const isEscalated = req.escalated && req.status !== 'resolved';
            const isNegative = req.sentiment_score < -0.2;
            const isPositive = req.sentiment_score > 0.2;

            return (
              <div 
                key={req.id} 
                className={`glass-card p-5 transition-all border ${
                  isEscalated 
                    ? 'border-red-500/50 bg-red-950/15 shadow-lg shadow-red-500/5' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Room Badge */}
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-heading font-bold text-xs">
                      {req.room_number ? `Room ${req.room_number}` : 'Guest Inquiry'}
                    </div>

                    {/* Category */}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium capitalize">
                      {req.category?.replace('_', ' ')}
                    </span>

                    {/* Escalation Tag */}
                    {isEscalated && (
                      <span className="badge badge-escalated animate-pulse-urgent">
                        <AlertTriangle className="w-3 h-3" />
                        Urgent Escalation
                      </span>
                    )}
                  </div>

                  {/* Sentiment & Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      {isPositive && <Smile className="w-4 h-4 text-emerald-400" />}
                      {isNegative && <Frown className="w-4 h-4 text-red-400" />}
                      {!isPositive && !isNegative && <Meh className="w-4 h-4 text-slate-400" />}
                      <span className="text-slate-400">Sentiment:</span>
                      <span className={`font-mono font-bold ${
                        isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-300'
                      }`}>
                        {req.sentiment_score > 0 ? `+${req.sentiment_score}` : req.sentiment_score}
                      </span>
                    </div>

                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                      req.status === 'resolved' 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : req.status === 'in_progress'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : isEscalated
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Request Content / Notes */}
                <div className="py-3">
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{req.notes || 'Guest request received via WhatsApp.'}"
                  </p>
                  {req.escalation_reason && (
                    <p className="text-[11px] text-red-300 mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Trigger: {req.escalation_reason}</span>
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
                  <span className="text-[11px] text-slate-500">
                    Logged: {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {req.status !== 'resolved' && (
                      <>
                        <button
                          onClick={() => setActiveReplyRequest(req)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-semibold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply to WhatsApp</span>
                        </button>

                        {req.status === 'open' && (
                          <button
                            onClick={() => handleSetInProgress(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                          >
                            Mark In Progress
                          </button>
                        )}

                        <button
                          onClick={() => handleResolve(req.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Staff Reply to {activeReplyRequest.room_number ? `Room ${activeReplyRequest.room_number}` : 'Guest'}
              </h3>
              <button 
                onClick={() => setActiveReplyRequest(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <p className="text-[11px] text-slate-500 font-semibold mb-1">Guest Message:</p>
              <p className="italic">"{activeReplyRequest.notes}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Type Response (will be sent to Guest WhatsApp):</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Dear Guest, our maintenance manager has been dispatched and is at your door..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveReplyRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
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
