from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Administrator Dashboard"])

@router.get("/stats")
def get_admin_dashboard_stats(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_farmers = db.query(models.User).filter(models.User.role == "farmer").count()
    total_providers = db.query(models.User).filter(models.User.role == "provider").count()
    active_machinery = db.query(models.Machinery).filter(models.Machinery.is_active == True).count()
    total_schemes = db.query(models.GovernmentScheme).filter(models.GovernmentScheme.is_active == True).count()
    total_loans = db.query(models.LoanProduct).filter(models.LoanProduct.is_active == True).count()
    total_bookings = db.query(models.MachineryBooking).count()
    completed_bookings = db.query(models.MachineryBooking).filter(models.MachineryBooking.status == "completed").count()
    total_applications = db.query(models.ApplicationRecord).count()
    total_complaints = db.query(models.Complaint).count()
    open_complaints = db.query(models.Complaint).filter(models.Complaint.status == "open").count()

    all_bookings = db.query(models.MachineryBooking).all()
    gross_booking_value = sum(b.total_amount for b in all_bookings if b.status in ["confirmed", "in_progress", "completed"])

    # Distribution of machinery categories for chart
    category_counts = {}
    machinery = db.query(models.Machinery).all()
    for m in machinery:
        cat = m.category.title()
        category_counts[cat] = category_counts.get(cat, 0) + 1

    chart_data = [{"category": k, "count": v} for k, v in category_counts.items()]

    return {
        "total_farmers": total_farmers,
        "total_providers": total_providers,
        "active_machinery": active_machinery,
        "total_schemes": total_schemes,
        "total_loans": total_loans,
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "total_applications": total_applications,
        "total_complaints": total_complaints,
        "open_complaints": open_complaints,
        "gross_booking_value": round(gross_booking_value, 2),
        "machinery_distribution": chart_data
    }

@router.get("/users")
def get_all_users(
    role: Optional[str] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.User)
    if role and role != "all":
        query = query.filter(models.User.role == role)
    return query.order_by(models.User.id.desc()).all()

@router.get("/schemes", response_model=List[schemas.SchemeResponse])
def get_all_admin_schemes(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.GovernmentScheme).order_by(models.GovernmentScheme.id.asc()).all()

@router.post("/schemes", response_model=schemas.SchemeResponse)
def create_scheme(
    scheme_data: schemas.SchemeResponse,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    new_scheme = models.GovernmentScheme(
        scheme_code=scheme_data.scheme_code,
        scheme_name=scheme_data.scheme_name,
        kannada_name=scheme_data.kannada_name,
        hindi_name=scheme_data.hindi_name,
        department=scheme_data.department,
        scheme_type=scheme_data.scheme_type,
        category=scheme_data.category,
        description=scheme_data.description,
        benefits_summary=scheme_data.benefits_summary,
        financial_assistance=scheme_data.financial_assistance,
        subsidy_percentage=scheme_data.subsidy_percentage,
        min_land_acres=scheme_data.min_land_acres,
        max_land_acres=scheme_data.max_land_acres,
        eligible_categories=scheme_data.eligible_categories,
        eligible_crops=scheme_data.eligible_crops,
        eligible_irrigation=scheme_data.eligible_irrigation,
        required_documents=scheme_data.required_documents,
        official_url=scheme_data.official_url,
        helpline_number=scheme_data.helpline_number,
        application_instructions=scheme_data.application_instructions,
        opening_date=scheme_data.opening_date,
        closing_date=scheme_data.closing_date,
        is_active=True
    )
    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)
    return new_scheme

@router.put("/schemes/{scheme_id}/toggle-active")
def toggle_scheme_active(
    scheme_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    scheme = db.query(models.GovernmentScheme).filter(models.GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    scheme.is_active = not scheme.is_active
    db.commit()
    return {"id": scheme.id, "is_active": scheme.is_active}

@router.get("/complaints", response_model=List[schemas.ComplaintResponse])
def get_all_complaints(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.Complaint).order_by(models.Complaint.id.desc()).all()

@router.put("/complaints/{complaint_id}/resolve")
def resolve_complaint(
    complaint_id: int,
    admin_response: str,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.status = "resolved"
    complaint.admin_response = admin_response
    db.commit()
    return {"id": complaint.id, "status": "resolved", "admin_response": admin_response}
