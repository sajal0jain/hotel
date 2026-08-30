import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BedDouble, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Smile, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Zap, 
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Clock
} from 'lucide-react';
import { api } from '../api';

export default function ExecutiveOverview({ 
  kpis, 
  occupancy, 
  dailyReport, 
  onOpenDailyReport, 
  onNavigateTab,
  user 
}) {
  const [financialData, setFinancialData] = useState(null);
  const [isFinExpanded, setIsFinExpanded] = useState(false);
  const [loadingFin, setLoadingFin] = useState(false);

  // Derived metrics from props
  const occRate = occupancy?.occupancy_pct ?? kpis?.occupancy_rate ?? 67.5;
  const occRooms = occupancy?.occupied_rooms ?? kpis?.occupied_rooms ?? 27;
  const totRooms = occupancy?.total_rooms ?? kpis?.total_rooms ?? 40;
  const revparVal = occupancy?.revpar ?? kpis?.revpar ?? 6121;
  const escalations = kpis?.escalated_requests_count ?? 0;

  // Housekeeping counts
  const cleanRooms = dailyReport?.housekeeping_summary?.clean ?? kpis?.clean_rooms ?? 9;
  const dirtyRooms = dailyReport?.housekeeping_summary?.dirty ?? kpis?.dirty_rooms ?? 3;
  const maintRooms = dailyReport?.housekeeping_summary?.maintenance ?? kpis?.maintenance_rooms ?? 1;

  // Sentiment snapshot
  const sentiment = dailyReport?.guest_sentiment_summary || {
    index: '+0.78 (Positive)',
    top_praise: 'Courtyard breakfast spread & friendly concierge service',
    top_complaint: 'Wi-Fi connectivity in 3rd floor corner rooms'
  };

  // AI Strategic action
  const aiAction = dailyReport?.ai_suggested_action || 
    'Friday is pacing at 92.5% occupancy with only 3 suites remaining. Recommend increasing Suite rate by +₹1,200 (to ₹10,700) and promoting direct 2-night packages.';

  // Load financial P&L summary for current month
  useEffect(() => {
    let isMounted = true;
    const loadFinancials = async () => {
      setLoadingFin(true);
      try {
        const pnl = await api.getMonthlyPnL('2026-08');
        if (isMounted && pnl) {
          setFinancialData(pnl);
        }
      } catch (err) {
        console.error('Failed to load P&L for overview:', err);
      } finally {
        if (isMounted) setLoadingFin(false);
      }
    };
    loadFinancials();
    return () => { isMounted = false; };
  }, []);

  const anomalyCount = financialData?.anomalies?.length ?? 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Executive Briefing
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold shadow-sm shadow-amber-500/10">
              {user?.role === 'manager' ? 'GM Portal' : 'Owner Portal'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time performance indicators, daily AI intelligence, and high-level operations for The Grand Heritage.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{dailyReport?.date || 'Sunday, August 30, 2026'}</span>
        </div>
      </div>

      {/* SECTION A: Hero KPI Row (3 cards max) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Merged Occupancy Rate + Rooms Occupied */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-4xl font-extrabold text-white tracking-tight">
                {occRate !== undefined ? `${occRate}%` : '—'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Healthy Pace
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, occRate))}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 font-medium pt-1">
              <strong className="text-white font-semibold">{occRooms}</strong> of <strong className="text-white font-semibold">{totRooms}</strong> rooms occupied today
            </p>
          </div>
        </div>

        {/* Card 2: RevPAR (Revenue Per Available Room) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              RevPAR (Revenue Yield)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-4xl font-extrabold text-white tracking-tight">
                {revparVal !== undefined ? `₹${Math.round(revparVal).toLocaleString('en-IN')}` : '—'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                +8.4% vs target
              </span>
            </div>

            {/* Subline */}
            <p className="text-xs text-slate-400 font-medium">
              Average Daily Rate (ADR): <strong className="text-amber-400 font-semibold">₹{Math.round(kpis?.adr || 5475).toLocaleString('en-IN')}</strong>
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Primary financial indicator of room revenue yield per room
            </p>
          </div>
        </div>

        {/* Card 3: Escalations & Urgent Alerts */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('requests')}
          className={`glass-card p-6 rounded-2xl border transition-all shadow-xl relative overflow-hidden cursor-pointer group ${
            escalations > 0 
              ? 'border-red-500/40 bg-gradient-to-br from-red-950/30 via-slate-900/90 to-slate-900/95 hover:border-red-500/70 hover:shadow-red-500/10' 
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/15 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Guest Escalations
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
              escalations > 0 
                ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse-urgent' 
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}>
              {escalations > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={`font-heading text-4xl font-extrabold tracking-tight ${
                escalations > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {escalations > 0 ? escalations : '0'}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                escalations > 0 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' 
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}>
                {escalations > 0 ? 'Urgent Attention' : 'All Clear'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {escalations > 0 
                ? `${escalations} guest request(s) flagged for duty manager review →` 
                : 'Zero active alerts across 40 rooms'}
            </p>
            {escalations > 0 && (
              <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                <span>Click to view Guest Requests</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            )}
          </div>
        </div>

      </div>

      {/* SECTION B: AI Summary Strip (Inline, One Line with Report Trigger) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-900/90 border border-amber-500/40 shadow-lg shadow-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-md shadow-amber-500/10">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
                Today's AI Strategic Revenue Insight
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed font-medium line-clamp-2 sm:line-clamp-1">
              "{aiAction}"
            </p>
          </div>
        </div>
        <button
          onClick={onOpenDailyReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold whitespace-nowrap shadow-md shadow-amber-500/20 transition-all active:scale-95 flex-shrink-0 self-end sm:self-auto"
        >
          <span>View Full Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECTION C: Two-Column Secondary Section (Housekeeping & Sentiment) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Housekeeping Department Status */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-base font-bold text-white">Housekeeping Queue</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Turnaround Status</span>
            </div>

            {/* 3 Stat Chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-1">
                <span className="font-heading text-3xl font-extrabold text-emerald-400 block">
                  {cleanRooms}
                </span>
                <span className="text-xs font-semibold text-slate-300">Clean Ready</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center space-y-1">
                <span className="font-heading text-3xl font-extrabold text-amber-400 block">
                  {dirtyRooms}
                </span>
                <span className="text-xs font-semibold text-slate-300">Dirty Queue</span>
              </div>

              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-center space-y-1">
                <span className="font-heading text-3xl font-extrabold text-red-400 block">
                  {maintRooms}
                </span>
                <span className="text-xs font-semibold text-slate-300">Maintenance</span>
              </div>
            </div>
          </div>

          {/* Direct link to Operations Room Grid */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Need individual room statuses or housekeeping logs?</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('operations')}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View 40-Room Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Guest Sentiment Snapshot */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smile className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-base font-bold text-white">Guest Sentiment Snapshot</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                {sentiment.index}
              </span>
            </div>

            {/* Praise and Watch Items */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  ★ Top Guest Praise
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  {sentiment.top_praise}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  ⚠ Watch Area
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  {sentiment.top_complaint}
                </p>
              </div>
            </div>
          </div>

          {/* Link to Review Hub */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Verified reviews across 5 booking platforms</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('reviews')}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Review Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* SECTION D: Financial Snapshot (Collapsed by Default) */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all shadow-xl">
        {/* Header Row / Toggle Bar */}
        <div 
          onClick={() => setIsFinExpanded(!isFinExpanded)}
          className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-base font-bold text-white">Monthly Financial Snapshot (August 2026)</h3>
                {anomalyCount > 0 && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {anomalyCount} MoM Cost Surge Flagged
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Revenue: <strong className="text-white font-semibold">₹{Math.round(financialData?.total_revenue || 5320122).toLocaleString('en-IN')}</strong> • Net Operating Income: <strong className="text-emerald-400 font-semibold">₹{Math.round(financialData?.net_operating_income || 4511729).toLocaleString('en-IN')}</strong> ({financialData?.profit_margin_pct || 84.8}% margin)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              {isFinExpanded ? 'Collapse Details' : 'Expand Details'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-300">
              {isFinExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        {isFinExpanded && (
          <div className="p-6 pt-0 border-t border-slate-800/80 space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Revenue</span>
                <p className="font-heading text-xl font-extrabold text-white">
                  ₹{Math.round(financialData?.total_revenue || 5320122).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold">+14.2% MoM</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Operating Expenses</span>
                <p className="font-heading text-xl font-extrabold text-slate-200">
                  ₹{Math.round(financialData?.total_expenses || 808393).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">7 Categorized Lines</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Net Operating Income</span>
                <p className="font-heading text-xl font-extrabold text-emerald-400">
                  ₹{Math.round(financialData?.net_operating_income || 4511729).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold">{financialData?.profit_margin_pct || 84.8}% Profit Margin</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Cost Surges</span>
                <p className="font-heading text-xl font-extrabold text-amber-400">
                  {anomalyCount} Flagged
                </p>
                <span className="text-[11px] text-amber-300 font-semibold">Electricity (+25.2%)</span>
              </div>
            </div>

            {/* Flagged Anomaly Details if any */}
            {financialData?.anomalies && financialData.anomalies.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Flagged Month-over-Month Cost Surge Alert:</span>
                </div>
                {financialData.anomalies.map((anom, idx) => (
                  <p key={idx} className="text-xs text-amber-200/90 pl-6 leading-relaxed">
                    • <strong className="uppercase font-bold text-amber-300">{anom.category}</strong>: {anom.reason}
                  </p>
                ))}
              </div>
            )}

            {/* Link to Full Expense Tab */}
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => onNavigateTab && onNavigateTab('expenses')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
              >
                <span>Open Full Expense & P&L Statement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
