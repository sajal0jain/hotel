import React from 'react';
import { 
  Building2, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle, 
  DollarSign, 
  Star, 
  BarChart3, 
  User, 
  LogOut,
  BedDouble,
  FileText
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, kpis, onOpenDailyReport, user, onLogout, onSwitchRole }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      {/* Top Brand & Live Ticker Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hotel Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold tracking-tight text-white">The Grand Heritage</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">40 Rooms</span>
              </div>
              <p className="text-xs text-slate-400">Hotel Guest Experience & Management Platform</p>
            </div>
          </div>

          {/* Real-time KPI Highlights (Hidden on small mobile) */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-slate-400">Occupancy:</span>
              <span className="font-semibold text-emerald-400">{kpis?.occupancy_rate || 72.5}%</span>
              <span className="text-slate-500">({kpis?.occupied_rooms || 29}/40)</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-slate-400">ADR:</span>
              <span className="font-semibold text-amber-400">₹{kpis?.adr ? Math.round(kpis.adr).toLocaleString() : '4,650'}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-slate-400">RevPAR:</span>
              <span className="font-semibold text-blue-400">₹{kpis?.revpar ? Math.round(kpis.revpar).toLocaleString() : '3,371'}</span>
            </div>

            {kpis?.escalated_requests_count > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-xs text-red-300 animate-pulse-urgent font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{kpis.escalated_requests_count} Escalations</span>
              </div>
            )}
          </div>

          {/* Actions & User Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDailyReport}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-semibold shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Morning AI Report</span>
            </button>

            {/* Role dropdown / selector */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <select 
                value={user?.role || 'owner'} 
                onChange={(e) => onSwitchRole(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer font-medium"
              >
                <option value="owner" className="bg-slate-900 text-white">Owner (Vikram)</option>
                <option value="manager" className="bg-slate-900 text-white">GM (Pooja)</option>
                <option value="front_desk" className="bg-slate-900 text-white">Front Desk (Aman)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/40">
          <TabButton 
            active={activeTab === 'operations'} 
            onClick={() => setActiveTab('operations')}
            icon={<BedDouble className="w-4 h-4" />}
            label="40-Room Matrix"
          />
          <TabButton 
            active={activeTab === 'concierge'} 
            onClick={() => setActiveTab('concierge')}
            icon={<MessageSquare className="w-4 h-4" />}
            label="WhatsApp Concierge"
            badge="Live Bot"
          />
          <TabButton 
            active={activeTab === 'requests'} 
            onClick={() => setActiveTab('requests')}
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Guest Requests"
            badge={kpis?.escalated_requests_count > 0 ? `${kpis.escalated_requests_count} alert` : null}
            badgeColor="red"
          />
          <TabButton 
            active={activeTab === 'qa'} 
            onClick={() => setActiveTab('qa')}
            icon={<Sparkles className="w-4 h-4" />}
            label="Ask Your Data AI"
          />
          <TabButton 
            active={activeTab === 'expenses'} 
            onClick={() => setActiveTab('expenses')}
            icon={<DollarSign className="w-4 h-4" />}
            label="Expense & P&L"
            badge="MoM Anomaly"
            badgeColor="amber"
          />
          <TabButton 
            active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
            icon={<Star className="w-4 h-4" />}
            label="Review Manager"
          />
          <TabButton 
            active={activeTab === 'pricing'} 
            onClick={() => setActiveTab('pricing')}
            icon={<TrendingUp className="w-4 h-4" />}
            label="Revenue Optimizer"
            badge="14D Forecast"
          />
        </div>
      </div>
    </header>
  );
}

function TabButton({ active, onClick, icon, label, badge, badgeColor = 'amber' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
        active 
          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
          badgeColor === 'red' 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}
