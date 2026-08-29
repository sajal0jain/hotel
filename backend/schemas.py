from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: str
    password: str

class StaffUserSchema(BaseModel):
    id: int
    name: str
    email: str
    role: str
    class Config:
        from_attributes = True

# Rooms
class RoomBase(BaseModel):
    room_number: str
    room_type: str
    floor: int = 1
    base_rate: float = 3500.0
    status: str = "clean"
    notes: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    status: Optional[str] = None
    room_type: Optional[str] = None
    base_rate: Optional[float] = None
    notes: Optional[str] = None

class RoomSchema(RoomBase):
    id: int
    class Config:
        from_attributes = True

# Reservations
class ReservationBase(BaseModel):
    guest_name: str
    phone: str
    room_id: Optional[int] = None
    check_in: str
    check_out: str
    status: str = "confirmed"
    total_amount: float = 0.0
    booking_channel: str = "direct"

class ReservationCreate(ReservationBase):
    pass

class ReservationSchema(ReservationBase):
    id: int
    created_at: datetime
    room: Optional[RoomSchema] = None
    class Config:
        from_attributes = True

# Guest Profiles
class GuestProfileBase(BaseModel):
    phone: str
    name: Optional[str] = None
    preferences: Optional[str] = "{}"
    past_stay_count: int = 0
    vip_status: bool = False

class GuestProfileSchema(GuestProfileBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Chat & WhatsApp
class MessageSchema(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime
    class Config:
        from_attributes = True

class ConversationSchema(BaseModel):
    id: int
    guest_profile_id: int
    channel: str
    started_at: datetime
    last_message_at: datetime
    guest_profile: Optional[GuestProfileSchema] = None
    messages: List[MessageSchema] = []
    class Config:
        from_attributes = True

class WhatsAppIncoming(BaseModel):
    From: str
    Body: str
    ProfileName: Optional[str] = None

class SimulatorMessageRequest(BaseModel):
    phone: str
    name: Optional[str] = "Guest"
    message: str
    room_number: Optional[str] = None

class StaffReplyRequest(BaseModel):
    conversation_id: int
    message: str

# Guest Requests
class GuestRequestSchema(BaseModel):
    id: int
    conversation_id: Optional[int] = None
    room_number: Optional[str] = None
    category: str
    status: str
    sentiment_score: float
    escalated: bool
    escalation_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class GuestRequestUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    escalated: Optional[bool] = None

# Expenses
class ExpenseBase(BaseModel):
    category: str
    amount: float
    month: str
    vendor: Optional[str] = None
    description: Optional[str] = None
    parsed_confidence: float = 1.0
    source_doc_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseSchema(ExpenseBase):
    id: int
    anomaly_flag: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ExpenseUploadResponse(BaseModel):
    status: str
    parsed_expense: ExpenseSchema
    message: str
    confidence_warning: bool

# Daily Revenue & PnL
class RevenueDailySchema(BaseModel):
    id: int
    date: str
    room_revenue: float
    fnb_revenue: float
    other_revenue: float
    total_revenue: float
    rooms_sold: int
    occupancy_rate: float
    adr: float
    revpar: float
    source: str
    class Config:
        from_attributes = True

class MonthlyPnLSummary(BaseModel):
    month: str
    total_revenue: float
    room_revenue: float
    fnb_revenue: float
    other_revenue: float
    total_expenses: float
    expenses_by_category: Dict[str, float]
    net_operating_income: float
    profit_margin_pct: float
    anomalies: List[Dict[str, Any]]

# Reviews
class ReviewBase(BaseModel):
    platform: str
    rating: float
    guest_name: Optional[str] = None
    text: str
    review_date: str

class ReviewCreate(ReviewBase):
    pass

class ReviewSchema(ReviewBase):
    id: int
    sentiment_score: float
    complaint_category: Optional[str] = None
    response_draft: Optional[str] = None
    response_status: str
    response_published_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ReviewResponseDraftRequest(BaseModel):
    review_id: int
    custom_tone: Optional[str] = "empathetic and professional"

class ReviewResponseApproveRequest(BaseModel):
    response_text: str

# Pricing / Rate Recommendations
class RateRecommendationSchema(BaseModel):
    id: int
    date: str
    current_rate: float
    recommended_rate: float
    occupancy_forecast: float
    reasoning: str
    demand_level: str
    applied: bool
    applied_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Q&A & Daily Report
class NaturalLanguageQueryRequest(BaseModel):
    query: str

class NaturalLanguageQueryResponse(BaseModel):
    query: str
    category: str
    answer: str
    data: Optional[Dict[str, Any]] = None
    chart_type: Optional[str] = None
    suggested_followups: List[str] = []

class DailyAIReport(BaseModel):
    date: str
    occupancy_rate: float
    occupied_rooms: int
    total_rooms: int
    adr: float
    revpar: float
    yesterday_revenue: float
    housekeeping_summary: Dict[str, int]
    guest_sentiment_summary: Dict[str, Any]
    escalated_items_count: int
    key_highlights: List[str]
    ai_suggested_action: str
