from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Expense
from backend.schemas import (
    ExpenseSchema, ExpenseCreate, MonthlyPnLSummary, ExpenseUploadResponse
)
from backend.services.expense_service import ExpenseService

router = APIRouter(prefix="/api/expenses", tags=["Expense Analyzer & P&L"])

@router.get("", response_model=List[ExpenseSchema])
def get_expenses(
    month: Optional[str] = None,
    category: Optional[str] = None,
    anomaly_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Expense)
    if month:
        query = query.filter(Expense.month == month)
    if category:
        query = query.filter(Expense.category == category)
    if anomaly_only:
        query = query.filter(Expense.anomaly_flag == True)
    return query.order_by(Expense.created_at.desc()).all()

@router.post("/create", response_model=ExpenseSchema)
def create_expense(
    exp_data: ExpenseCreate,
    db: Session = Depends(get_db)
):
    # Check for anomaly
    is_anom, _, _ = ExpenseService.check_anomaly(db, exp_data.category, exp_data.month, exp_data.amount)
    
    new_exp = Expense(
        category=exp_data.category,
        amount=exp_data.amount,
        month=exp_data.month,
        vendor=exp_data.vendor,
        description=exp_data.description,
        parsed_confidence=exp_data.parsed_confidence,
        source_doc_url=exp_data.source_doc_url,
        anomaly_flag=is_anom,
        created_at=datetime.utcnow()
    )
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

@router.post("/upload", response_model=ExpenseUploadResponse)
async def upload_invoice(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Ingests invoice or bill file/raw text, parses category, amount, vendor, and confidence.
    Flags low-confidence parses for manual review.
    """
    content_text = raw_text or ""
    filename = "manual_invoice_entry.pdf"
    
    if file:
        filename = file.filename
        try:
            content_bytes = await file.read()
            # If text/utf-8 readable
            content_text = content_bytes.decode("utf-8", errors="ignore")
        except Exception:
            content_text = f"Scanned bill invoice {filename}"

    if not content_text:
        content_text = f"Sample Electricity Bill DISCOM Rajasthan Power ₹142,500 for August 2026 Units: 14,200 kWh"

    # Parse using OCR / Rule extractor
    parsed = ExpenseService.parse_invoice_text(content_text, filename=filename)
    
    # Check anomaly against historical baseline
    is_anom, pct, reason = ExpenseService.check_anomaly(db, parsed["category"], parsed["month"], parsed["amount"])
    
    new_exp = Expense(
        category=parsed["category"],
        amount=parsed["amount"],
        month=parsed["month"],
        vendor=parsed["vendor"],
        description=parsed["description"],
        parsed_confidence=parsed["parsed_confidence"],
        source_doc_url=parsed["source_doc_url"],
        anomaly_flag=is_anom,
        created_at=datetime.utcnow()
    )
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)

    confidence_warning = parsed["parsed_confidence"] < 0.80
    msg = "Invoice parsed successfully."
    if confidence_warning:
        msg = f"Parsing confidence is moderate ({int(parsed['parsed_confidence']*100)}%). Please verify category and amount."
    if is_anom:
        msg += f" ⚠️ Anomaly alert: {reason}"

    return {
        "status": "success",
        "parsed_expense": new_exp,
        "message": msg,
        "confidence_warning": confidence_warning
    }

@router.get("/pnl/{month}", response_model=MonthlyPnLSummary)
def get_monthly_pnl(month: str, db: Session = Depends(get_db)):
    """
    Returns complete Monthly P&L (Total Revenue - Total Categorized Expenses) and MoM Anomalies.
    """
    return ExpenseService.get_monthly_pnl(db, month)
