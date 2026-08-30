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
  LogIn,
  BedDouble,
  FileText,
  Crown,
  Briefcase,
  BellRing,
  LayoutDashboard
} from 'lucide-react';

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    icon: Crown,
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  manager: {
    label: 'GM',
    icon: Briefcase,
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  front_desk: {
    label: 'Front Desk',
    icon: BellRing,
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  }
};

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  kpis, 
  occupancy, 
  onOpenDailyReport, 
  user, 
  onOpenLogin,
  onLogout, 
  onSwitchRole 
}) {
  const occRate = occupancy?.occupancy_pct ?? kpis?.occupancy_rate;
  const occRooms = occupancy?.occupied_rooms ?? kpis?.occupied_rooms;
  const totRooms = occupancy?.total_rooms ?? kpis?.total_rooms ?? 40;
  const revparVal = occupancy?.revpar ?? kpis?.revpar;
  const escalations = kpis?.escalated_requests_count ?? 0;

  const currentRoleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.owner;
  const RoleIcon = currentRoleConfig.icon;

  const handleRoleChange = (newRole) => {
    if (onSwitchRole) {
      onSwitchRole(newRole);
    }
    if (newRole === 'front_desk') {
      setActiveTab('operations');
    } else {
      setActiveTab('overview');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">{totRooms} Rooms</span>
              </div>
              <p className="text-xs text-slate-400">Hotel Guest Experience & Management Platform</p>
            </div>
          </div>

          {/* Real-time KPI Highlights (3 metrics only: Occupancy, RevPAR, Escalations) */}
          <div className="hidden lg:flex items-center gap-4">
            {/* 1. Occupancy */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-slate-400">Occupancy:</span>
              <span className="font-semibold text-emerald-400">
                {occRate !== undefined ? `${occRate}%` : '—'}
              </span>
              {occRooms !== undefined && (
                <span className="text-slate-500">
                  ({occRooms}/{totRooms})
                </span>
              )}
            </div>

            {/* 2. RevPAR */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-slate-400">RevPAR:</span>
              <span className="font-semibold text-blue-400">
                {revparVal !== undefined ? `₹${Math.round(revparVal).toLocaleString('en-IN')}` : '—'}
              </span>
            </div>

            {/* 3. Escalations */}
            {escalations > 0 ? (
              <button 
                onClick={() => setActiveTab('requests')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-xs text-red-300 animate-pulse-urgent font-medium hover:bg-red-500/25 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{escalations} Escalations</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>All Clear</span>
              </div>
            )}
          </div>

          {/* Actions & User Auth Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDailyReport}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-semibold shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Morning AI Report</span>
              <span className="sm:hidden">Report</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* User Pill & Role Switcher */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 shadow-sm">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${currentRoleConfig.badgeClass}`}>
                    <RoleIcon className="w-3 h-3" />
                  </div>
                  <select 
                    value={user?.role || 'owner'} 
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer font-medium hover:text-amber-300 transition-colors"
                  >
                    <option value="owner" className="bg-slate-900 text-white">Owner (Vikram)</option>
                    <option value="manager" className="bg-slate-900 text-white">GM (Pooja)</option>
                    <option value="front_desk" className="bg-slate-900 text-white">Front Desk (Aman)</option>
                  </select>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out of Portal"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-medium transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Smooth horizontal scrolling with flex-shrink-0) */}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 max-w-full flex-nowrap py-2.5 no-scrollbar border-t border-slate-800/40">
          {/* Overview Tab (Only for Owner and Manager) */}
          {user?.role !== 'front_desk' && (
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Executive Overview"
            />
          )}

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
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
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

