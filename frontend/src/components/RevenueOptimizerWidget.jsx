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
      <div className="bg-white p-6 space-y-3 border border-stone-200 border-t-2 border-t-teal-600 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-stone-900">Dynamic Pricing & Revenue Optimizer</h2>
              <p className="text-xs text-stone-500 font-medium">14-Day Forward Occupancy Forecasting & Yield Recommendations</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-900 font-extrabold border border-teal-300 self-start sm:self-auto">
            Baseline ADR: ₹4,200
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-medium">
          The yield engine analyzes confirmed room bookings, day-of-week pickup pace, and seasonality patterns. 
          When weekend occupancy exceeds 85%, rates are increased to maximize RevPAR. During midweek slumps (&lt;58%), 
          rates are optimized to spur direct & OTA booking velocity.
        </p>
      </div>

      {/* 14-Day Forward Forecast Timeline Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-heading text-xs font-bold text-stone-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
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
                className={`p-2.5 rounded-xl border text-center space-y-1.5 transition-all shadow-xs ${
                  isSurge 
                    ? 'bg-teal-50 border-teal-300 text-teal-900'
                    : isLow
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <span className="text-[10px] text-stone-500 block uppercase font-bold">{dayName}</span>
                <span className="text-[11px] text-stone-900 font-extrabold block">{dayNum}</span>
                
                <div className="font-heading font-black text-xs">
                  {rec.occupancy_forecast}%
                </div>

                <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase block ${
                  isSurge ? 'bg-teal-200 text-teal-900' : isLow ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-700'
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
        <h3 className="font-heading text-sm font-bold text-stone-900">Upcoming Daily Pricing Recommendations:</h3>

        {recommendations.map(rec => {
          const delta = rec.recommended_rate - rec.current_rate;
          const isUp = delta > 0;
          const isDown = delta < 0;

          return (
            <div 
              key={rec.id} 
              className={`p-5 rounded-2xl border transition-all shadow-sm ${
                rec.applied 
                  ? 'border-emerald-300 bg-emerald-50/50' 
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[75px] shadow-xs">
                    <span className="text-[10px] text-stone-500 uppercase font-bold block">
                      {new Date(rec.date).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                    <span className="font-heading font-extrabold text-xs text-stone-900">
                      {new Date(rec.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-extrabold text-sm text-stone-900">
                        Recommended Rate: ₹{Math.round(rec.recommended_rate).toLocaleString()}
                      </span>
                      {delta !== 0 && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                          isUp ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isUp ? `+₹${Math.round(delta)}` : `-₹${Math.abs(Math.round(delta))}`}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 font-medium">
                      Current Rate: ₹{Math.round(rec.current_rate).toLocaleString()} • Projected Occupancy: <strong className="text-stone-900">{rec.occupancy_forecast}%</strong>
                    </p>
                  </div>
                </div>

                {/* Apply Button or Applied Status */}
                <div>
                  {rec.applied ? (
                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Rate Applied to Matrix</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(rec.id)}
                      disabled={applyingId === rec.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{applyingId === rec.id ? 'Applying...' : 'Apply Recommended Rate'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Economic Reasoning */}
              <div className="pt-3">
                <p className="text-xs text-stone-700 italic flex items-start gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
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
