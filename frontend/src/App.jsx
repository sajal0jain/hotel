import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OccupancyGrid from './components/OccupancyGrid';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import GuestRequestsPanel from './components/GuestRequestsPanel';
import AskDataQA from './components/AskDataQA';
import ExpensePnLView from './components/ExpensePnLView';
import ReviewHub from './components/ReviewHub';
import RevenueOptimizerWidget from './components/RevenueOptimizerWidget';
import DailyReportModal from './components/DailyReportModal';
import LoginModal from './components/LoginModal';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('operations');
  const [rooms, setRooms] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [requests, setRequests] = useState([]);
  const [dailyReport, setDailyReport] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(api.currentUser || {
    id: 1,
    name: 'Vikramaditya Rathore',
    email: 'owner@grandheritage.com',
    role: 'owner'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [roomsData, kpisData, reqsData, reportData] = await Promise.all([
        api.getRooms(),
        api.getDashboardKPIs(),
        api.getGuestRequests(),
        api.getDailyReport()
      ]);
      setRooms(roomsData);
      setKpis(kpisData);
      setRequests(reqsData);
      setDailyReport(reportData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleUpdateRoomStatus = async (roomId, data) => {
    try {
      await api.updateRoomStatus(roomId, data);
      await loadAllData();
    } catch (err) {
      alert('Failed to update room: ' + err.message);
    }
  };

  const handleSwitchRole = (newRole) => {
    let name = 'Vikramaditya Rathore (Owner)';
    let email = 'owner@grandheritage.com';
    if (newRole === 'manager') {
      name = 'Pooja Sharma (GM)';
      email = 'manager@grandheritage.com';
    } else if (newRole === 'front_desk') {
      name = 'Aman Verma (Front Desk)';
      email = 'frontdesk@grandheritage.com';
    }
    const updated = { id: 1, name, email, role: newRole };
    setCurrentUser(updated);
    api.setAuth('demo_token', updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpis={kpis}
        onOpenDailyReport={() => setIsReportOpen(true)}
        user={currentUser}
        onLogout={() => setIsLoginOpen(true)}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main Module Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'operations' && (
          <OccupancyGrid
            rooms={rooms}
            onUpdateRoomStatus={handleUpdateRoomStatus}
          />
        )}

        {activeTab === 'concierge' && (
          <WhatsAppSimulator
            onRequestCreated={() => loadAllData()}
          />
        )}

        {activeTab === 'requests' && (
          <GuestRequestsPanel
            requests={requests}
            onRefreshRequests={() => loadAllData()}
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
            onRateApplied={() => loadAllData()}
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
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadAllData();
        }}
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
