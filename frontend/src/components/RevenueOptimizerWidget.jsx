import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Info,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../api';

export default function RevenueOptimizerWidget({ onRateApplied }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await api.getRateRecommendations();
      setRecommendations(recs);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Failed to load pricing recommendations:', err);
    }
  };

  const handleApply = async (recId) => {
    setApplyingId(recId);
    try {
      await api.applyRateRecommendation(recId);
      setApplyingId(null);
      await loadRecommendations();
      if (onRateApplied) onRateApplied();
    } catch (err) {
      setApplyingId(null);
      alert('Failed to apply rate: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="glass-card p-6 space-y-3 border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Dynamic Pricing & Revenue Optimizer</h2>
              <p className="text-xs text-slate-400">14-Day Forward Occupancy Forecasting & Yield Recommendations</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            Baseline ADR: ₹4,200
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The yield engine analyzes confirmed room bookings, day-of-week pickup pace, and seasonality patterns. 
          When weekend occupancy exceeds 85%, rates are increased to maximize RevPAR. During midweek slumps (&lt;58%), 
          rates are optimized to spur direct & OTA booking velocity.
        </p>
      </div>

      {/* 14-Day Forward Forecast Timeline Bar */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-heading text-xs font-bold text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          14-Day Occupancy Forecast Curve
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-7 lg:grid-cols-14 gap-2">
          {recommendations.map((rec) => {
            const dateObj = new Date(rec.date);
            const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
            const dayNum = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });
            const isSurge = rec.demand_level === 'surge';
            const isLow = rec.demand_level === 'low';

            return (
              <div 
                key={rec.id} 
                className={`p-2.5 rounded-xl border text-center space-y-1.5 transition-all ${
                  isSurge 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : isLow
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-400 block uppercase font-bold">{dayName}</span>
                <span className="text-[11px] text-white font-bold block">{dayNum}</span>
                
                <div className="font-heading font-bold text-xs">
                  {rec.occupancy_forecast}%
                </div>

                <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase block ${
                  isSurge ? 'bg-amber-500/30 text-amber-200' : isLow ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {rec.demand_level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Rate Cards List */}
      <div className="space-y-3">
        <h3 className="font-heading text-sm font-bold text-white">Upcoming Daily Pricing Recommendations:</h3>

        {recommendations.map(rec => {
          const delta = rec.recommended_rate - rec.current_rate;
          const isUp = delta > 0;
          const isDown = delta < 0;

          return (
            <div 
              key={rec.id} 
              className={`glass-card p-5 border transition-all ${
                rec.applied 
                  ? 'border-emerald-500/40 bg-emerald-950/10' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[70px]">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {new Date(rec.date).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                    <span className="font-heading font-bold text-xs text-white">
                      {new Date(rec.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-white">
                        Recommended Rate: ₹{Math.round(rec.recommended_rate).toLocaleString()}
                      </span>
                      {delta !== 0 && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                          isUp ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isUp ? `+₹${Math.round(delta)}` : `-₹${Math.abs(Math.round(delta))}`}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Current Rate: ₹{Math.round(rec.current_rate).toLocaleString()} • Projected Occupancy: <strong className="text-white">{rec.occupancy_forecast}%</strong>
                    </p>
                  </div>
                </div>

                {/* Apply Button or Applied Status */}
                <div>
                  {rec.applied ? (
                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Rate Applied to Matrix</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(rec.id)}
                      disabled={applyingId === rec.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{applyingId === rec.id ? 'Applying...' : 'Apply Recommended Rate'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Economic Reasoning */}
              <div className="pt-3">
                <p className="text-xs text-slate-300 italic flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{rec.reasoning}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
