from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Room, Reservation, GuestProfile
from backend.schemas import (
    RoomSchema, RoomCreate, RoomUpdate,
    ReservationSchema, ReservationCreate,
    GuestProfileSchema
)

router = APIRouter(prefix="/api/operations", tags=["Operations"])

@router.get("/rooms", response_model=List[RoomSchema])
def get_rooms(
    status: Optional[str] = None,
    floor: Optional[int] = None,
    room_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Room)
    if status:
        query = query.filter(Room.status == status)
    if floor:
        query = query.filter(Room.floor == floor)
    if room_type:
        query = query.filter(Room.room_type == room_type)
    return query.order_by(Room.room_number).all()

@router.put("/rooms/{room_id}/status", response_model=RoomSchema)
def update_room_status(
    room_id: int,
    update_data: RoomUpdate,
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if update_data.status:
        room.status = update_data.status
    if update_data.notes is not None:
        room.notes = update_data.notes
    if update_data.base_rate:
        room.base_rate = update_data.base_rate
    
    db.commit()
    db.refresh(room)
    return room

@router.get("/reservations", response_model=List[ReservationSchema])
def get_reservations(
    status: Optional[str] = None,
    date: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Reservation)
    if status:
        query = query.filter(Reservation.status == status)
    if date:
        query = query.filter(Reservation.check_in <= date, Reservation.check_out >= date)
    return query.order_by(Reservation.check_in.desc()).limit(limit).all()

@router.post("/reservations", response_model=ReservationSchema)
def create_reservation(
    res_data: ReservationCreate,
    db: Session = Depends(get_db)
):
    # Check or create guest profile
    profile = db.query(GuestProfile).filter(GuestProfile.phone == res_data.phone).first()
    if not profile:
        profile = GuestProfile(
            phone=res_data.phone,
            name=res_data.guest_name,
            past_stay_count=1
        )
        db.add(profile)
    else:
        profile.past_stay_count += 1
        if profile.name != res_data.guest_name:
            profile.name = res_data.guest_name

    new_res = Reservation(**res_data.model_dump())
    db.add(new_res)

    # If assigned room, update room status
    if res_data.room_id and res_data.status == "checked_in":
        room = db.query(Room).filter(Room.id == res_data.room_id).first()
        if room:
            room.status = "occupied"

    db.commit()
    db.refresh(new_res)
    return new_res

@router.put("/reservations/{res_id}/check-in", response_model=ReservationSchema)
def check_in_reservation(res_id: int, room_id: Optional[int] = None, db: Session = Depends(get_db)):
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    res.status = "checked_in"
    if room_id:
        res.room_id = room_id
    
    if res.room_id:
        room = db.query(Room).filter(Room.id == res.room_id).first()
        if room:
            room.status = "occupied"
            
    db.commit()
    db.refresh(res)
    return res

@router.put("/reservations/{res_id}/check-out", response_model=ReservationSchema)
def check_out_reservation(res_id: int, db: Session = Depends(get_db)):
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    res.status = "checked_out"
    if res.room_id:
        room = db.query(Room).filter(Room.id == res.room_id).first()
        if room:
            room.status = "dirty"  # automatically moves to housekeeping queue
            
    db.commit()
    db.refresh(res)
    return res

@router.get("/guest-profiles", response_model=List[GuestProfileSchema])
def get_guest_profiles(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(GuestProfile)
    if search:
        query = query.filter(
            (GuestProfile.name.ilike(f"%{search}%")) |
            (GuestProfile.phone.ilike(f"%{search}%"))
        )
    return query.order_by(GuestProfile.past_stay_count.desc()).all()
