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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-stone-200 border-t-4 border-t-amber-600 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-stone-900">Morning AI Executive Brief</h2>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              The Grand Heritage • {reportData.date || 'Today'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Core Metric KPI Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Occupancy</span>
            <p className="font-heading text-2xl font-black text-emerald-700">{reportData.occupancy_rate}%</p>
            <span className="text-[10px] text-stone-600 font-medium">{reportData.occupied_rooms} of {reportData.total_rooms} rooms</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Yesterday Rev</span>
            <p className="font-heading text-2xl font-black text-amber-700">₹{Math.round(reportData.yesterday_revenue).toLocaleString()}</p>
            <span className="text-[10px] text-stone-600 font-medium">Rooms + F&B + Spa</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">ADR</span>
            <p className="font-heading text-2xl font-black text-blue-700">₹{Math.round(reportData.adr).toLocaleString()}</p>
            <span className="text-[10px] text-stone-600 font-medium">Avg Daily Rate</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">RevPAR</span>
            <p className="font-heading text-2xl font-black text-purple-700">₹{Math.round(reportData.revpar).toLocaleString()}</p>
            <span className="text-[10px] text-stone-600 font-medium">Per Available Room</span>
          </div>
        </div>

        {/* Tactical AI Suggested Action Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-50/60 to-white border border-amber-300 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 font-heading font-extrabold text-xs tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>AI STRATEGIC REVENUE ACTION OF THE DAY</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold">
            {reportData.ai_suggested_action}
          </p>
        </div>

        {/* Housekeeping & Operations Queue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
            <h4 className="font-heading text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-blue-600" />
              Housekeeping Department Status
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-100/70 border border-emerald-300">
                <span className="text-emerald-800 font-black text-lg block">{reportData.housekeeping_summary?.clean || 8}</span>
                <span className="text-[10px] text-emerald-900 font-bold">Clean</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-100/70 border border-amber-300">
                <span className="text-amber-800 font-black text-lg block">{reportData.housekeeping_summary?.dirty || 3}</span>
                <span className="text-[10px] text-amber-900 font-bold">Dirty</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-100/70 border border-rose-300">
                <span className="text-rose-800 font-black text-lg block">{reportData.housekeeping_summary?.maintenance || 1}</span>
                <span className="text-[10px] text-rose-900 font-bold">Maint</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
            <h4 className="font-heading text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-emerald-600" />
              Guest Sentiment Index
            </h4>
            <div className="space-y-1.5 text-xs">
              <p className="text-stone-800 font-semibold">
                <span className="text-stone-500 font-medium">Index: </span>
                <span className="font-black text-emerald-700">{reportData.guest_sentiment_summary?.index || '+0.78 (Positive)'}</span>
              </p>
              <p className="text-stone-700 text-[11px] truncate">
                <strong className="text-emerald-700">Praise: </strong>
                {reportData.guest_sentiment_summary?.top_praise}
              </p>
              <p className="text-stone-700 text-[11px] truncate">
                <strong className="text-amber-700">Watch: </strong>
                {reportData.guest_sentiment_summary?.top_complaint}
              </p>
            </div>
          </div>
        </div>

        {/* Key Highlights List */}
        <div className="space-y-2">
          <h4 className="font-heading text-xs font-bold text-stone-900">Key Daily Highlights:</h4>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {reportData.key_highlights?.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
