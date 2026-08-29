from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import RateRecommendation
from backend.schemas import RateRecommendationSchema
from backend.services.revenue_optimizer import RevenueOptimizer

router = APIRouter(prefix="/api/pricing", tags=["Revenue Optimizer & Dynamic Pricing"])

@router.get("/recommendations", response_model=List[RateRecommendationSchema])
def get_rate_recommendations(db: Session = Depends(get_db)):
    """
    Generates and returns 14-day forward occupancy forecasts and dynamic pricing recommendations.
    """
    return RevenueOptimizer.generate_recommendations_for_next_14_days(db)

@router.post("/apply/{rec_id}", response_model=RateRecommendationSchema)
def apply_rate_recommendation(rec_id: int, db: Session = Depends(get_db)):
    """
    Applies the recommended rate delta to the hotel's room pricing matrix.
    """
    try:
        return RevenueOptimizer.apply_recommendation(db, rec_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
