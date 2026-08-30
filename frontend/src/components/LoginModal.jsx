import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Shield, 
  User, 
  X, 
  Sparkles, 
  Eye, 
  EyeOff, 
  LogIn, 
  Crown, 
  Briefcase, 
  BellRing,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

const DEMO_ACCOUNTS = [
  { 
    role: 'owner', 
    name: 'Vikramaditya Rathore', 
    title: 'Hotel Owner & Investor',
    email: 'owner@grandheritage.com', 
    password: 'heritage2026',
    icon: Crown,
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    description: 'Full executive access • P&L anomaly audit • Dynamic pricing strategy • Executive AI briefs'
  },
  { 
    role: 'manager', 
    name: 'Pooja Sharma', 
    title: 'General Manager',
    email: 'manager@grandheritage.com', 
    password: 'heritage2026',
    icon: Briefcase,
    badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    description: 'Operations control • Staff management • Housekeeping turnover • Review AI replies'
  },
  { 
    role: 'front_desk', 
    name: 'Aman Verma', 
    title: 'Front Desk Lead',
    email: 'frontdesk@grandheritage.com', 
    password: 'heritage2026',
    icon: BellRing,
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    description: '40-Room matrix • Live WhatsApp concierge • Urgent escalation resolution • Check-in/out'
  }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('owner@grandheritage.com');
  const [password, setPassword] = useState('heritage2026');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (customEmail = null, customPass = null) => {
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    setLoading(true);
    setError('');
    try {
      const res = await api.login(loginEmail, loginPass);
      api.setAuth(res.access_token, res.user);
      setLoading(false);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleSelectDemo = (acc) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword(acc.password);
    handleLogin(acc.email, acc.password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative glass-card max-w-lg w-full p-6 sm:p-8 space-y-6 border border-amber-500/30 shadow-2xl rounded-2xl bg-slate-900/95 overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 text-slate-950 font-bold">
              <Building2 className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-white tracking-tight">Staff & Owner Portal</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  JWT Auth
                </span>
              </div>
              <p className="text-xs text-slate-400">The Grand Heritage Boutique Hotel (40 Rooms)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Role Accounts Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              1-Click Demo Profiles
            </span>
            <span className="text-[10px] text-slate-500">Auto-injects role JWT</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const IconComp = acc.icon;
              const isCurrent = email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  disabled={loading}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-3 group relative overflow-hidden ${
                    isCurrent 
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5' 
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${acc.badgeColor}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-100 group-hover:text-amber-300 transition-colors">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({acc.title})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {acc.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition-all flex items-center gap-1">
                      <span>Login</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Or Enter Credentials</span>
            <span className="text-[11px] text-slate-500 font-mono">Password: heritage2026</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium block">Email Address</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 gap-2.5 transition-all">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. owner@grandheritage.com"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium block">Password</label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 gap-2.5 transition-all">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-1 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{loading ? 'Verifying Credentials...' : 'Sign In with JWT'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
