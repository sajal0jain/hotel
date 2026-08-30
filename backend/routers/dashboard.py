"""
Basic occupancy + revenue summary — a Phase 4 preview so there's something
real to look at once Phase 1 data exists. Owner dashboard will build on this.
"""
from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.config import settings
from backend.models import Room, Reservation

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _occupied_reservations_for_date(db: Session, day: date):
    """Reservations that count as 'occupying a room' on the given date."""
    day_str = day.isoformat()
    return (
        db.query(Reservation)
        .filter(
            Reservation.check_in <= day_str,
            Reservation.check_out > day_str,
            Reservation.status.in_(["confirmed", "checked_in", "booked"]),
        )
        .all()
    )


@router.get("/occupancy-today")
def occupancy_today(db: Session = Depends(get_db)):
    today = date.today()
    total_rooms = db.query(Room).count() or settings.TOTAL_ROOMS

    occupied_reservations = _occupied_reservations_for_date(db, today)
    occupied = len(occupied_reservations)

    occupancy_pct = round((occupied / total_rooms) * 100, 1) if total_rooms else 0

    rates = [r.total_amount for r in occupied_reservations if r.total_amount is not None]
    adr = round(float(sum(rates) / len(rates)), 2) if rates else 4650.0
    total_room_revenue = float(sum(rates)) if rates else 0.0
    revpar = round(total_room_revenue / total_rooms, 2) if total_rooms else 0.0

    return {
        "date": today.isoformat(),
        "total_rooms": total_rooms,
        "occupied_rooms": occupied,
        "occupancy_pct": occupancy_pct,
        "adr": adr,
        "revpar": revpar,
        "room_revenue_today": round(total_room_revenue, 2),
    }


@router.get("/room-status-summary")
def room_status_summary(db: Session = Depends(get_db)):
    today = date.today()
    total_rooms = db.query(Room).count() or settings.TOTAL_ROOMS
    occupied = len(_occupied_reservations_for_date(db, today))

    clean = db.query(Room).filter(Room.status == "clean").count()
    dirty = db.query(Room).filter(Room.status == "dirty").count()
    maintenance = db.query(Room).filter(Room.status == "maintenance").count()

    return {
        "total_rooms": total_rooms,
        "occupied": occupied,
        "clean_ready": clean,
        "dirty_turnaround": dirty,
        "maintenance": maintenance,
    }


@router.get("/occupancy-trend")
def occupancy_trend(days: int = 7, db: Session = Depends(get_db)):
    total_rooms = db.query(Room).count() or settings.TOTAL_ROOMS
    today = date.today()
    trend = []

    for offset in range(days):
        day = today - timedelta(days=offset)
        day_str = day.isoformat()
        occupied = (
            db.query(Reservation)
            .filter(
                Reservation.check_in <= day_str,
                Reservation.check_out > day_str,
                Reservation.status.in_(["confirmed", "checked_in", "booked"]),
            )
            .count()
        )
        trend.append(
            {
                "date": day.isoformat(),
                "occupancy_pct": round((occupied / total_rooms) * 100, 1)
                if total_rooms
                else 0,
            }
        )

    return list(reversed(trend))
