import React, { useState } from 'react';
import { Building2, Lock, Mail, Shield, User, X, Sparkles } from 'lucide-react';
import { api } from '../api';

const DEMO_ACCOUNTS = [
  { role: 'owner', name: 'Vikramaditya Rathore (Hotel Owner)', email: 'owner@grandheritage.com', password: 'heritage2026' },
  { role: 'manager', name: 'Pooja Sharma (General Manager)', email: 'manager@grandheritage.com', password: 'heritage2026' },
  { role: 'front_desk', name: 'Aman Verma (Front Desk Staff)', email: 'frontdesk@grandheritage.com', password: 'heritage2026' }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('owner@grandheritage.com');
  const [password, setPassword] = useState('heritage2026');
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
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 space-y-6 border border-amber-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Staff & Owner Portal</h3>
              <p className="text-xs text-slate-400">The Grand Heritage Boutique Hotel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Quick Demo Accounts */}
        <div className="space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Quick 1-Click Demo Login:</span>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                onClick={() => handleLogin(acc.email, acc.password)}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left text-xs text-slate-200 hover:text-amber-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">{acc.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  Login
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3 pt-2 border-t border-slate-800">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">Email Address</label>
            <div className="flex items-center px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">Password</label>
            <div className="flex items-center px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
