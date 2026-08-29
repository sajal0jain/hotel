from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String(20), unique=True, index=True, nullable=False)
    room_type = Column(String(50), nullable=False)  # Standard, Deluxe, Executive, Suite
    floor = Column(Integer, default=1)
    base_rate = Column(Float, default=3500.0)
    status = Column(String(30), default="clean")  # clean, dirty, maintenance, occupied
    notes = Column(String(255), nullable=True)

    reservations = relationship("Reservation", back_populates="room")

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    guest_name = Column(String(100), nullable=False)
    phone = Column(String(30), index=True, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    check_in = Column(String(30), nullable=False)  # ISO Date string e.g. '2026-08-29'
    check_out = Column(String(30), nullable=False)
    status = Column(String(30), default="confirmed")  # confirmed, checked_in, checked_out, cancelled
    total_amount = Column(Float, default=0.0)
    booking_channel = Column(String(50), default="direct")
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="reservations")

class GuestProfile(Base):
    __tablename__ = "guest_profiles"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    preferences = Column(Text, default="{}")  # JSON string
    past_stay_count = Column(Integer, default=0)
    vip_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversations = relationship("Conversation", back_populates="guest_profile")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    guest_profile_id = Column(Integer, ForeignKey("guest_profiles.id"), nullable=False)
    channel = Column(String(30), default="whatsapp")
    started_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)

    guest_profile = relationship("GuestProfile", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    requests = relationship("GuestRequest", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender = Column(String(20), nullable=False)  # guest, bot, staff
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class GuestRequest(Base):
    __tablename__ = "guest_requests"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    room_number = Column(String(20), nullable=True)
    category = Column(String(50), default="inquiry")  # housekeeping, amenities, food_beverage, billing, maintenance, inquiry, complaint, other
    status = Column(String(30), default="open")  # open, in_progress, resolved, escalated
    sentiment_score = Column(Float, default=0.0)  # -1.0 to 1.0
    escalated = Column(Boolean, default=False)
    escalation_reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    conversation = relationship("Conversation", back_populates="requests")

class StaffUser(Base):
    __tablename__ = "staff_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="staff")  # owner, manager, front_desk, staff
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)  # staff, electricity, food, laundry, ota_commission, maintenance, other
    amount = Column(Float, nullable=False)
    source_doc_url = Column(String(255), nullable=True)
    month = Column(String(20), nullable=False)  # 'YYYY-MM'
    vendor = Column(String(100), nullable=True)
    description = Column(String(255), nullable=True)
    parsed_confidence = Column(Float, default=1.0)  # 0.0 - 1.0
    anomaly_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RevenueDaily(Base):
    __tablename__ = "revenue_daily"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(20), unique=True, index=True, nullable=False)  # 'YYYY-MM-DD'
    room_revenue = Column(Float, default=0.0)
    fnb_revenue = Column(Float, default=0.0)
    other_revenue = Column(Float, default=0.0)
    total_revenue = Column(Float, default=0.0)
    rooms_sold = Column(Integer, default=0)
    occupancy_rate = Column(Float, default=0.0)  # 0.0 to 100.0%
    adr = Column(Float, default=0.0)  # Average Daily Rate
    revpar = Column(Float, default=0.0)  # Revenue Per Available Room
    source = Column(String(30), default="manual")  # manual, pms

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)  # google, booking, mmt, agoda, tripadvisor
    rating = Column(Float, nullable=False)  # 1.0 to 5.0
    guest_name = Column(String(100), nullable=True)
    text = Column(Text, nullable=False)
    sentiment_score = Column(Float, default=0.0)  # -1.0 to 1.0
    complaint_category = Column(String(50), nullable=True)  # cleanliness, wifi, breakfast, noise, billing, service, none
    review_date = Column(String(20), nullable=False)  # 'YYYY-MM-DD'
    response_draft = Column(Text, nullable=True)
    response_status = Column(String(30), default="pending")  # pending, approved, published, ignored
    response_published_at = Column(DateTime, nullable=True)

class RateRecommendation(Base):
    __tablename__ = "rate_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(20), index=True, nullable=False)  # 'YYYY-MM-DD'
    current_rate = Column(Float, nullable=False)
    recommended_rate = Column(Float, nullable=False)
    occupancy_forecast = Column(Float, nullable=False)  # %
    reasoning = Column(Text, nullable=False)
    demand_level = Column(String(20), default="medium")  # low, medium, high, surge
    applied = Column(Boolean, default=False)
    applied_at = Column(DateTime, nullable=True)
