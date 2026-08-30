import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExecutiveOverview from './components/ExecutiveOverview';
import OccupancyGrid from './components/OccupancyGrid';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import GuestRequestsPanel from './components/GuestRequestsPanel';
import AskDataQA from './components/AskDataQA';
import ExpensePnLView from './components/ExpensePnLView';
import ReviewHub from './components/ReviewHub';
import RevenueOptimizerWidget from './components/RevenueOptimizerWidget';
import DailyReportModal from './components/DailyReportModal';
import LoginModal from './components/LoginModal';
import { useDashboardData } from './hooks/useDashboardData';
import { api } from './api';
import { Lock, Sparkles, User, LogIn, Crown, ShieldCheck } from 'lucide-react';

export default function App() {
  // Initialize from persisted localStorage session
  const [currentUser, setCurrentUser] = useState(() => {
    return api.currentUser || {
      id: 1,
      name: 'Vikramaditya Rathore',
      email: 'owner@grandheritage.com',
      role: 'owner'
    };
  });

  const [activeTab, setActiveTab] = useState(() => {
    const role = (api.currentUser || { role: 'owner' }).role;
    return role === 'front_desk' ? 'operations' : 'overview';
  });

  const { occupancy, roomStatus, rooms, loading, error, refresh } = useDashboardData();

  const [kpis, setKpis] = useState(null);
  const [requests, setRequests] = useState([]);
  const [dailyReport, setDailyReport] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const loadAuxData = async () => {
    try {
      const [kpisData, reqsData, reportData] = await Promise.all([
        api.getDashboardKPIs().catch(() => null),
        api.getGuestRequests().catch(() => []),
        api.getDailyReport().catch(() => null)
      ]);
      if (kpisData) setKpis(kpisData);
      if (reqsData) setRequests(reqsData);
      if (reportData) setDailyReport(reportData);
    } catch (err) {
      console.error('Failed to load auxiliary data:', err);
    }
  };

  useEffect(() => {
    loadAuxData();
  }, []);

  const handleRefreshAll = async () => {
    await Promise.all([refresh(), loadAuxData()]);
  };

  const handleUpdateRoomStatus = async (roomId, data) => {
    try {
      await api.updateRoomStatus(roomId, data);
      await handleRefreshAll();
    } catch (err) {
      alert('Failed to update room: ' + err.message);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsLoginOpen(true);
  };

  const handleSwitchRole = async (newRole) => {
    let email = 'owner@grandheritage.com';
    if (newRole === 'manager') email = 'manager@grandheritage.com';
    else if (newRole === 'front_desk') email = 'frontdesk@grandheritage.com';

    try {
      const res = await api.login(email, 'heritage2026');
      api.setAuth(res.access_token, res.user);
      setCurrentUser(res.user);
      setActiveTab(res.user.role === 'front_desk' ? 'operations' : 'overview');
      await handleRefreshAll();
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab(user?.role === 'front_desk' ? 'operations' : 'overview');
    handleRefreshAll();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpis={kpis}
        occupancy={occupancy}
        onOpenDailyReport={() => setIsReportOpen(true)}
        user={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />

      {/* Unauthenticated / Guest Welcome Bar */}
      {!currentUser && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>You are currently viewing in <strong>Guest Preview Mode</strong>. Sign in for full staff & owner operations.</span>
            </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Demo Login</span>
            </button>
          </div>
        </div>
      )}

      {/* Backend connection / error alert banner if needed */}
      {error && !occupancy && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
            <span>Could not connect to live backend ({error.message}).</span>
            <button
              onClick={handleRefreshAll}
              className="px-3 py-1 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-400"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Module Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            kpis={kpis}
            occupancy={occupancy}
            dailyReport={dailyReport}
            onOpenDailyReport={() => setIsReportOpen(true)}
            onNavigateTab={setActiveTab}
            user={currentUser}
          />
        )}

        {activeTab === 'operations' && (
          <OccupancyGrid
            rooms={rooms}
            occupancy={occupancy}
            roomStatus={roomStatus}
            onUpdateRoomStatus={handleUpdateRoomStatus}
          />
        )}

        {activeTab === 'concierge' && (
          <WhatsAppSimulator
            onRequestCreated={() => handleRefreshAll()}
          />
        )}

        {activeTab === 'requests' && (
          <GuestRequestsPanel
            requests={requests}
            onRefreshRequests={() => handleRefreshAll()}
          />
        )}

        {activeTab === 'qa' && (
          <AskDataQA />
        )}

        {activeTab === 'expenses' && (
          <ExpensePnLView />
        )}

        {activeTab === 'reviews' && (
          <ReviewHub />
        )}

        {activeTab === 'pricing' && (
          <RevenueOptimizerWidget
            onRateApplied={() => handleRefreshAll()}
          />
        )}
      </main>

      {/* Daily Morning AI Report Modal */}
      <DailyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={dailyReport}
      />

      {/* Login / Switcher Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>The Grand Heritage Boutique Hotel &copy; 2026 • 40 Rooms Unified Intelligence</span>
          <span className="text-[11px] text-amber-500/80">Groq Llama 3.3 70B & WhatsApp Concierge Connected</span>
        </div>
      </footer>
    </div>
  );
}

