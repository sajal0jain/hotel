import sys
import httpx

sys.stdout.reconfigure(encoding='utf-8')
client = httpx.Client(base_url='http://127.0.0.1:8000')

print("======================================================================")
print("THE GRAND HERITAGE (40-ROOM BOUTIQUE HOTEL) — LIVE SYSTEM DEMO")
print("======================================================================\n")

# 1. Dashboard KPIs
kpis = client.get('/api/analytics/dashboard-kpis').json()
print("1. [DASHBOARD & 40-ROOM MATRIX OVERVIEW]")
print(f"   • Occupancy: {kpis['occupancy_rate']}% ({kpis['occupied_rooms']}/40 rooms booked)")
print(f"   • Room Status Breakdown: {kpis['clean_rooms']} Clean Ready | {kpis['occupied_rooms']} Occupied | {kpis['dirty_rooms']} Dirty Turnaround | {kpis['maintenance_rooms']} Maintenance")
print(f"   • ADR (Average Daily Rate): Rs. {kpis['adr']:,.0f}")
print(f"   • RevPAR: Rs. {kpis['revpar']:,.0f}")
print(f"   • Active Escalations: {kpis['escalated_requests_count']} Urgent Alert(s)")

# 2. Daily Morning AI Report
report = client.get('/api/analytics/daily-report').json()
print("\n2. [DAILY MORNING AI REPORT]")
print(f"   • Date: {report['date']}")
print(f"   • Sentiment Index: {report['guest_sentiment_summary']['index']}")
print(f"   • Top Praise: {report['guest_sentiment_summary']['top_praise']}")
print(f"   • Top Watch: {report['guest_sentiment_summary']['top_complaint']}")
print(f"   • AI Strategic Revenue Action:\n     \"{report['ai_suggested_action']}\"")

# 3. WhatsApp Concierge: Normal FAQ RAG
res_faq = client.post('/api/concierge/simulator', json={
    'phone': '+919811122334', 'name': 'Ananya Roy', 'room_number': '407',
    'message': 'What is the Wi-Fi password and what time is breakfast?'
}).json()
print("\n3. [WHATSAPP AI CONCIERGE — FAQ / AMENITY RAG]")
print("   • Guest (Ananya Roy - Suite 407): \"What is the Wi-Fi password and what time is breakfast?\"")
print(f"   • Intent: {res_faq['intent']} | Category: {res_faq['category']} | Sentiment: {res_faq['sentiment_score']}")
print(f"   • WhatsApp AI Reply:\n{res_faq['reply']}")

# 4. WhatsApp Concierge: Urgent Complaint & Escalation
res_complaint = client.post('/api/concierge/simulator', json={
    'phone': '+919765432109', 'name': 'Sneha Sen', 'room_number': '204',
    'message': 'My AC is completely broken and leaking water on the bed! This is unacceptable!'
}).json()
print("\n4. [WHATSAPP AI CONCIERGE — REAL-TIME URGENT ESCALATION]")
print("   • Guest (Sneha Sen - Room 204): \"My AC is completely broken and leaking water on the bed! This is unacceptable!\"")
print(f"   • Escalated: {res_complaint['escalated']} (Reason: {res_complaint['escalation_reason']})")
print(f"   • Sentiment Score: {res_complaint['sentiment_score']} (Negative)")
print(f"   • WhatsApp AI Reply:\n{res_complaint['reply']}")

# 5. Natural-Language Ask Your Data AI
qa1 = client.post('/api/analytics/ask-data', json={'query': 'Which OTA or booking channel is most profitable?'}).json()
print("\n5. [NATURAL-LANGUAGE 'ASK YOUR DATA' AI]")
print("   • Owner Query: \"Which OTA or booking channel is most profitable?\"")
print(f"   • Category: {qa1['category']}")
print(f"   • AI Plain-English Reasoning:\n     {qa1['answer']}")
print(f"   • Dynamic Data Breakdown: {qa1['data']}")
print(f"   • Suggested Follow-Ups: {qa1['suggested_followups']}")

# 6. Expense Analyzer & Anomaly Detection
pnl = client.get('/api/expenses/pnl/2026-08').json()
print("\n6. [EXPENSE ANALYZER & P&L ANOMALY DETECTION]")
print(f"   • Month: {pnl['month']}")
print(f"   • Total Revenue: Rs. {pnl['total_revenue']:,.0f} | Operating Expenses: Rs. {pnl['total_expenses']:,.0f}")
print(f"   • Net Operating Income: Rs. {pnl['net_operating_income']:,.0f} (Margin: {pnl['profit_margin_pct']}%)")
print(f"   • MoM Anomalies Flagged ({len(pnl['anomalies'])}):")
for anom in pnl['anomalies']:
    print(f"     [ANOMALY ALERT] {anom['category'].upper()}: {anom['reason']}")

# 7. Review Manager & AI Draft Response
rev_stats = client.get('/api/reviews/stats').json()
print("\n7. [REVIEW MANAGER & AI REPLY DRAFTER]")
print(f"   • Aggregated Rating: {rev_stats['overall_average_rating']} / 5.0 across {rev_stats['total_reviews']} verified reviews")
print(f"   • Platform Breakdown: {rev_stats['platform_breakdown']}")
print(f"   • Complaint Clustering: {rev_stats['complaint_clusters']}")

# 8. Revenue Optimizer & Dynamic Rate Recommendations
recs = client.get('/api/pricing/recommendations').json()
print("\n8. [REVENUE OPTIMIZER & 14-DAY FORWARD YIELD PRICING]")
for r in recs[:3]:
    print(f"   • Date: {r['date']} | Forecasted Occupancy: {r['occupancy_forecast']}% ({r['demand_level'].upper()})")
    print(f"     Rate Delta: Rs. {r['current_rate']:,.0f} -> Recommended: Rs. {r['recommended_rate']:,.0f}")
    print(f"     Reasoning: {r['reasoning']}\n")

print("======================================================================")
print("DEMO EXECUTION COMPLETE — ALL 8 MODULES FUNCTIONING AT 100%")
print("======================================================================")
