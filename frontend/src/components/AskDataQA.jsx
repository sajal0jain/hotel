import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  DollarSign, 
  Users, 
  HelpCircle, 
  BarChart3, 
  PieChart, 
  Zap, 
  ArrowRight,
  MessageSquare,
  Bot
} from 'lucide-react';
import { api } from '../api';

const SAMPLE_QUERIES = [
  "Which OTA or booking channel is most profitable?",
  "Why is Tuesday occupancy lower than weekends?",
  "What was our highest revenue day this month?",
  "Are there any expense anomalies this month?",
  "Summarize guest reviews and top complaint clusters"
];

export default function AskDataQA() {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaResult, setQaResult] = useState(null);

  const handleAsk = async (queryToRun) => {
    const q = queryToRun || queryText;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await api.askData(q);
      setQaResult(res);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert('Error querying AI: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="glass-card p-6 sm:p-8 space-y-4 text-center relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-bold text-white">Ask Your Data AI</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Powered by Groq Llama 3.3 70B. Query occupancy trends, OTA channel margins, expense anomalies, and review insights in plain English.
          </p>
        </div>

        {/* Query Input Bar */}
        <div className="max-w-2xl mx-auto relative flex items-center mt-2">
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask anything (e.g. 'Why is Tuesday low?' or 'Which OTA gives best margin?')..."
            className="w-full pl-4 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-xs outline-none focus:border-amber-500 shadow-xl placeholder-slate-400"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !queryText.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Thinking...' : 'Ask AI'}</span>
          </button>
        </div>

        {/* Quick Sample Query Chips */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          <span className="text-[11px] text-slate-500 font-medium">Try asking:</span>
          {SAMPLE_QUERIES.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryText(sq);
                handleAsk(sq);
              }}
              className="px-3 py-1 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-300 transition-all flex items-center gap-1"
            >
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Answer Result Card */}
      {qaResult && (
        <div className="glass-card p-6 space-y-5 animate-fade-in border border-amber-500/30 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Operational Analysis for:</span>
                <p className="text-xs font-bold text-white">"{qaResult.query}"</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold capitalize">
              {qaResult.category?.replace('_', ' ')}
            </span>
          </div>

          {/* AI Plain Language Narrative Answer */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
            <p className="whitespace-pre-line">{qaResult.answer}</p>
          </div>

          {/* Dynamic Data Breakdown Visualizer */}
          {qaResult.data && Object.keys(qaResult.data).length > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <h4 className="font-heading text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Data Breakdown & Metrics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(qaResult.data).map(([key, val], i) => {
                  const isNumber = typeof val === 'number';
                  const maxVal = 100;
                  const pct = isNumber ? Math.min(val > 100 ? (val / 300000) * 100 : val, 100) : null;

                  return (
                    <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{key}</span>
                        <span className="font-bold text-amber-400">
                          {isNumber ? (val > 1000 ? `₹${Math.round(val).toLocaleString()}` : `${val}%`) : String(val)}
                        </span>
                      </div>
                      {isNumber && (
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Next Questions */}
          {qaResult.suggested_followups?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Suggested Follow-Up Inquiries:</span>
              <div className="flex flex-col sm:flex-row gap-2">
                {qaResult.suggested_followups.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQueryText(f);
                      handleAsk(f);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left text-xs text-slate-300 hover:text-amber-300 transition-all flex items-center justify-between gap-2 group flex-1"
                  >
                    <span>{f}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
