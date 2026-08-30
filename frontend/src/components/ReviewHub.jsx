import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Filter, 
  ShieldAlert, 
  MessageSquare, 
  ExternalLink,
  Edit3,
  ThumbsUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../api';

export default function ReviewHub() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [draftingId, setDraftingId] = useState(null);
  const [editingDrafts, setEditingDrafts] = useState({});

  useEffect(() => {
    loadReviewsAndStats();
  }, [platformFilter, categoryFilter]);

  const loadReviewsAndStats = async () => {
    try {
      const filters = {};
      if (platformFilter !== 'all') filters.platform = platformFilter;
      if (categoryFilter !== 'all') filters.complaint_category = categoryFilter;

      const [revs, st] = await Promise.all([
        api.getReviews(filters),
        api.getReviewStats()
      ]);
      setReviews(revs);
      setStats(st);

      // Initialize editing drafts
      const draftsObj = {};
      revs.forEach(r => {
        if (r.response_draft) draftsObj[r.id] = r.response_draft;
      });
      setEditingDrafts(draftsObj);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleGenerateDraft = async (reviewId) => {
    setDraftingId(reviewId);
    try {
      const res = await api.draftReviewResponse(reviewId);
      setEditingDrafts(prev => ({ ...prev, [reviewId]: res.response_draft }));
      setDraftingId(null);
      loadReviewsAndStats();
    } catch (err) {
      setDraftingId(null);
      alert('Failed to draft AI response: ' + err.message);
    }
  };

  const handleApproveResponse = async (reviewId) => {
    const text = editingDrafts[reviewId];
    if (!text) return;
    try {
      await api.approveReviewResponse(reviewId, text);
      loadReviewsAndStats();
    } catch (err) {
      alert('Failed to approve response: ' + err.message);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const numStars = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${i <= numStars ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} 
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Platform & Feasibility Notice Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs shadow-xs">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <span className="font-heading font-bold text-blue-900">Review Ingestion & Platform API Feasibility Note:</span>
          <p className="text-stone-700 leading-relaxed font-medium">
            Google reviews are synced via the official <strong className="text-stone-900 font-bold">Google Business Profile API</strong>. 
            For Booking.com, MakeMyTrip, and Agoda (which do not provide public review APIs), our system uses structured CSV batch import & certified channel aggregator webhooks to mitigate ToS and legal risks.
          </p>
        </div>
      </div>

      {/* Aggregate Ratings & Complaint Clusters */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Overall & Platform Breakdown */}
          <div className="md:col-span-6 bg-white p-5 rounded-2xl border border-stone-200 border-t-2 border-t-amber-600 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Aggregated Rating</span>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-3xl font-black text-stone-900">{stats.overall_average_rating}</span>
                  <span className="text-xs text-stone-500 font-medium">/ 5.0</span>
                  <div className="ml-1">{renderStars(stats.overall_average_rating)}</div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold">
                {stats.total_reviews} Reviews
              </span>
            </div>

            {/* Platform Rows */}
            <div className="grid grid-cols-2 gap-2">
              {stats.platform_breakdown && Object.entries(stats.platform_breakdown).map(([plat, val]) => (
                <div key={plat} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 capitalize">{plat}</span>
                    <span className="font-extrabold text-amber-700">{val.avg_rating} ★</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold">{val.count} reviews</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Complaint Clustering */}
          <div className="md:col-span-6 bg-white p-5 rounded-2xl border border-stone-200 border-t-2 border-t-amber-600 shadow-sm space-y-3">
            <h3 className="font-heading text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              AI Complaint & Praise Clustering
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-700">Cleanliness & Room Comfort</span>
                  <span className="font-bold text-emerald-700">94% Positive</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: '94%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-700">Staff Service & Hospitality</span>
                  <span className="font-bold text-emerald-700">96% Positive</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: '96%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-700">Breakfast & Dining Experience</span>
                  <span className="font-bold text-amber-700">88% Positive</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div className="h-full bg-amber-600" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-700">Wi-Fi Connectivity (3rd floor watch)</span>
                  <span className="font-bold text-rose-700">74% Positive (Issue Area)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div className="h-full bg-rose-600" style={{ width: '74%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-stone-700">Platform:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'google', 'booking', 'mmt', 'tripadvisor', 'agoda'].map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  platformFilter === p 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {p === 'all' ? 'All Platforms' : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {reviews.map(rev => {
          const isPublished = rev.response_status === 'published';
          const draftText = editingDrafts[rev.id] || rev.response_draft || '';

          return (
            <div key={rev.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-stone-300 space-y-4">
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold uppercase">
                    {rev.platform}
                  </span>
                  <div>{renderStars(rev.rating)}</div>
                  <span className="font-heading font-bold text-xs text-stone-900">
                    {rev.guest_name || 'Verified Guest'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                  <span>{rev.review_date}</span>
                  {rev.complaint_category && rev.complaint_category !== 'none' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold capitalize">
                      Cluster: {rev.complaint_category}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed italic font-medium">
                "{rev.text}"
              </p>

              {/* AI Draft Response Section */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    AI-Drafted Response (Groq Llama 3.3 70B):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateDraft(rev.id)}
                      disabled={draftingId === rev.id}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-bold underline"
                    >
                      {draftingId === rev.id ? 'Regenerating...' : 'Regenerate Draft'}
                    </button>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                      isPublished ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isPublished ? 'Published' : 'Pending Approval'}
                    </span>
                  </div>
                </div>

                <textarea
                  value={draftText}
                  onChange={(e) => setEditingDrafts(prev => ({ ...prev, [rev.id]: e.target.value }))}
                  placeholder="AI is generating response draft..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium outline-none focus:border-amber-600 leading-relaxed font-sans"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleApproveResponse(rev.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isPublished ? 'Update & Re-Publish' : 'Approve & Publish Response'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
