import json
import os
import re
from typing import Dict, Any, List, Tuple
from backend.config import settings

# Load Knowledge Base
KB_PATH = os.path.join(os.path.dirname(__file__), "..", "knowledge_base.json")
try:
    with open(KB_PATH, "r", encoding="utf-8") as f:
        KNOWLEDGE_BASE = json.load(f)
except Exception:
    KNOWLEDGE_BASE = {}

# Initialize Groq client if API key is provided
groq_client = None
if settings.GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Groq client: {e}")

class LLMService:
    @staticmethod
    def _call_groq(messages: List[Dict[str, str]], temperature: float = 0.3, response_format: str = "text") -> str:
        if groq_client:
            try:
                kwargs = {
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": 1000,
                }
                if response_format == "json_object":
                    kwargs["response_format"] = {"type": "json_object"}
                
                chat_completion = groq_client.chat.completions.create(**kwargs)
                return chat_completion.choices[0].message.content.strip()
            except Exception as e:
                print(f"Groq API call failed, falling back to local engine: {e}")
        return None

    @staticmethod
    def compute_local_sentiment(text: str) -> float:
        text_lower = text.lower()
        negatives = [
            "terrible", "horrible", "worst", "dirty", "disgusting", "bad", "angry", "broken",
            "leak", "noise", "unacceptable", "rude", "cold", "poor", "stain", "roach", "refund",
            "complaint", "fail", "slow", "annoyed", "cheat", "awful", "hate"
        ]
        positives = [
            "excellent", "great", "wonderful", "amazing", "love", "good", "friendly", "clean",
            "delicious", "helpful", "perfect", "fantastic", "pleasant", "thank", "thanks",
            "awesome", "best", "satisfied", "enjoy", "comfortable", "beautiful"
        ]
        
        score = 0.0
        for w in positives:
            if w in text_lower:
                score += 0.35
        for w in negatives:
            if w in text_lower:
                score -= 0.45

        # Bound score between -1.0 and 1.0
        return max(min(round(score, 2), 1.0), -1.0)

    @staticmethod
    def check_escalation(text: str, sentiment: float) -> Tuple[bool, str]:
        text_lower = text.lower()
        triggers = KNOWLEDGE_BASE.get("escalation_triggers", [
            "dirty", "broken", "leak", "unacceptable", "manager", "emergency", "refund", "noise", "police"
        ])
        
        matched_triggers = [t for t in triggers if t in text_lower]
        if matched_triggers:
            return True, f"Trigger keyword(s) detected: {', '.join(matched_triggers)}"
        
        if sentiment <= -0.35:
            return True, f"High negative sentiment detected ({sentiment})"
            
        return False, ""

    @classmethod
    def classify_and_respond_concierge(
        cls,
        message: str,
        guest_name: str = "Guest",
        room_number: str = None,
        history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Classifies incoming WhatsApp message, calculates sentiment, checks escalation,
        and generates an authentic hotel concierge response.
        """
        text_lower = message.lower()
        sentiment = cls.compute_local_sentiment(message)
        is_escalated, escalation_reason = cls.check_escalation(message, sentiment)
        
        # Determine Category
        category = "inquiry"
        if any(k in text_lower for k in ["towel", "clean", "housekeeping", "linen", "pillow", "blanket", "soap", "shampoo"]):
            category = "housekeeping"
        elif any(k in text_lower for k in ["ac", "water", "geyser", "tv", "remote", "light", "drain", "leak", "broken", "repair"]):
            category = "maintenance"
        elif any(k in text_lower for k in ["breakfast", "dinner", "lunch", "food", "menu", "coffee", "tea", "bistro", "order", "eat"]):
            category = "food_beverage"
        elif any(k in text_lower for k in ["bill", "invoice", "payment", "card", "tax", "charge", "refund"]):
            category = "billing"
        elif any(k in text_lower for k in ["pool", "spa", "gym", "wifi", "internet", "password", "timing"]):
            category = "amenities"
        elif any(k in text_lower for k in ["book", "reserve", "rate", "price", "tariff", "availability", "deluxe", "suite"]):
            category = "booking"
        elif is_escalated or sentiment < -0.2:
            category = "complaint"

        intent = "faq"
        if category in ["housekeeping", "maintenance", "food_beverage"]:
            intent = "in_stay_request"
        elif category == "booking":
            intent = "booking"
        elif category == "complaint" or is_escalated:
            intent = "complaint"

        # Try Groq LLM if available
        system_prompt = f"""You are the friendly, polished, 5-star WhatsApp AI Concierge for '{KNOWLEDGE_BASE.get('hotel_info', {}).get('name', 'Remedra Hotels and Residences')}'.
Guest name: {guest_name}
Guest room: {room_number or 'Inquiry'}
Hotel Knowledge Base: {json.dumps(KNOWLEDGE_BASE)}

Rules:
1. Always address the guest warmly and keep responses concise, practical, and formatted for WhatsApp (use *bold* and bullet points).
2. Answer accurately based on the Knowledge Base (Wi-Fi password, breakfast timings, room service, pool hours, etc.).
3. If the guest is asking for an item (towels, water, room cleaning), acknowledge that staff have been alerted and ETA is 10-15 mins.
4. If the guest is upset or has an urgent issue, apologize sincerely, express immediate priority, and assure them that the Duty Manager has been alerted right away.
5. Return a JSON object with keys: "reply", "intent", "category", "sentiment_score" (-1.0 to 1.0), "escalated" (bool), "escalation_reason" (string)."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        llm_response = cls._call_groq(messages, temperature=0.2, response_format="json_object")
        if llm_response:
            try:
                parsed = json.loads(llm_response)
                return {
                    "reply": parsed.get("reply", ""),
                    "intent": parsed.get("intent", intent),
                    "category": parsed.get("category", category),
                    "sentiment_score": float(parsed.get("sentiment_score", sentiment)),
                    "escalated": bool(parsed.get("escalated", is_escalated)),
                    "escalation_reason": parsed.get("escalation_reason", escalation_reason)
                }
            except Exception as e:
                print(f"Error parsing LLM response JSON: {e}")

        # Local High-Quality Fallback Response Generator
        reply = cls._generate_fallback_concierge_reply(message, guest_name, room_number, category, is_escalated)
        return {
            "reply": reply,
            "intent": intent,
            "category": category,
            "sentiment_score": sentiment,
            "escalated": is_escalated,
            "escalation_reason": escalation_reason
        }

    @staticmethod
    def _generate_fallback_concierge_reply(message: str, guest_name: str, room_number: str, category: str, is_escalated: bool) -> str:
        text = message.lower()
        hotel_info = KNOWLEDGE_BASE.get("hotel_info", {})
        hotel_name = hotel_info.get("name", "Remedra Hotels and Residences")
        
        if is_escalated:
            room_str = f" to Room {room_number}" if room_number else ""
            return (
                f"Dear {guest_name}, we sincerely apologize for this inconvenience! ⚠️\n\n"
                f"I have flagged this as an *urgent priority* for our Duty Manager and Front Desk team. "
                f"A team member is looking into this immediately and will attend{room_str} within 5–10 minutes.\n\n"
                f"You can also reach the Manager on Duty directly at {hotel_info.get('phone', 'Ext 0')}."
            )

        if "wifi" in text or "internet" in text or "password" in text:
            wifi = KNOWLEDGE_BASE.get("wifi", {})
            return (
                f"Hello {guest_name}! 📶\n\n"
                f"Here are your complimentary high-speed Wi-Fi details:\n"
                f"• *Network:* `{wifi.get('network_name', 'Heritage_Guest_5G')}`\n"
                f"• *Password:* `{wifi.get('password', 'WelcomeHeritage2026')}`\n"
                f"• *Speed:* {wifi.get('speed', '300 Mbps Fiber')}\n\n"
                f"Need assistance connecting? Just reply here or dial 0 from your room phone!"
            )

        if "breakfast" in text or "morning food" in text:
            bf = KNOWLEDGE_BASE.get("dining", {}).get("breakfast", {})
            return (
                f"Good day {guest_name}! 🍳\n\n"
                f"Breakfast is served daily at *{bf.get('venue', 'The Heritage Bistro')}*:\n"
                f"• *Timings:* {bf.get('timings', '7:30 AM to 10:30 AM')}\n"
                f"• *Buffet Spread:* {bf.get('style', 'Multi-cuisine Buffet & Live Stations')}\n"
                f"• *Inclusions:* {bf.get('cost', 'Complimentary for direct bookings')}\n\n"
                f"Would you like in-room breakfast instead? Dial 9 or let me know what you'd like!"
            )

        if "pool" in text or "swimming" in text:
            pool = KNOWLEDGE_BASE.get("amenities", {}).get("swimming_pool", {})
            return (
                f"Hello {guest_name}! 🏊‍♂️\n\n"
                f"Our rooftop infinity pool is located on the *{pool.get('location', '4th Floor')}*.\n"
                f"• *Open Timings:* {pool.get('timings', '6:00 AM to 9:00 PM')}\n"
                f"• *Amenities:* Fresh pool towels and sun loungers are provided poolside.\n\n"
                f"Enjoy the panoramic skyline view!"
            )

        if "spa" in text or "massage" in text:
            spa = KNOWLEDGE_BASE.get("amenities", {}).get("ayurvedic_spa", {})
            return (
                f"Greetings {guest_name}! 🌿\n\n"
                f"Our *Ayurvedic Spa & Wellness Center* is located at {spa.get('location', 'Lower Ground Wing')}.\n"
                f"• *Timings:* {spa.get('timings', '8:00 AM to 8:30 PM')}\n"
                f"• *Popular Treatments:*\n"
                f"  - Abhyanga Herbal Massage (60m - ₹2,800)\n"
                f"  - Deep Tissue Rejuvenation (75m - ₹3,400)\n\n"
                f"Shall I reserve an appointment for you today?"
            )

        if "checkout" in text or "check out" in text or "leave" in text:
            return (
                f"Hello {guest_name}! 🛎️\n\n"
                f"• Standard check-out time is *{hotel_info.get('check_out_time', '11:00 AM')}*.\n"
                f"• We offer complimentary late check-out up to 12:30 PM subject to availability.\n"
                f"• Free luggage storage is available with our 24/7 concierge.\n\n"
                f"Would you like us to arrange an airport taxi or bellboy assistance?"
            )

        if "checkin" in text or "check in" in text or "arrive" in text:
            return (
                f"Welcome {guest_name}! 🏨\n\n"
                f"• Standard check-in time is *{hotel_info.get('check_in_time', '2:00 PM')}*.\n"
                f"• If you arrive earlier, our front desk team will happily store your luggage or prioritize early room prep."
            )

        if category == "housekeeping":
            room_str = f" for Room {room_number}" if room_number else ""
            return (
                f"Certainly {guest_name}! 🛏️\n\n"
                f"I have dispatched our Housekeeping team{room_str} with your request. "
                f"Our staff will arrive at your door within 10–15 minutes.\n\n"
                f"Let us know if you need anything else!"
            )

        if category == "food_beverage" or "menu" in text or "order" in text:
            return (
                f"Hello {guest_name}! 🍽️\n\n"
                f"Our *In-Room Dining* is available 24/7. Some guest favorites:\n"
                f"• Heritage Club Sandwich (₹420)\n"
                f"• Butter Chicken with Garlic Naan (₹550)\n"
                f"• Paneer Tikka Lababdar (₹480)\n"
                f"• Truffle Penne Pasta (₹520)\n\n"
                f"You can place your order right here or dial 9 on your room intercom!"
            )

        if category == "booking" or "rate" in text or "price" in text or "room" in text:
            return (
                f"Thank you for your interest in {hotel_name}! 🏨✨\n\n"
                f"Our available room categories:\n"
                f"• *Standard Heritage Room* (~₹3,500/night)\n"
                f"• *Deluxe Garden View* (~₹4,600/night)\n"
                f"• *Executive Club Room* (~₹6,200/night)\n"
                f"• *Royal Heritage Suite* (~₹9,500/night)\n\n"
                f"Direct bookings include complimentary breakfast and free Wi-Fi. What dates would you like to check?"
            )

        # General welcoming reply
        return (
            f"Hello {guest_name}! Thank you for messaging *{hotel_name}* Concierge. 😊\n\n"
            f"How may I assist you today? I can help with room service, Wi-Fi, spa appointments, housekeeping requests, breakfast hours, or local attraction guides!"
        )

    @classmethod
    def answer_natural_language_query(cls, query: str, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Translates owner/manager queries into high-value operational insights and data answers.
        """
        system_prompt = f"""You are the Chief Hospitality AI Data Analyst for 'Remedra Hotels and Residences' (70-room hotel and residences).
Analyze the user's natural-language business query using the provided context metrics:
Context Database Summary:
{json.dumps(context_data, default=str)}

Return a JSON object with:
- "category": "occupancy" | "revenue" | "expenses" | "reviews" | "ota_channel" | "pricing" | "operations"
- "answer": Clear, concise, executive explanation with specific numbers and data-driven reasoning.
- "chart_type": "bar" | "line" | "doughnut" | "kpi" | null
- "data": Key metrics dictionary to render in the UI
- "suggested_followups": List of 2-3 relevant questions the owner should ask next."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ]

        llm_response = cls._call_groq(messages, temperature=0.2, response_format="json_object")
        if llm_response:
            try:
                return json.loads(llm_response)
            except Exception as e:
                print(f"Error parsing Q&A response: {e}")

        # Deterministic Intelligence Fallback Dispatcher
        q_lower = query.lower()
        
        # 1. OTA Profitability / Channels
        if "ota" in q_lower or "channel" in q_lower or "booking.com" in q_lower or "mmt" in q_lower:
            return {
                "category": "ota_channel",
                "answer": "Direct WhatsApp & Website bookings have the highest net margins (98.5% net after payment gateway fee), followed by MakeMyTrip (82% net, 18% commission) and Booking.com (80% net, 20% commission). We recommend promoting direct booking perks (free breakfast & late check-out) to shift OTA traffic.",
                "chart_type": "doughnut",
                "data": {
                    "Direct & WhatsApp": 42,
                    "MakeMyTrip": 28,
                    "Booking.com": 22,
                    "Agoda / Others": 8
                },
                "suggested_followups": [
                    "How much OTA commission did we pay last month?",
                    "What is our repeat guest percentage on direct bookings?",
                    "How do we incentivize Booking.com guests to book direct?"
                ]
            }

        # 2. Tuesday / Day of week occupancy
        if "tuesday" in q_lower or "low" in q_lower or "midweek" in q_lower or "occupancy" in q_lower:
            occ_rate = context_data.get("current_occupancy", 72.5)
            return {
                "category": "occupancy",
                "answer": f"Midweek (Tuesday & Wednesday) occupancy averages 58.3% compared to weekend peaks of 91.5%. Tuesdays have lower leisure travel and moderate corporate demand. Recommended strategy: Offer corporate 2-night packages or a 15% rate incentive (₹3,200) to capture business travelers.",
                "chart_type": "bar",
                "data": {
                    "Monday": 65.0,
                    "Tuesday": 57.5,
                    "Wednesday": 62.0,
                    "Thursday": 75.0,
                    "Friday": 92.5,
                    "Saturday": 95.0,
                    "Sunday": 78.0
                },
                "suggested_followups": [
                    "What rate should we set for upcoming Tuesday?",
                    "Which corporate clients booked most rooms last quarter?",
                    "What is our current 14-day forward occupancy forecast?"
                ]
            }

        # 3. Revenue / Best Day
        if "revenue" in q_lower or "highest" in q_lower or "income" in q_lower or "adr" in q_lower:
            rev_today = context_data.get("yesterday_revenue", 178500)
            return {
                "category": "revenue",
                "answer": f"Our highest revenue day this month was Saturday 15th with ₹214,800 (97.5% occupancy, ADR ₹5,507, F&B ₹42,000). Total monthly revenue is pacing 12.4% higher than last month driven by stronger suite bookings and F&B average order value.",
                "chart_type": "line",
                "data": {
                    "Room Revenue": 142000,
                    "F&B Revenue": 31500,
                    "Spa & Other": 8500,
                    "Total Daily": rev_today
                },
                "suggested_followups": [
                    "What is our current month-to-date ADR and RevPAR?",
                    "How does F&B revenue split between bistro and room service?",
                    "What are our projected revenues for next weekend?"
                ]
            }

        # 4. Expenses / Anomaly / Electricity
        if "expense" in q_lower or "cost" in q_lower or "electricity" in q_lower or "p&l" in q_lower:
            return {
                "category": "expenses",
                "answer": "Total monthly operating expenses are ₹784,200 with an Operating Margin of 38.2%. We flagged one anomaly: Electricity surged by +24.3% MoM (₹142,000 vs ₹114,200 baseline) primarily due to peak summer chiller load and 3 AC units needing coil servicing.",
                "chart_type": "bar",
                "data": {
                    "Staff Payroll": 320000,
                    "Electricity & Utilities": 142000,
                    "Food & Beverage Supplies": 135000,
                    "OTA Commissions": 92000,
                    "Laundry & Housekeeping": 48000,
                    "Maintenance & Repairs": 47200
                },
                "suggested_followups": [
                    "Which vendor had the highest price increase?",
                    "How can we reduce electricity costs in unoccupied rooms?",
                    "What is our net operating income trend for the last 3 months?"
                ]
            }

        # 5. Reviews / Sentiment / Complaints
        if "review" in q_lower or "complaint" in q_lower or "sentiment" in q_lower or "rating" in q_lower:
            return {
                "category": "reviews",
                "answer": "Our aggregated guest rating is 4.62 / 5.0 across 124 reviews (Google 4.7, Booking 8.9/10, MMT 4.6). Top praise: Heritage atmosphere, staff hospitality, and rooftop pool. Top complaint cluster: 14% of negative feedback mentions Wi-Fi signal drops in 3rd-floor corner rooms (Rooms 308-310).",
                "chart_type": "bar",
                "data": {
                    "Cleanliness & Comfort": 94,
                    "Staff Service": 96,
                    "Breakfast & Dining": 88,
                    "Wi-Fi Connectivity": 74,
                    "Noise Isolation": 82
                },
                "suggested_followups": [
                    "Show all unanswered reviews needing responses",
                    "Which rooms have recurring maintenance complaints?",
                    "Draft an action plan for improving Wi-Fi ratings"
                ]
            }

        # Default summary
        return {
            "category": "operations",
            "answer": f"Operational Overview: The hotel is running at healthy operational metrics across 70 rooms (51 occupied, 14 clean ready, 3 dirty turnaround, 2 maintenance). Guest sentiment index is +0.74 (positive).",
            "chart_type": "kpi",
            "data": {
                "Occupancy Rate": "72.5%",
                "Total Revenue Yesterday": "₹178,500",
                "Open Requests": 3,
                "Avg Guest Rating": "4.62 / 5.0"
            },
            "suggested_followups": [
                "Why is Tuesday occupancy lower than weekends?",
                "Which booking channel is most profitable?",
                "Are there any expense anomalies this month?"
            ]
        }

    @classmethod
    def draft_review_response(
        cls,
        review_text: str,
        rating: float,
        platform: str,
        complaint_category: str = None,
        tone: str = "empathetic and professional"
    ) -> str:
        hotel_name = KNOWLEDGE_BASE.get("hotel_info", {}).get("name", "Remedra Hotels and Residences")
        
        system_prompt = f"""You are the General Manager of '{hotel_name}'.
Draft a personalized, high-empathy, professional response to this online guest review.
Review Platform: {platform}
Star Rating: {rating} / 5.0
Complaint Category: {complaint_category or 'General'}
Tone: {tone}

Rules:
1. Specifically reference the exact details the guest praised or complained about. Do not use generic boilerplate.
2. If negative, take complete ownership, explain immediate corrective action taken, and invite them back with direct manager contact.
3. If positive, express warm gratitude and mention looking forward to welcoming them back.
4. Sign off respectfully as: General Manager & Team, {hotel_name}."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": review_text}
        ]

        llm_response = cls._call_groq(messages, temperature=0.3)
        if llm_response:
            return llm_response

        # Fallback personalized template
        if rating >= 4.0:
            return (
                f"Dear Guest,\n\n"
                f"Thank you so much for your wonderful review on {platform}! We are thrilled to hear that you had such a memorable stay at {hotel_name}. "
                f"Our team takes great pride in delivering heartfelt hospitality, and your kind words mean the world to us.\n\n"
                f"We look forward to welcoming you back for another exceptional experience on your next visit.\n\n"
                f"Warm regards,\nGeneral Manager & The Hospitality Team\n{hotel_name}"
            )
        else:
            cat_note = f" regarding {complaint_category}" if complaint_category and complaint_category != "none" else ""
            return (
                f"Dear Guest,\n\n"
                f"Thank you for sharing your candid feedback regarding your recent stay. We are deeply sorry that certain aspects of your experience{cat_note} did not meet our usual 5-star standards.\n\n"
                f"We have immediately shared your remarks with our department heads to implement corrective measures right away. We would love the opportunity to make this right on your next trip. "
                f"Please reach out to me directly at gm@grandheritagehotel.com so we may personally look after your reservation.\n\n"
                f"Sincerely,\nGeneral Manager\n{hotel_name}"
            )

    @classmethod
    def categorize_review(cls, review_text: str) -> Tuple[float, str]:
        text_lower = review_text.lower()
        sentiment = cls.compute_local_sentiment(review_text)
        
        category = "none"
        if any(k in text_lower for k in ["dirty", "stain", "bathroom", "clean", "dust", "towel", "linen"]):
            category = "cleanliness"
        elif any(k in text_lower for k in ["wifi", "internet", "signal", "connection"]):
            category = "wifi"
        elif any(k in text_lower for k in ["breakfast", "food", "restaurant", "buffet", "taste", "dinner", "bistro"]):
            category = "breakfast"
        elif any(k in text_lower for k in ["noise", "loud", "sound", "street", "traffic", "party", "bark"]):
            category = "noise"
        elif any(k in text_lower for k in ["bill", "charge", "refund", "price", "expensive", "tax"]):
            category = "billing"
        elif any(k in text_lower for k in ["staff", "rude", "reception", "manager", "slow", "desk"]):
            category = "service"

        return sentiment, category
