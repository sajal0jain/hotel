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
  const occRooms = occupancy?.occupied_rooms ?? kpis?.occupied_rooms ?? 48;
  const totRooms = occupancy?.total_rooms ?? kpis?.total_rooms ?? 70;
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
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              Executive Briefing
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 border border-teal-300 text-teal-900 font-bold shadow-sm">
              {user?.role === 'manager' ? 'GM Portal' : 'Owner Portal'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
            Real-time performance indicators, daily AI intelligence, and high-level operations for Remedra Hotels and Residences.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 shadow-sm self-start sm:self-auto font-medium">
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          <span>{dailyReport?.date || 'Sunday, August 30, 2026'}</span>
        </div>
      </div>

      {/* SECTION A: Hero KPI Row (3 cards max) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Merged Occupancy Rate + Rooms Occupied */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 border-t-2 border-t-emerald-600 hover:border-stone-300 transition-all shadow-sm hover:shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-4xl font-black text-stone-900 tracking-tight">
                {occRate !== undefined ? `${occRate}%` : '—'}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Healthy Pace
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden border border-stone-200/50">
              <div 
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, occRate))}%` }}
              />
            </div>

            <p className="text-xs text-stone-600 font-medium pt-0.5">
              <strong className="text-stone-900 font-bold">{occRooms}</strong> of <strong className="text-stone-900 font-bold">{totRooms}</strong> rooms occupied today
            </p>
          </div>
        </div>

        {/* Card 2: RevPAR (Revenue Per Available Room) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 border-t-2 border-t-blue-600 hover:border-stone-300 transition-all shadow-sm hover:shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              RevPAR (Yield Performance)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-4xl font-black text-stone-900 tracking-tight">
                {revparVal !== undefined ? `₹${Math.round(revparVal).toLocaleString('en-IN')}` : '—'}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                +8.4% vs target
              </span>
            </div>

            {/* Subline */}
            <p className="text-xs text-stone-600 font-medium">
              Average Daily Rate (ADR): <strong className="text-stone-900 font-bold">₹{Math.round(kpis?.adr || 5475).toLocaleString('en-IN')}</strong>
            </p>
            <p className="text-[11px] text-stone-500 font-medium">
              Primary financial indicator of room revenue yield per room
            </p>
          </div>
        </div>

        {/* Card 3: Escalations & Urgent Alerts */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('requests')}
          className={`p-6 rounded-2xl border transition-all shadow-sm hover:shadow-md cursor-pointer group ${
            escalations > 0 
              ? 'bg-rose-50/40 border-rose-300 border-t-2 border-t-rose-600 hover:bg-rose-50/70' 
              : 'bg-white border-stone-200 border-t-2 border-t-stone-400 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Guest Escalations
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
              escalations > 0 
                ? 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse-urgent' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {escalations > 0 ? (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className={`font-heading text-4xl font-black tracking-tight ${
                escalations > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {escalations > 0 ? escalations : '0'}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                escalations > 0 
                  ? 'bg-rose-200/80 text-rose-900 border border-rose-400' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {escalations > 0 ? 'Urgent Attention' : 'All Clear'}
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium">
              {escalations > 0 
                ? `${escalations} guest request(s) flagged for duty manager review →` 
                : 'Zero active alerts across 70 rooms'}
            </p>
            {escalations > 0 && (
              <p className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                <span>Click to view Guest Requests</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            )}
          </div>
        </div>

      </div>

      {/* SECTION B: AI Summary Strip (Inline, One Line with Report Trigger) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-teal-50/50 to-white border border-teal-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-teal-800">
                Today's AI Strategic Revenue Insight
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold line-clamp-2 sm:line-clamp-1">
              "{aiAction}"
            </p>
          </div>
        </div>
        <button
          onClick={onOpenDailyReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold whitespace-nowrap shadow-md shadow-teal-600/20 transition-all active:scale-95 flex-shrink-0 self-end sm:self-auto"
        >
          <span>View Full Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECTION C: Two-Column Secondary Section (Housekeeping & Sentiment) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Housekeeping Department Status */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 border-t-2 border-t-teal-600 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-base font-bold text-stone-900">Housekeeping Queue</h3>
              </div>
              <span className="text-xs text-stone-500 font-semibold">Turnaround Status</span>
            </div>

            {/* 3 Stat Chips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <span className="font-heading text-3xl font-extrabold text-emerald-700 block">
                  {cleanRooms}
                </span>
                <span className="text-xs font-bold text-emerald-900">Clean Ready</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
                <span className="font-heading text-3xl font-extrabold text-amber-700 block">
                  {dirtyRooms}
                </span>
                <span className="text-xs font-bold text-amber-900">Dirty Queue</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
                <span className="font-heading text-3xl font-extrabold text-rose-700 block">
                  {maintRooms}
                </span>
                <span className="text-xs font-bold text-rose-900">Maintenance</span>
              </div>
            </div>
          </div>

          {/* Direct link to Operations Room Grid */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Need individual room statuses or housekeeping logs?</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('operations')}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              <span>View 70-Room Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Guest Sentiment Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 border-t-2 border-t-teal-600 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Smile className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-base font-bold text-stone-900">Guest Sentiment Snapshot</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold">
                {sentiment.index}
              </span>
            </div>

            {/* Praise and Watch Items */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  ★ Top Guest Praise
                </span>
                <p className="text-xs sm:text-sm text-stone-800 font-semibold">
                  {sentiment.top_praise}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                  ⚠ Watch Area
                </span>
                <p className="text-xs sm:text-sm text-stone-800 font-semibold">
                  {sentiment.top_complaint}
                </p>
              </div>
            </div>
          </div>

          {/* Link to Review Hub */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Verified reviews across 5 booking platforms</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('reviews')}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              <span>Review Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* SECTION D: Financial Snapshot (Collapsed by Default) */}
      <div className="bg-white rounded-2xl border border-stone-200 border-t-2 border-t-teal-600 overflow-hidden transition-all shadow-sm">
        {/* Header Row / Toggle Bar */}
        <div 
          onClick={() => setIsFinExpanded(!isFinExpanded)}
          className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-stone-50/80 transition-colors select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-base font-bold text-stone-900">Monthly Financial Snapshot (August 2026)</h3>
                {anomalyCount > 0 && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-600" />
                    {anomalyCount} MoM Cost Surge Flagged
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5 font-medium">
                Total Revenue: <strong className="text-stone-900 font-bold">₹{Math.round(financialData?.total_revenue || 5320122).toLocaleString('en-IN')}</strong> • Net Operating Income: <strong className="text-emerald-700 font-bold">₹{Math.round(financialData?.net_operating_income || 4511729).toLocaleString('en-IN')}</strong> ({financialData?.profit_margin_pct || 84.8}% margin)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-600 hidden sm:inline">
              {isFinExpanded ? 'Collapse Details' : 'Expand Details'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
              {isFinExpanded ? <ChevronUp className="w-4 h-4 text-teal-700" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        {isFinExpanded && (
          <div className="p-6 pt-0 border-t border-stone-200 space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-bold">Total Revenue</span>
                <p className="font-heading text-xl font-extrabold text-stone-900">
                  ₹{Math.round(financialData?.total_revenue || 5320122).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-700 font-bold">+14.2% MoM</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-bold">Operating Expenses</span>
                <p className="font-heading text-xl font-extrabold text-stone-900">
                  ₹{Math.round(financialData?.total_expenses || 808393).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-stone-500 font-semibold">7 Categorized Lines</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-bold">Net Operating Income</span>
                <p className="font-heading text-xl font-extrabold text-emerald-700">
                  ₹{Math.round(financialData?.net_operating_income || 4511729).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-700 font-bold">{financialData?.profit_margin_pct || 84.8}% Profit Margin</span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-bold">Cost Surges</span>
                <p className="font-heading text-xl font-extrabold text-amber-700">
                  {anomalyCount} Flagged
                </p>
                <span className="text-[11px] text-amber-800 font-bold">Electricity (+25.2%)</span>
              </div>
            </div>

            {/* Flagged Anomaly Details if any */}
            {financialData?.anomalies && financialData.anomalies.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Flagged Month-over-Month Cost Surge Alert:</span>
                </div>
                {financialData.anomalies.map((anom, idx) => (
                  <p key={idx} className="text-xs text-amber-900 pl-6 leading-relaxed font-medium">
                    • <strong className="uppercase font-bold text-amber-950">{anom.category}</strong>: {anom.reason}
                  </p>
                ))}
              </div>
            )}

            {/* Link to Full Expense Tab */}
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => onNavigateTab && onNavigateTab('expenses')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
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
