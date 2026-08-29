from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Form, Response, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import (
    GuestProfile, Conversation, Message, GuestRequest, Room, Reservation
)
from backend.schemas import (
    ConversationSchema, MessageSchema, GuestRequestSchema,
    GuestRequestUpdate, SimulatorMessageRequest, StaffReplyRequest
)
from backend.services.llm_service import LLMService

router = APIRouter(tags=["WhatsApp Concierge & Guest Requests"])

@router.post("/webhook/whatsapp")
async def twilio_whatsapp_webhook(
    From: str = Form(...),
    Body: str = Form(...),
    ProfileName: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Twilio WhatsApp Webhook endpoint.
    Processes guest WhatsApp messages, classifies intent, scores sentiment,
    triggers escalation if needed, and returns a formatted TwiML response.
    """
    # Clean phone number (e.g. 'whatsapp:+919829012345' -> '+919829012345')
    clean_phone = From.replace("whatsapp:", "").strip()
    guest_name = ProfileName or "Valued Guest"

    # 1. Auto-create or get Guest Profile
    guest = db.query(GuestProfile).filter(GuestProfile.phone == clean_phone).first()
    if not guest:
        guest = GuestProfile(
            phone=clean_phone,
            name=guest_name,
            past_stay_count=1
        )
        db.add(guest)
        db.commit()
        db.refresh(guest)
    elif ProfileName and not guest.name:
        guest.name = ProfileName
        db.commit()

    # 2. Find or create Conversation
    conversation = db.query(Conversation).filter(
        Conversation.guest_profile_id == guest.id,
        Conversation.channel == "whatsapp"
    ).first()
    if not conversation:
        conversation = Conversation(
            guest_profile_id=guest.id,
            channel="whatsapp",
            started_at=datetime.utcnow(),
            last_message_at=datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    else:
        conversation.last_message_at = datetime.utcnow()

    # 3. Log Guest Incoming Message
    guest_msg = Message(
        conversation_id=conversation.id,
        sender="guest",
        content=Body,
        timestamp=datetime.utcnow()
    )
    db.add(guest_msg)

    # 4. Check active reservation for room number
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    active_res = db.query(Reservation).filter(
        Reservation.phone == clean_phone,
        Reservation.status.in_(["confirmed", "checked_in"])
    ).first()
    room_number = None
    if active_res and active_res.room:
        room_number = active_res.room.room_number

    # 5. Process with LLM Intelligence & KB
    analysis = LLMService.classify_and_respond_concierge(
        message=Body,
        guest_name=guest.name or "Guest",
        room_number=room_number
    )

    # 6. Log Bot Response Message
    bot_msg = Message(
        conversation_id=conversation.id,
        sender="bot",
        content=analysis["reply"],
        timestamp=datetime.utcnow()
    )
    db.add(bot_msg)

    # 7. Create or update GuestRequest if applicable
    if analysis["intent"] in ["in_stay_request", "complaint"] or analysis["escalated"]:
        req = GuestRequest(
            conversation_id=conversation.id,
            room_number=room_number or "Inquiry",
            category=analysis["category"],
            status="escalated" if analysis["escalated"] else "open",
            sentiment_score=analysis["sentiment_score"],
            escalated=analysis["escalated"],
            escalation_reason=analysis["escalation_reason"],
            notes=Body,
            created_at=datetime.utcnow()
        )
        db.add(req)

    db.commit()

    # 8. Return Twilio TwiML XML
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{analysis["reply"]}</Message>
</Response>"""
    return Response(content=twiml_response, media_type="application/xml")

@router.post("/api/concierge/simulator")
def simulate_whatsapp_chat(
    req_data: SimulatorMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Interactive WhatsApp Simulator endpoint for live dashboard testing.
    """
    clean_phone = req_data.phone.strip()
    guest_name = req_data.name or "Guest"

    # Guest Profile
    guest = db.query(GuestProfile).filter(GuestProfile.phone == clean_phone).first()
    if not guest:
        guest = GuestProfile(phone=clean_phone, name=guest_name, past_stay_count=1)
        db.add(guest)
        db.commit()
        db.refresh(guest)

    # Conversation
    conversation = db.query(Conversation).filter(
        Conversation.guest_profile_id == guest.id
    ).first()
    if not conversation:
        conversation = Conversation(
            guest_profile_id=guest.id,
            channel="whatsapp",
            started_at=datetime.utcnow(),
            last_message_at=datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    else:
        conversation.last_message_at = datetime.utcnow()

    # Log incoming guest message
    db.add(Message(
        conversation_id=conversation.id,
        sender="guest",
        content=req_data.message,
        timestamp=datetime.utcnow()
    ))

    # Room number resolution
    room_number = req_data.room_number
    if not room_number:
        active_res = db.query(Reservation).filter(
            Reservation.phone == clean_phone,
            Reservation.status.in_(["confirmed", "checked_in"])
        ).first()
        if active_res and active_res.room:
            room_number = active_res.room.room_number

    # LLM Analysis & Response
    analysis = LLMService.classify_and_respond_concierge(
        message=req_data.message,
        guest_name=guest.name or "Guest",
        room_number=room_number
    )

    # Log bot response
    db.add(Message(
        conversation_id=conversation.id,
        sender="bot",
        content=analysis["reply"],
        timestamp=datetime.utcnow()
    ))

    # Create Request
    new_request_id = None
    if analysis["intent"] in ["in_stay_request", "complaint"] or analysis["escalated"]:
        req = GuestRequest(
            conversation_id=conversation.id,
            room_number=room_number or "Inquiry",
            category=analysis["category"],
            status="escalated" if analysis["escalated"] else "open",
            sentiment_score=analysis["sentiment_score"],
            escalated=analysis["escalated"],
            escalation_reason=analysis["escalation_reason"],
            notes=req_data.message,
            created_at=datetime.utcnow()
        )
        db.add(req)
        db.flush()
        new_request_id = req.id

    db.commit()

    return {
        "reply": analysis["reply"],
        "intent": analysis["intent"],
        "category": analysis["category"],
        "sentiment_score": analysis["sentiment_score"],
        "escalated": analysis["escalated"],
        "escalation_reason": analysis["escalation_reason"],
        "conversation_id": conversation.id,
        "request_id": new_request_id
    }

@router.get("/api/concierge/conversations", response_model=List[ConversationSchema])
def get_conversations(db: Session = Depends(get_db)):
    return db.query(Conversation).order_by(Conversation.last_message_at.desc()).all()

@router.get("/api/concierge/conversations/{conv_id}/messages", response_model=List[MessageSchema])
def get_conversation_messages(conv_id: int, db: Session = Depends(get_db)):
    return db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.timestamp.asc()).all()

@router.post("/api/concierge/reply")
def staff_reply_to_guest(reply_data: StaffReplyRequest, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == reply_data.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    msg = Message(
        conversation_id=conv.id,
        sender="staff",
        content=reply_data.message,
        timestamp=datetime.utcnow()
    )
    db.add(msg)
    conv.last_message_at = datetime.utcnow()
    
    # Auto-resolve or update pending requests for this conversation
    requests = db.query(GuestRequest).filter(
        GuestRequest.conversation_id == conv.id,
        GuestRequest.status.in_(["open", "escalated"])
    ).all()
    for r in requests:
        r.status = "in_progress"

    db.commit()
    return {"status": "success", "message": "Staff reply sent to WhatsApp guest"}

@router.get("/api/concierge/requests", response_model=List[GuestRequestSchema])
def get_guest_requests(
    status: Optional[str] = None,
    escalated_only: bool = False,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(GuestRequest)
    if status:
        query = query.filter(GuestRequest.status == status)
    if escalated_only:
        query = query.filter(GuestRequest.escalated == True)
    if category:
        query = query.filter(GuestRequest.category == category)
    return query.order_by(GuestRequest.created_at.desc()).all()

@router.put("/api/concierge/requests/{req_id}", response_model=GuestRequestSchema)
def update_guest_request(
    req_id: int,
    update_data: GuestRequestUpdate,
    db: Session = Depends(get_db)
):
    req = db.query(GuestRequest).filter(GuestRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if update_data.status:
        req.status = update_data.status
        if update_data.status == "resolved":
            req.resolved_at = datetime.utcnow()
            req.escalated = False
    if update_data.notes:
        req.notes = update_data.notes
    if update_data.escalated is not None:
        req.escalated = update_data.escalated
        
    db.commit()
    db.refresh(req)
    return req
