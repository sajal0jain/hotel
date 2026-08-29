import React from 'react';
import { 
  Sparkles, 
  X, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BedDouble, 
  DollarSign, 
  Smile, 
  Lightbulb,
  Printer
} from 'lucide-react';

export default function DailyReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-amber-500/40 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-heading text-xl font-bold text-white">Morning AI Executive Brief</h2>
            </div>
            <p className="text-xs text-slate-400">
              The Grand Heritage • {reportData.date || 'Today'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Core Metric KPI Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">Occupancy</span>
            <p className="font-heading text-xl font-bold text-emerald-400">{reportData.occupancy_rate}%</p>
            <span className="text-[10px] text-slate-500">{reportData.occupied_rooms} of {reportData.total_rooms} rooms</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">Yesterday Revenue</span>
            <p className="font-heading text-xl font-bold text-amber-400">₹{Math.round(reportData.yesterday_revenue).toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">Rooms + F&B + Spa</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">ADR</span>
            <p className="font-heading text-xl font-bold text-blue-400">₹{Math.round(reportData.adr).toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">Avg Daily Rate</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">RevPAR</span>
            <p className="font-heading text-xl font-bold text-purple-400">₹{Math.round(reportData.revpar).toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">Per Available Room</span>
          </div>
        </div>

        {/* Tactical AI Suggested Action Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-heading font-bold text-xs">
            <Lightbulb className="w-4 h-4" />
            <span>AI STRATEGIC REVENUE ACTION OF THE DAY</span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
            {reportData.ai_suggested_action}
          </p>
        </div>

        {/* Housekeeping & Operations Queue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-heading text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-blue-400" />
              Housekeeping Department Status
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-bold block">{reportData.housekeeping_summary?.clean || 8}</span>
                <span className="text-[10px] text-slate-400">Clean Ready</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 font-bold block">{reportData.housekeeping_summary?.dirty || 3}</span>
                <span className="text-[10px] text-slate-400">Dirty Queue</span>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="text-red-400 font-bold block">{reportData.housekeeping_summary?.maintenance || 1}</span>
                <span className="text-[10px] text-slate-400">Maintenance</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-heading text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-emerald-400" />
              Guest Sentiment & Experience Index
            </h4>
            <div className="space-y-1 text-xs">
              <p className="text-slate-300">
                <span className="text-slate-500 font-medium">Index: </span>
                <span className="font-bold text-emerald-400">{reportData.guest_sentiment_summary?.index || '+0.78 (Positive)'}</span>
              </p>
              <p className="text-slate-400 text-[11px] truncate">
                <span className="text-slate-500">Praise: </span>
                {reportData.guest_sentiment_summary?.top_praise}
              </p>
              <p className="text-slate-400 text-[11px] truncate">
                <span className="text-slate-500">Watch: </span>
                {reportData.guest_sentiment_summary?.top_complaint}
              </p>
            </div>
          </div>
        </div>

        {/* Key Highlights List */}
        <div className="space-y-2">
          <h4 className="font-heading text-xs font-bold text-slate-300">Key Daily Highlights:</h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {reportData.key_highlights?.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
