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
      <div className="bg-white p-6 sm:p-8 space-y-4 text-center border border-stone-200 border-t-2 border-t-amber-600 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto shadow-sm">
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-bold text-stone-900">Ask Your Data AI</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto font-medium">
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
            className="w-full pl-4 pr-28 py-3.5 rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold outline-none focus:border-amber-600 shadow-inner placeholder-stone-400"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !queryText.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Thinking...' : 'Ask AI'}</span>
          </button>
        </div>

        {/* Quick Sample Query Chips */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          <span className="text-[11px] text-stone-500 font-bold">Try asking:</span>
          {SAMPLE_QUERIES.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryText(sq);
                handleAsk(sq);
              }}
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-[11px] text-stone-700 hover:text-amber-900 font-semibold transition-all flex items-center gap-1"
            >
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Answer Result Card */}
      {qaResult && (
        <div className="bg-white p-6 sm:p-8 space-y-5 animate-fade-in border border-stone-200 border-t-4 border-t-amber-600 rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold">Operational Analysis for:</span>
                <p className="text-xs font-extrabold text-stone-900">"{qaResult.query}"</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold capitalize">
              {qaResult.category?.replace('_', ' ')}
            </span>
          </div>

          {/* AI Plain Language Narrative Answer */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold">
            <p className="whitespace-pre-line">{qaResult.answer}</p>
          </div>

          {/* Dynamic Data Breakdown Visualizer */}
          {qaResult.data && Object.keys(qaResult.data).length > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h4 className="font-heading text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Data Breakdown & Metrics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(qaResult.data).map(([key, val], i) => {
                  const isNumber = typeof val === 'number';
                  const maxVal = 100;
                  const pct = isNumber ? Math.min(val > 100 ? (val / 300000) * 100 : val, 100) : null;

                  return (
                    <div key={i} className="p-3 rounded-lg bg-white border border-stone-200 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-600 font-medium">{key}</span>
                        <span className="font-extrabold text-amber-800">
                          {isNumber ? (val > 1000 ? `₹${Math.round(val).toLocaleString()}` : `${val}%`) : String(val)}
                        </span>
                      </div>
                      {isNumber && (
                        <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                          <div 
                            className="h-full bg-amber-600"
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
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Suggested Follow-Up Inquiries:</span>
              <div className="flex flex-col sm:flex-row gap-2">
                {qaResult.suggested_followups.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQueryText(f);
                      handleAsk(f);
                    }}
                    className="p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-left text-xs text-stone-700 hover:text-amber-900 font-semibold transition-all flex items-center justify-between gap-2 group flex-1"
                  >
                    <span>{f}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
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
