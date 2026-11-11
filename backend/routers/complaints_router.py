from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/complaints", tags=["Farmer Support & Grievances"])

@router.post("", response_model=schemas.ComplaintResponse)
def submit_complaint(
    req: schemas.ComplaintCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_complaint = models.Complaint(
        user_id=current_user.id,
        category=req.category,
        subject=req.subject,
        description=req.description,
        status="open"
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

@router.get("/my-tickets", response_model=List[schemas.ComplaintResponse])
def get_my_tickets(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Complaint).filter(
        models.Complaint.user_id == current_user.id
    ).order_by(models.Complaint.id.desc()).all()
