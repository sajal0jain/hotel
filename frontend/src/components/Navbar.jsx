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
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  manager: {
    label: 'GM',
    icon: Briefcase,
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  front_desk: {
    label: 'Front Desk',
    icon: BellRing,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
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
  const totRooms = occupancy?.total_rooms ?? kpis?.total_rooms ?? 70;
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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 bg-white/95 backdrop-blur-xl shadow-sm">
      {/* Top Brand & Live Ticker Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hotel Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-bold">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold tracking-tight text-stone-900">Remedra Hotels and Residences</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 border border-teal-300 text-teal-800 font-semibold">{totRooms} Rooms</span>
              </div>
              <p className="text-xs text-stone-500">Hotel Guest Experience & Management Platform</p>
            </div>
          </div>

          {/* Real-time KPI Highlights (3 metrics: Occupancy, RevPAR, Escalations) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* 1. Occupancy */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs shadow-sm">
              <span className="text-stone-500 font-medium">Occupancy:</span>
              <span className="font-bold text-emerald-700">
                {occRate !== undefined ? `${occRate}%` : '—'}
              </span>
              {occRooms !== undefined && (
                <span className="text-stone-400 font-medium">
                  ({occRooms}/{totRooms})
                </span>
              )}
            </div>

            {/* 2. RevPAR */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs shadow-sm">
              <span className="text-stone-500 font-medium">RevPAR:</span>
              <span className="font-bold text-blue-700">
                {revparVal !== undefined ? `₹${Math.round(revparVal).toLocaleString('en-IN')}` : '—'}
              </span>
            </div>

            {/* 3. Escalations */}
            {escalations > 0 ? (
              <button 
                onClick={() => setActiveTab('requests')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-800 font-bold animate-pulse-urgent shadow-sm hover:bg-rose-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{escalations} Escalations</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="font-medium">All Clear</span>
              </div>
            )}
          </div>

          {/* Actions & User Auth Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDailyReport}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-teal-100" />
              <span className="hidden sm:inline">Morning AI Report</span>
              <span className="sm:hidden">Report</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* User Pill & Role Switcher */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 shadow-sm">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${currentRoleConfig.badgeClass}`}>
                    <RoleIcon className="w-3 h-3" />
                  </div>
                  <select 
                    value={user?.role || 'owner'} 
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="bg-transparent text-xs text-stone-800 outline-none cursor-pointer font-semibold hover:text-teal-700 transition-colors"
                  >
                    <option value="owner">Owner (Vikram)</option>
                    <option value="manager">GM (Pooja)</option>
                    <option value="front_desk">Front Desk (Aman)</option>
                  </select>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out of Portal"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-300 text-stone-600 hover:text-rose-700 text-xs font-medium transition-all shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 max-w-full flex-nowrap py-2.5 no-scrollbar border-t border-stone-200/80">
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
            label="70-Room Matrix"
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
            badgeColor="teal"
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

function TabButton({ active, onClick, icon, label, badge, badgeColor = 'teal' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
        active 
          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/90'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
          active 
            ? 'bg-white/20 text-white' 
            : badgeColor === 'red' 
              ? 'bg-rose-100 text-rose-700 border border-rose-300' 
              : 'bg-teal-100 text-teal-800 border border-teal-300'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}
