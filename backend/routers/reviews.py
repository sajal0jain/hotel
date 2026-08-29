from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import Review
from backend.schemas import (
    ReviewSchema, ReviewCreate, ReviewResponseDraftRequest, ReviewResponseApproveRequest
)
from backend.services.llm_service import LLMService

router = APIRouter(prefix="/api/reviews", tags=["Review Manager & AI Responses"])

@router.get("", response_model=List[ReviewSchema])
def get_reviews(
    platform: Optional[str] = None,
    status: Optional[str] = None,
    complaint_category: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    if platform:
        query = query.filter(Review.platform == platform)
    if status:
        query = query.filter(Review.response_status == status)
    if complaint_category:
        query = query.filter(Review.complaint_category == complaint_category)
    if min_rating is not None:
        query = query.filter(Review.rating >= min_rating)
    if max_rating is not None:
        query = query.filter(Review.rating <= max_rating)
    return query.order_by(Review.review_date.desc()).all()

@router.get("/stats")
def get_review_stats(db: Session = Depends(get_db)):
    """
    Computes platform ratings distribution and complaint cluster breakdown.
    """
    all_reviews = db.query(Review).all()
    total_count = len(all_reviews) or 1

    platforms = {}
    complaint_clusters = {}
    pending_responses = 0

    for r in all_reviews:
        # Platform aggregation
        if r.platform not in platforms:
            platforms[r.platform] = {"count": 0, "total_rating": 0.0}
        platforms[r.platform]["count"] += 1
        platforms[r.platform]["total_rating"] += r.rating

        # Complaint categories
        cat = r.complaint_category or "none"
        complaint_clusters[cat] = complaint_clusters.get(cat, 0) + 1

        if r.response_status == "pending":
            pending_responses += 1

    platform_stats = {}
    for p, val in platforms.items():
        platform_stats[p] = {
            "count": val["count"],
            "avg_rating": round(val["total_rating"] / val["count"], 2)
        }

    overall_avg = round(sum(r.rating for r in all_reviews) / total_count, 2)

    return {
        "total_reviews": total_count,
        "overall_average_rating": overall_avg,
        "pending_responses": pending_responses,
        "platform_breakdown": platform_stats,
        "complaint_clusters": complaint_clusters,
        "api_feasibility_note": (
            "Google reviews can sync via Google Business Profile API. "
            "Booking.com, MakeMyTrip, and Agoda do not offer public review APIs; "
            "recommend automated CSV import or certified channel manager aggregator to prevent ToS risk."
        )
    }

@router.post("/draft-response")
def draft_ai_review_response(
    req: ReviewResponseDraftRequest,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == req.review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    draft = LLMService.draft_review_response(
        review_text=review.text,
        rating=review.rating,
        platform=review.platform,
        complaint_category=review.complaint_category,
        tone=req.custom_tone
    )
    
    review.response_draft = draft
    db.commit()
    db.refresh(review)
    return {"review_id": review.id, "response_draft": draft}

@router.put("/{review_id}/approve", response_model=ReviewSchema)
def approve_and_publish_response(
    review_id: int,
    approve_data: ReviewResponseApproveRequest,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.response_draft = approve_data.response_text
    review.response_status = "published"
    review.response_published_at = datetime.utcnow()
    
    db.commit()
    db.refresh(review)
    return review

@router.post("/ingest", response_model=ReviewSchema)
def ingest_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db)
):
    # Sentiment & complaint categorization
    sentiment, category = LLMService.categorize_review(review_in.text)
    
    # Auto-generate draft
    draft = LLMService.draft_review_response(
        review_text=review_in.text,
        rating=review_in.rating,
        platform=review_in.platform,
        complaint_category=category
    )

    new_rev = Review(
        platform=review_in.platform,
        rating=review_in.rating,
        guest_name=review_in.guest_name or "Verified Guest",
        text=review_in.text,
        sentiment_score=sentiment,
        complaint_category=category,
        review_date=review_in.review_date,
        response_draft=draft,
        response_status="pending"
    )
    db.add(new_rev)
    db.commit()
    db.refresh(new_rev)
    return new_rev
