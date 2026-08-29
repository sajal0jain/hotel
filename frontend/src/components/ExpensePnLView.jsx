import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  PieChart, 
  Calendar,
  Zap,
  Users,
  Utensils,
  Shirt,
  Percent,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { api } from '../api';

const SAMPLE_INVOICE_PRESETS = [
  {
    title: "⚡ DISCOM State Power Bill (Aug 2026)",
    text: "RAJASTHAN RAJYA VIDYUT PRASARAN NIGAM LIMITED\nInvoice No: ELEC-2026-08-994\nBilling Period: 2026-08\nCategory: Electricity High Tension Tariff\nUnits Consumed: 14,250 kWh\nTotal Amount Payable: ₹142,500\nDue Date: 15-09-2026"
  },
  {
    title: "🥦 Fresh Farm Harvest Kitchen & Dairy",
    text: "FRESH FARM HARVEST & ARTISANAL DAIRY SUPPLIERS\nBill No: FF-8832\nDate: 2026-08-20\nDescription: Vegetables, Poultry, Dairy & Bakery provisions for Bistro\nTotal Invoice Value: ₹134,800"
  },
  {
    title: "🧺 Royal Clean Industrial Linen Wash",
    text: "ROYAL CLEAN HOTEL LAUNDRY SERVICES\nInvoice: RCL-5541\nMonth: 2026-08\nBed Linens: 1,200 pcs, Duvets: 400 pcs, Pool Towels: 850 pcs\nAmount: ₹46,200"
  },
  {
    title: "❓ Ambiguous Scanned Bill (Low Confidence)",
    text: "Local Corner Store & Hardware\nReceipt #442\nItems miscellaneous\nPaid: 18500 cash"
  }
];

export default function ExpensePnLView() {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [pnlData, setPnlData] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [uploadText, setUploadText] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPnLAndExpenses(selectedMonth);
  }, [selectedMonth]);

  const loadPnLAndExpenses = async (month) => {
    try {
      const [pnl, exps] = await Promise.all([
        api.getMonthlyPnL(month),
        api.getExpenses({ month })
      ]);
      setPnlData(pnl);
      setExpensesList(exps);
    } catch (err) {
      console.error('Failed to load PnL:', err);
    }
  };

  const handleUploadInvoice = async (customRawText = null) => {
    const raw = customRawText || uploadText;
    if (!raw.trim()) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('raw_text', raw);

    try {
      const res = await api.uploadInvoice(formData);
      setIsUploading(false);
      setUploadStatus(res);
      if (!customRawText) setUploadText('');
      loadPnLAndExpenses(selectedMonth);
    } catch (err) {
      setIsUploading(false);
      alert('Upload failed: ' + err.message);
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'staff': return <Users className="w-4 h-4 text-blue-400" />;
      case 'electricity': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'food': return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'laundry': return <Shirt className="w-4 h-4 text-cyan-400" />;
      case 'ota_commission': return <Percent className="w-4 h-4 text-purple-400" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-red-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="font-heading text-sm font-bold text-white">Monthly Statement:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['2026-08', '2026-07', '2026-06', '2026-05', '2026-04', '2026-03'].map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedMonth === m 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {m === '2026-08' ? 'August 2026 (Current)' : m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* P&L Executive KPI Summary Cards */}
      {pnlData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Total Monthly Revenue</span>
            <p className="font-heading text-2xl font-bold text-emerald-400">
              ₹{Math.round(pnlData.total_revenue).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500">Rooms + F&B + Other</span>
          </div>

          <div className="glass-card p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Operating Expenses</span>
            <p className="font-heading text-2xl font-bold text-amber-400">
              ₹{Math.round(pnlData.total_expenses).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500">7 Cost Categories</span>
          </div>

          <div className="glass-card p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Net Operating Income</span>
            <p className="font-heading text-2xl font-bold text-white">
              ₹{Math.round(pnlData.net_operating_income).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500">Gross Operating Profit</span>
          </div>

          <div className="glass-card p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Operating Margin</span>
            <p className="font-heading text-2xl font-bold text-blue-400">
              {pnlData.profit_margin_pct}%
            </p>
            <span className="text-[10px] text-slate-500">Net Profit Margin</span>
          </div>
        </div>
      )}

      {/* Anomaly Alerts (MoM > 15% Variance) */}
      {pnlData?.anomalies?.length > 0 && (
        <div className="space-y-2">
          {pnlData.anomalies.map((anom, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 flex items-start gap-3 animate-fade-in shadow-lg shadow-red-500/5"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold text-red-300 uppercase">
                    Cost Anomaly Detected: {anom.category.toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/30 text-red-200 font-mono font-bold">
                    +{anom.pct_change}% MoM
                  </span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed font-medium">
                  {anom.reason}. Current monthly expense: ₹{Math.round(anom.amount).toLocaleString()}.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Breakdown & Invoice Uploader Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Categorized Expenses Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                Categorized Cost Distribution
              </h3>
              <span className="text-xs text-slate-500">
                {selectedMonth}
              </span>
            </div>

            {pnlData?.expenses_by_category && (
              <div className="space-y-3">
                {Object.entries(pnlData.expenses_by_category).map(([cat, amt]) => {
                  const pct = pnlData.total_expenses > 0 ? ((amt / pnlData.total_expenses) * 100).toFixed(1) : 0;
                  const isAnom = pnlData.anomalies?.some(a => a.category === cat);

                  return (
                    <div key={cat} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(cat)}
                          <span className="font-medium text-slate-200 capitalize">{cat.replace('_', ' ')}</span>
                          {isAnom && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                              Anomaly
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-[11px]">{pct}%</span>
                          <span className="font-heading font-bold text-white">₹{Math.round(amt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full ${isAnom ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Bill & Invoice Ingestion Engine */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 space-y-4 border border-slate-700/60">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <h3 className="font-heading text-sm font-bold text-white">Bill & Invoice Ingestion</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                OCR Parser
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Upload PDF bills or paste raw invoice text. The parser categorizes the bill, extracts amount & vendor, and scores extraction confidence:
            </p>

            {/* Quick Test Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Test Sample Invoices:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {SAMPLE_INVOICE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUploadText(p.text);
                      handleUploadInvoice(p.text);
                    }}
                    className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left text-xs text-slate-300 hover:text-amber-300 transition-all truncate"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Freeform Input */}
            <div className="space-y-2 pt-2">
              <textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Or paste invoice text here (e.g. 'Vendor: Rajasthan Discom, Amount: ₹142,500, Month: 2026-08')..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleUploadInvoice()}
                disabled={isUploading || !uploadText.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Parsing Invoice...' : 'Parse & Ingest Bill'}</span>
              </button>
            </div>

            {/* Upload Result & Confidence Banner */}
            {uploadStatus && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 animate-fade-in ${
                uploadStatus.confidence_warning 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200' 
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {uploadStatus.status === 'success' ? 'Invoice Ingested' : 'Notice'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    uploadStatus.confidence_warning ? 'bg-amber-500/30 text-amber-300' : 'bg-emerald-500/30 text-emerald-300'
                  }`}>
                    {Math.round(uploadStatus.parsed_expense?.parsed_confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
                  <div>
                    <span className="opacity-70 block">Category:</span>
                    <span className="font-bold capitalize">{uploadStatus.parsed_expense?.category}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block">Amount:</span>
                    <span className="font-bold">₹{uploadStatus.parsed_expense?.amount?.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] opacity-90 leading-tight">{uploadStatus.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
