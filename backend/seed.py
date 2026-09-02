import json
import random
from datetime import datetime, timedelta
import bcrypt
from sqlalchemy.orm import Session
from backend.database import engine, Base, SessionLocal
from backend.models import (
    Room, Reservation, GuestProfile, Conversation, Message,
    GuestRequest, StaffUser, Expense, RevenueDaily, Review, RateRecommendation
)
from backend.services.revenue_optimizer import RevenueOptimizer
from backend.services.llm_service import LLMService

def hash_password(password: str) -> str:
    pwd_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if database already seeded
    if db.query(Room).count() >= 70:
        print("Database already contains 70 rooms. Seeding skipped.")
        db.close()
        return

    print("[SEED] Starting comprehensive database seed for 70-room hotel...")

    # 1. Staff Users
    staff_data = [
        {"name": "Vikramaditya Rathore", "email": "owner@grandheritage.com", "password": "heritage2026", "role": "owner"},
        {"name": "Pooja Sharma", "email": "manager@grandheritage.com", "password": "heritage2026", "role": "manager"},
        {"name": "Aman Verma", "email": "frontdesk@grandheritage.com", "password": "heritage2026", "role": "front_desk"},
    ]
    for s in staff_data:
        existing = db.query(StaffUser).filter(StaffUser.email == s["email"]).first()
        if not existing:
            db.add(StaffUser(
                name=s["name"],
                email=s["email"],
                password_hash=hash_password(s["password"]),
                role=s["role"],
                created_at=datetime.utcnow()
            ))
    db.commit()

    # 2. 70 Hotel Rooms across 7 Floors
    rooms_config = [
        # Floor 1
        {"num": "101", "type": "Standard", "floor": 1, "rate": 3500.0, "status": "occupied"},
        {"num": "102", "type": "Standard", "floor": 1, "rate": 3500.0, "status": "occupied"},
        {"num": "103", "type": "Standard", "floor": 1, "rate": 3500.0, "status": "clean"},
        {"num": "104", "type": "Standard", "floor": 1, "rate": 3500.0, "status": "occupied"},
        {"num": "105", "type": "Standard", "floor": 1, "rate": 3500.0, "status": "dirty"},
        {"num": "106", "type": "Standard", "floor": 1, "rate": 3500.0, "status": "occupied"},
        {"num": "107", "type": "Deluxe", "floor": 1, "rate": 4600.0, "status": "occupied"},
        {"num": "108", "type": "Deluxe", "floor": 1, "rate": 4600.0, "status": "clean"},
        {"num": "109", "type": "Deluxe", "floor": 1, "rate": 4600.0, "status": "occupied"},
        {"num": "110", "type": "Deluxe", "floor": 1, "rate": 4600.0, "status": "occupied"},
        # Floor 2
        {"num": "201", "type": "Standard", "floor": 2, "rate": 3500.0, "status": "occupied"},
        {"num": "202", "type": "Standard", "floor": 2, "rate": 3500.0, "status": "occupied"},
        {"num": "203", "type": "Standard", "floor": 2, "rate": 3500.0, "status": "clean"},
        {"num": "204", "type": "Standard", "floor": 2, "rate": 3500.0, "status": "occupied"},
        {"num": "205", "type": "Standard", "floor": 2, "rate": 3500.0, "status": "dirty"},
        {"num": "206", "type": "Standard", "floor": 2, "rate": 3500.0, "status": "occupied"},
        {"num": "207", "type": "Deluxe", "floor": 2, "rate": 4600.0, "status": "occupied"},
        {"num": "208", "type": "Deluxe", "floor": 2, "rate": 4600.0, "status": "occupied"},
        {"num": "209", "type": "Deluxe", "floor": 2, "rate": 4600.0, "status": "clean"},
        {"num": "210", "type": "Deluxe", "floor": 2, "rate": 4600.0, "status": "occupied"},
        # Floor 3
        {"num": "301", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "occupied"},
        {"num": "302", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "occupied"},
        {"num": "303", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "clean"},
        {"num": "304", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "occupied"},
        {"num": "305", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "occupied"},
        {"num": "306", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "occupied"},
        {"num": "307", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "clean"},
        {"num": "308", "type": "Deluxe", "floor": 3, "rate": 4600.0, "status": "occupied"},
        {"num": "309", "type": "Executive", "floor": 3, "rate": 6200.0, "status": "maintenance", "notes": "AC coil replacement scheduled"},
        {"num": "310", "type": "Executive", "floor": 3, "rate": 6200.0, "status": "occupied"},
        # Floor 4
        {"num": "401", "type": "Executive", "floor": 4, "rate": 6200.0, "status": "occupied"},
        {"num": "402", "type": "Executive", "floor": 4, "rate": 6200.0, "status": "occupied"},
        {"num": "403", "type": "Executive", "floor": 4, "rate": 6200.0, "status": "clean"},
        {"num": "404", "type": "Executive", "floor": 4, "rate": 6200.0, "status": "occupied"},
        {"num": "405", "type": "Executive", "floor": 4, "rate": 6200.0, "status": "dirty"},
        {"num": "406", "type": "Executive", "floor": 4, "rate": 6200.0, "status": "occupied"},
        {"num": "407", "type": "Suite", "floor": 4, "rate": 9500.0, "status": "occupied"},
        {"num": "408", "type": "Suite", "floor": 4, "rate": 9500.0, "status": "occupied"},
        {"num": "409", "type": "Suite", "floor": 4, "rate": 9500.0, "status": "occupied"},
        {"num": "410", "type": "Suite", "floor": 4, "rate": 9500.0, "status": "clean"},
        # Floor 5
        {"num": "501", "type": "Standard", "floor": 5, "rate": 3500.0, "status": "occupied"},
        {"num": "502", "type": "Standard", "floor": 5, "rate": 3500.0, "status": "occupied"},
        {"num": "503", "type": "Standard", "floor": 5, "rate": 3500.0, "status": "clean"},
        {"num": "504", "type": "Standard", "floor": 5, "rate": 3500.0, "status": "occupied"},
        {"num": "505", "type": "Standard", "floor": 5, "rate": 3500.0, "status": "clean"},
        {"num": "506", "type": "Standard", "floor": 5, "rate": 3500.0, "status": "occupied"},
        {"num": "507", "type": "Deluxe", "floor": 5, "rate": 4600.0, "status": "occupied"},
        {"num": "508", "type": "Deluxe", "floor": 5, "rate": 4600.0, "status": "clean"},
        {"num": "509", "type": "Deluxe", "floor": 5, "rate": 4600.0, "status": "occupied"},
        {"num": "510", "type": "Deluxe", "floor": 5, "rate": 4600.0, "status": "occupied"},
        # Floor 6
        {"num": "601", "type": "Deluxe", "floor": 6, "rate": 4600.0, "status": "occupied"},
        {"num": "602", "type": "Deluxe", "floor": 6, "rate": 4600.0, "status": "occupied"},
        {"num": "603", "type": "Deluxe", "floor": 6, "rate": 4600.0, "status": "clean"},
        {"num": "604", "type": "Deluxe", "floor": 6, "rate": 4600.0, "status": "occupied"},
        {"num": "605", "type": "Executive", "floor": 6, "rate": 6200.0, "status": "occupied"},
        {"num": "606", "type": "Executive", "floor": 6, "rate": 6200.0, "status": "clean"},
        {"num": "607", "type": "Executive", "floor": 6, "rate": 6200.0, "status": "occupied"},
        {"num": "608", "type": "Executive", "floor": 6, "rate": 6200.0, "status": "occupied"},
        {"num": "609", "type": "Executive", "floor": 6, "rate": 6200.0, "status": "occupied"},
        {"num": "610", "type": "Executive", "floor": 6, "rate": 6200.0, "status": "clean"},
        # Floor 7
        {"num": "701", "type": "Executive", "floor": 7, "rate": 6200.0, "status": "occupied"},
        {"num": "702", "type": "Executive", "floor": 7, "rate": 6200.0, "status": "occupied"},
        {"num": "703", "type": "Executive", "floor": 7, "rate": 6200.0, "status": "clean"},
        {"num": "704", "type": "Executive", "floor": 7, "rate": 6200.0, "status": "occupied"},
        {"num": "705", "type": "Suite", "floor": 7, "rate": 9500.0, "status": "occupied"},
        {"num": "706", "type": "Suite", "floor": 7, "rate": 9500.0, "status": "occupied"},
        {"num": "707", "type": "Suite", "floor": 7, "rate": 9500.0, "status": "clean"},
        {"num": "708", "type": "Suite", "floor": 7, "rate": 9500.0, "status": "occupied"},
        {"num": "709", "type": "Suite", "floor": 7, "rate": 9500.0, "status": "occupied"},
        {"num": "710", "type": "Suite", "floor": 7, "rate": 9500.0, "status": "clean"},
    ]

    room_objects = {}
    for r in rooms_config:
        existing_room = db.query(Room).filter(Room.room_number == r["num"]).first()
        if not existing_room:
            room = Room(
                room_number=r["num"],
                room_type=r["type"],
                floor=r["floor"],
                base_rate=r["rate"],
                status=r["status"],
                notes=r.get("notes")
            )
            db.add(room)
            db.flush()
            room_objects[r["num"]] = room
        else:
            room_objects[r["num"]] = existing_room
    db.commit()

    # 3. Guest Profiles & Active Reservations
    sample_guests = [
        {"name": "Ananya Roy", "phone": "+919811122334", "vip": True, "room": "407", "prefs": {"pillow": "memory foam", "diet": "gluten-free", "drink": "green tea"}},
        {"name": "David Miller", "phone": "+14159876543", "vip": True, "room": "408", "prefs": {"newspaper": "FT", "late_checkout": "12:30 PM"}},
        {"name": "Rohit Kapoor", "phone": "+919829055443", "vip": False, "room": "301", "prefs": {"floor": "high", "room_temp": "21C"}},
        {"name": "Sneha Sen", "phone": "+919765432109", "vip": False, "room": "204", "prefs": {"allergies": "none"}},
        {"name": "Marcus Aurelius Vance", "phone": "+447911123456", "vip": True, "room": "409", "prefs": {"transport": "private SUV", "wine": "Pinot Noir"}},
        {"name": "Priyanka Mehra", "phone": "+919833344455", "vip": False, "room": "107", "prefs": {"pillow": "soft feather"}},
        {"name": "Karan Singhania", "phone": "+919988776655", "vip": False, "room": "310", "prefs": {"diet": "jain vegetarian"}}
    ]

    today = datetime.utcnow().date()
    today_str = today.strftime("%Y-%m-%d")
    tomorrow_str = (today + timedelta(days=2)).strftime("%Y-%m-%d")

    for g in sample_guests:
        profile = db.query(GuestProfile).filter(GuestProfile.phone == g["phone"]).first()
        if not profile:
            profile = GuestProfile(
                phone=g["phone"],
                name=g["name"],
                preferences=json.dumps(g["prefs"]),
                past_stay_count=random.randint(1, 6),
                vip_status=g["vip"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(10, 180))
            )
            db.add(profile)
            db.flush()

        room_obj = room_objects.get(g["room"])
        if room_obj:
            res = Reservation(
                guest_name=g["name"],
                phone=g["phone"],
                room_id=room_obj.id,
                check_in=today_str,
                check_out=tomorrow_str,
                status="checked_in",
                total_amount=room_obj.base_rate * 2,
                booking_channel=random.choice(["direct", "whatsapp", "booking_com", "mmt"]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(2, 14))
            )
            db.add(res)
    db.commit()

    # 4. Conversations, Messages, and Guest Requests
    guest_sneha = db.query(GuestProfile).filter(GuestProfile.phone == "+919765432109").first()
    if guest_sneha:
        c1 = Conversation(guest_profile_id=guest_sneha.id, channel="whatsapp", started_at=datetime.utcnow() - timedelta(hours=2), last_message_at=datetime.utcnow() - timedelta(minutes=15))
        db.add(c1)
        db.flush()
        db.add(Message(conversation_id=c1.id, sender="guest", content="Hi, my bathroom tap in Room 204 is leaking heavily and the AC is making a loud buzzing noise. It is impossible to sleep!", timestamp=datetime.utcnow() - timedelta(minutes=20)))
        db.add(Message(conversation_id=c1.id, sender="bot", content="Dear Sneha, we sincerely apologize for this inconvenience! ⚠️ I have flagged this as an urgent priority for our Duty Manager. A maintenance technician is on their way to Room 204.", timestamp=datetime.utcnow() - timedelta(minutes=19)))
        
        db.add(GuestRequest(
            conversation_id=c1.id,
            room_number="204",
            category="maintenance",
            status="escalated",
            sentiment_score=-0.75,
            escalated=True,
            escalation_reason="Urgent maintenance keywords detected (leaking, noise)",
            notes="Bathroom tap leaking + loud AC vibration in Room 204",
            created_at=datetime.utcnow() - timedelta(minutes=20)
        ))

    guest_priyanka = db.query(GuestProfile).filter(GuestProfile.phone == "+919833344455").first()
    if guest_priyanka:
        c2 = Conversation(guest_profile_id=guest_priyanka.id, channel="whatsapp", started_at=datetime.utcnow() - timedelta(hours=3), last_message_at=datetime.utcnow() - timedelta(minutes=45))
        db.add(c2)
        db.flush()
        db.add(Message(conversation_id=c2.id, sender="guest", content="Could you please send 2 extra feather pillows and dental kits to Room 107?", timestamp=datetime.utcnow() - timedelta(minutes=50)))
        db.add(Message(conversation_id=c2.id, sender="bot", content="Certainly Priyanka! 🛏️ I have dispatched our Housekeeping team for Room 107 with 2 feather pillows and dental kits. ETA is 10–15 mins.", timestamp=datetime.utcnow() - timedelta(minutes=49)))
        db.add(GuestRequest(
            conversation_id=c2.id,
            room_number="107",
            category="housekeeping",
            status="in_progress",
            sentiment_score=0.45,
            escalated=False,
            notes="2 feather pillows + dental kit delivery to Room 107",
            created_at=datetime.utcnow() - timedelta(minutes=50)
        ))

    guest_ananya = db.query(GuestProfile).filter(GuestProfile.phone == "+919811122334").first()
    if guest_ananya:
        c3 = Conversation(guest_profile_id=guest_ananya.id, channel="whatsapp", started_at=datetime.utcnow() - timedelta(hours=5), last_message_at=datetime.utcnow() - timedelta(hours=1))
        db.add(c3)
        db.flush()
        db.add(Message(conversation_id=c3.id, sender="guest", content="What is the Wi-Fi password and what time does breakfast start tomorrow?", timestamp=datetime.utcnow() - timedelta(hours=1, minutes=10)))
        db.add(Message(conversation_id=c3.id, sender="bot", content="Hello Ananya! 📶 Wi-Fi is `Heritage_Guest_5G` (Password: `WelcomeHeritage2026`). Breakfast is served 7:30 AM to 10:30 AM at The Heritage Bistro & Courtyard on 1st Floor.", timestamp=datetime.utcnow() - timedelta(hours=1, minutes=9)))
        db.add(GuestRequest(
            conversation_id=c3.id,
            room_number="407",
            category="inquiry",
            status="resolved",
            sentiment_score=0.80,
            escalated=False,
            notes="Wi-Fi and breakfast timings inquiry",
            created_at=datetime.utcnow() - timedelta(hours=1, minutes=10),
            resolved_at=datetime.utcnow() - timedelta(hours=1, minutes=5)
        ))
    db.commit()

    # 5. Historical 60-day Revenue Records
    for d in range(60, -1, -1):
        rec_date = today - timedelta(days=d)
        rec_date_str = rec_date.strftime("%Y-%m-%d")
        dow = rec_date.weekday()

        if dow in [4, 5]:  # Fri, Sat
            occ_pct = round(random.uniform(88.0, 97.5), 1)
            adr_val = round(random.uniform(5200.0, 5800.0), 0)
        elif dow == 6:  # Sun
            occ_pct = round(random.uniform(72.0, 84.0), 1)
            adr_val = round(random.uniform(4600.0, 5100.0), 0)
        elif dow in [1, 2]:  # Tue, Wed (slump)
            occ_pct = round(random.uniform(55.0, 68.0), 1)
            adr_val = round(random.uniform(3900.0, 4400.0), 0)
        else:
            occ_pct = round(random.uniform(66.0, 78.0), 1)
            adr_val = round(random.uniform(4300.0, 4800.0), 0)

        sold_rooms = int(round(70 * (occ_pct / 100.0)))
        room_rev = sold_rooms * adr_val
        fnb_rev = round(sold_rooms * random.uniform(650.0, 1100.0), 0)
        other_rev = round(sold_rooms * random.uniform(150.0, 350.0), 0)
        tot_rev = room_rev + fnb_rev + other_rev
        revpar_val = round(tot_rev / 70, 1)

        db.add(RevenueDaily(
            date=rec_date_str,
            room_revenue=room_rev,
            fnb_revenue=fnb_rev,
            other_revenue=other_rev,
            total_revenue=tot_rev,
            rooms_sold=sold_rooms,
            occupancy_rate=occ_pct,
            adr=adr_val,
            revpar=revpar_val,
            source="manual"
        ))
    db.commit()

    # 6. Expenses across 6 months (March 2026 - August 2026)
    months = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"]
    for m in months:
        is_august = (m == "2026-08")
        elec_amt = 142500.0 if is_august else round(random.uniform(108000.0, 116000.0), 0)
        
        expense_items = [
            {"category": "staff", "amount": 320000.0, "vendor": "Heritage Staff Payroll & Security", "conf": 0.98, "desc": f"Monthly Staff Salaries & Front Desk Wages for {m}"},
            {"category": "electricity", "amount": elec_amt, "vendor": "DISCOM State Electricity Corp", "conf": 0.95, "desc": f"Grid Power & High-load Chiller Utility Invoice for {m}"},
            {"category": "food", "amount": round(random.uniform(128000.0, 142000.0), 0), "vendor": "Fresh Farm Harvest & Artisanal Dairy", "conf": 0.92, "desc": f"Kitchen provisions, bakery & bistro inventory for {m}"},
            {"category": "ota_commission", "amount": round(random.uniform(85000.0, 98000.0), 0), "vendor": "Booking.com & MakeMyTrip Commissions", "conf": 0.96, "desc": f"Channel manager distribution commission for {m}"},
            {"category": "laundry", "amount": round(random.uniform(42000.0, 49000.0), 0), "vendor": "Royal Clean Industrial Linen Wash", "conf": 0.94, "desc": f"Bed linen, duvet, and pool towel washing for {m}"},
            {"category": "maintenance", "amount": round(random.uniform(38000.0, 48000.0), 0), "vendor": "Apex HVAC & Plumbing Services", "conf": 0.90, "desc": f"Elevator AMC, pool chemicals & AC maintenance for {m}"},
            {"category": "other", "amount": round(random.uniform(22000.0, 31000.0), 0), "vendor": "Office Supplies & Software SaaS", "conf": 0.88, "desc": f"Wi-Fi fiber optic lines, toiletries & guest amenities for {m}"},
        ]

        for item in expense_items:
            anom_flag = (is_august and item["category"] == "electricity")
            db.add(Expense(
                category=item["category"],
                amount=item["amount"],
                month=m,
                vendor=item["vendor"],
                description=item["desc"],
                parsed_confidence=item["conf"],
                anomaly_flag=anom_flag,
                source_doc_url=f"/uploads/invoices/{m}_{item['category']}.pdf",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 150))
            ))
    db.commit()

    # 7. Reviews across Platforms
    sample_reviews = [
        {
            "platform": "google", "rating": 5.0, "guest_name": "Rohan Deshmukh",
            "text": "Stunning boutique property! The courtyard breakfast buffet was exquisite and the WhatsApp concierge made room service requests effortless. Highly recommended.",
            "category": "none", "date": (today - timedelta(days=2)).strftime("%Y-%m-%d"),
            "status": "published"
        },
        {
            "platform": "booking", "rating": 4.5, "guest_name": "Sarah Jenkins",
            "text": "Loved the heritage decor and the rooftop pool. The room was spacious and clean. Only minor feedback: breakfast service was slightly busy around 9 AM.",
            "category": "breakfast", "date": (today - timedelta(days=4)).strftime("%Y-%m-%d"),
            "status": "published"
        },
        {
            "platform": "mmt", "rating": 3.0, "guest_name": "Karthik N.",
            "text": "The room ambiance was nice, but the Wi-Fi signal in room 308 kept dropping during my zoom call. Staff were polite and tried to reset it.",
            "category": "wifi", "date": (today - timedelta(days=6)).strftime("%Y-%m-%d"),
            "status": "pending"
        },
        {
            "platform": "tripadvisor", "rating": 5.0, "guest_name": "Elena Rostova",
            "text": "An unforgettable luxury experience in Jaipur! The Ayurvedic spa session was blissful and the staff treated us like royalty. We will definitely return.",
            "category": "none", "date": (today - timedelta(days=9)).strftime("%Y-%m-%d"),
            "status": "published"
        },
        {
            "platform": "agoda", "rating": 3.5, "guest_name": "Amitabh S.",
            "text": "Great location and tasty food, but late night street noise from the boulevard was audible in the first-floor courtyard room. Request high floor rooms.",
            "category": "noise", "date": (today - timedelta(days=12)).strftime("%Y-%m-%d"),
            "status": "pending"
        },
        {
            "platform": "google", "rating": 5.0, "guest_name": "Vikram Sethi",
            "text": "Best boutique hotel in the city! Cleanliness is top tier and prompt WhatsApp concierge service resolved all our queries instantly. 10/10.",
            "category": "none", "date": (today - timedelta(days=15)).strftime("%Y-%m-%d"),
            "status": "published"
        }
    ]

    for rev in sample_reviews:
        sentiment, _ = LLMService.categorize_review(rev["text"])
        draft = LLMService.draft_review_response(
            review_text=rev["text"],
            rating=rev["rating"],
            platform=rev["platform"],
            complaint_category=rev["category"]
        )
        db.add(Review(
            platform=rev["platform"],
            rating=rev["rating"],
            guest_name=rev["guest_name"],
            text=rev["text"],
            sentiment_score=sentiment,
            complaint_category=rev["category"],
            review_date=rev["date"],
            response_draft=draft,
            response_status=rev["status"],
            response_published_at=datetime.utcnow() if rev["status"] == "published" else None
        ))
    db.commit()

    # 8. Revenue Optimizer 14-day recommendations
    RevenueOptimizer.generate_recommendations_for_next_14_days(db)

    print("[SEED] Database seeded successfully with 70 rooms, guests, requests, reviews, expenses, and forecasts.")
    db.close()

if __name__ == "__main__":
    seed_database()
