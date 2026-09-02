from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import Room, Reservation, RateRecommendation

class RevenueOptimizer:
    BASE_HOTEL_ADR = 4200.0  # Baseline average daily rate across 70 rooms
    TOTAL_ROOMS = 70

    @classmethod
    def generate_recommendations_for_next_14_days(cls, db: Session) -> List[RateRecommendation]:
        """
        Generates dynamic pricing recommendations for the next 14 days
        based on confirmed bookings, historical day-of-week demand, and lead-time pickup.
        """
        today = datetime.utcnow().date()
        recommendations = []

        # Day of week demand multipliers (0=Mon, 1=Tue, ..., 4=Fri, 5=Sat, 6=Sun)
        dow_multipliers = {
            0: 0.68,  # Monday
            1: 0.58,  # Tuesday (midweek slump)
            2: 0.65,  # Wednesday
            3: 0.78,  # Thursday (business ramp-up)
            4: 0.92,  # Friday (weekend getaway)
            5: 0.96,  # Saturday (peak leisure)
            6: 0.76   # Sunday
        }

        # Clear old non-applied future recommendations or upsert
        for day_offset in range(14):
            target_date = today + timedelta(days=day_offset)
            date_str = target_date.strftime("%Y-%m-%d")
            dow = target_date.weekday()

            # Count confirmed reservations for this date
            booked_count = db.query(Reservation).filter(
                Reservation.check_in <= date_str,
                Reservation.check_out > date_str,
                Reservation.status.in_(["confirmed", "checked_in"])
            ).count()

            # Base model occupancy forecast combines booked count + expected pickup
            lead_days = day_offset
            expected_pickup_pct = max(0.0, (14 - lead_days) * 2.2)  # closer dates have less unbooked pickup
            base_demand_pct = dow_multipliers[dow] * 100.0
            
            # Forecasted Occupancy
            raw_forecast = (booked_count / cls.TOTAL_ROOMS * 100.0) + (base_demand_pct * 0.4)
            forecast_occ = min(round(raw_forecast, 1), 98.0)

            # Determine Pricing Delta & Reasoning
            if forecast_occ >= 85.0:
                demand_level = "surge"
                price_delta = 900.0 if forecast_occ >= 90 else 600.0
                rec_rate = cls.BASE_HOTEL_ADR + price_delta
                reasoning = (
                    f"High demand projected ({forecast_occ}% occupancy). Peak weekend/leisure pressure. "
                    f"Recommend yield-up by +₹{int(price_delta)} to maximize RevPAR without hurting booking conversion."
                )
            elif forecast_occ >= 70.0:
                demand_level = "high"
                price_delta = 400.0
                rec_rate = cls.BASE_HOTEL_ADR + price_delta
                reasoning = (
                    f"Solid demand ({forecast_occ}% occupancy). Modest pricing power. "
                    f"Recommend +₹{int(price_delta)} rate adjustment to capture quality ADR."
                )
            elif forecast_occ <= 58.0:
                demand_level = "low"
                price_delta = -500.0
                rec_rate = max(cls.BASE_HOTEL_ADR + price_delta, 3200.0)
                reasoning = (
                    f"Midweek demand slowdown ({forecast_occ}% occupancy). High price elasticity. "
                    f"Recommend promotional incentive -₹{abs(int(price_delta))} to attract business travelers and OTAs."
                )
            else:
                demand_level = "medium"
                rec_rate = cls.BASE_HOTEL_ADR
                reasoning = (
                    f"Balanced demand ({forecast_occ}% occupancy). Base rate of ₹{int(cls.BASE_HOTEL_ADR)} "
                    f"is optimally calibrated against historical pace."
                )

            # Check if record exists
            existing = db.query(RateRecommendation).filter(RateRecommendation.date == date_str).first()
            if existing:
                if not existing.applied:
                    existing.current_rate = cls.BASE_HOTEL_ADR
                    existing.recommended_rate = rec_rate
                    existing.occupancy_forecast = forecast_occ
                    existing.reasoning = reasoning
                    existing.demand_level = demand_level
                recommendations.append(existing)
            else:
                new_rec = RateRecommendation(
                    date=date_str,
                    current_rate=cls.BASE_HOTEL_ADR,
                    recommended_rate=rec_rate,
                    occupancy_forecast=forecast_occ,
                    reasoning=reasoning,
                    demand_level=demand_level,
                    applied=False
                )
                db.add(new_rec)
                recommendations.append(new_rec)

        db.commit()
        return recommendations

    @classmethod
    def apply_recommendation(cls, db: Session, recommendation_id: int) -> RateRecommendation:
        rec = db.query(RateRecommendation).filter(RateRecommendation.id == recommendation_id).first()
        if not rec:
            raise ValueError("Rate recommendation not found")
        
        rec.applied = True
        rec.applied_at = datetime.utcnow()
        rec.current_rate = rec.recommended_rate
        
        # Update active room base rates proportionally
        rooms = db.query(Room).all()
        delta_pct = (rec.recommended_rate - cls.BASE_HOTEL_ADR) / cls.BASE_HOTEL_ADR
        for r in rooms:
            if r.room_type == "Standard":
                r.base_rate = round(3500.0 * (1 + delta_pct), 0)
            elif r.room_type == "Deluxe":
                r.base_rate = round(4600.0 * (1 + delta_pct), 0)
            elif r.room_type == "Executive":
                r.base_rate = round(6200.0 * (1 + delta_pct), 0)
            elif r.room_type == "Suite":
                r.base_rate = round(9500.0 * (1 + delta_pct), 0)
        
        db.commit()
        db.refresh(rec)
        return rec
