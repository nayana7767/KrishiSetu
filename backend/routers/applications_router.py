from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Application Tracker"])

REJECTION_REASONS_GUIDE = [
    {
        "issue_code": "NAME_MISMATCH",
        "title": "Name Mismatch between Aadhaar and Pahani (RTC)",
        "explanation": "The applicant's name spelling or initials on the Aadhaar card do not exactly match the landowner name recorded in Bhoomi RTC.",
        "corrective_steps": [
            "Visit the local Nadakacheri or Tahsildar office with your original Aadhaar and RTC.",
            "Request an 'Aadhaar-RTC Name Synchronization Certificate' or update the surname in Bhoomi.",
            "Alternatively, update your Aadhaar demographic details online at myaadhaar.uidai.gov.in to reflect the exact name in your land records."
        ]
    },
    {
        "issue_code": "NPCI_DBT_NOT_SEEDED",
        "title": "Bank Account Not Seeded with NPCI / Aadhaar",
        "explanation": "Government subsidy funds are disbursed strictly via Aadhaar Payment Bridge (APB) / DBT. If your bank account is not mapped to the NPCI server, the DBT transfer bounces.",
        "corrective_steps": [
            "Visit your home bank branch where you maintain your savings account.",
            "Fill out the 'Aadhaar Seeding and NPCI Mapping Consent Form'.",
            "Request the branch manager to enable DBT on your account and check your DBT status on the PM-KISAN portal or bank app within 48 hours."
        ]
    },
    {
        "issue_code": "LAND_MUTATION_PENDING",
        "title": "Land Title / Joint Family Mutation Incomplete",
        "explanation": "The survey number is still registered under a deceased parent's or joint family name, and the individual mutation (Podi/Khata) has not been updated.",
        "corrective_steps": [
            "Submit a Mutation application (Form 21) at Nadakacheri or via Karnataka Bhoomi online.",
            "Attach Family Tree (Vamsha Vruksha) issued by the Revenue Inspector.",
            "Once the Mutation extract (J-Slip) is approved, generate a new single-owner Pahani and resubmit the scheme application."
        ]
    },
    {
        "issue_code": "EXPIRED_CASTE_INCOME_CERT",
        "title": "Expired or Invalid Caste/Income Certificate (RD Number)",
        "explanation": "Caste and income certificates in Karnataka are valid for a fixed tenure (typically 5 years). An expired RD number voids special subsidy rates (80-90%).",
        "corrective_steps": [
            "Log in to nadakacheri.karnataka.gov.in or visit any Grama One centre.",
            "Apply for a fresh Caste & Income Certificate using your previous RD number as reference.",
            "Once approved (usually 7-14 days), update the application with the new RD number."
        ]
    },
    {
        "issue_code": "INCOMPLETE_EQUIPMENT_QUOTATION",
        "title": "Machinery Quotation from Non-Empanelled Dealer",
        "explanation": "Subsidies under SMAM or Raitha Siri require quotations from dealers registered with the Department of Agriculture.",
        "corrective_steps": [
            "Obtain the list of approved manufacturers and empanelled dealers from your Taluk Raitha Samparka Kendra (RSK).",
            "Collect a revised quotation with valid GSTIN, serial number, and test certificate numbers.",
            "Upload the revised quotation to your application file."
        ]
    }
]

@router.get("", response_model=List[schemas.ApplicationResponse])
def get_my_applications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(models.ApplicationRecord).filter(
        models.ApplicationRecord.user_id == current_user.id
    ).order_by(models.ApplicationRecord.id.desc()).all()
    return apps

@router.post("", response_model=schemas.ApplicationResponse)
def create_application_record(
    app_data: schemas.ApplicationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_app = models.ApplicationRecord(
        user_id=current_user.id,
        scheme_id=app_data.scheme_id,
        loan_id=app_data.loan_id,
        title=app_data.title,
        department=app_data.department,
        reference_number=app_data.reference_number,
        submission_date=app_data.submission_date or "2026-11-01",
        current_status=app_data.current_status,
        status_notes=app_data.status_notes or "Self-recorded application by farmer.",
        is_official_api=False
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.put("/{app_id}/status", response_model=schemas.ApplicationResponse)
def update_application_status(
    app_id: int,
    status_update: schemas.ApplicationStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(models.ApplicationRecord).filter(
        models.ApplicationRecord.id == app_id,
        models.ApplicationRecord.user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")

    app.current_status = status_update.current_status
    if status_update.status_notes:
        app.status_notes = status_update.status_notes
    if status_update.rejection_reason:
        app.rejection_reason = status_update.rejection_reason
    if status_update.corrective_action:
        app.corrective_action = status_update.corrective_action

    db.commit()
    db.refresh(app)
    return app

@router.get("/rejection-guide")
def get_rejection_guide():
    """Returns curated corrective actions for common agricultural scheme rejection issues."""
    return REJECTION_REASONS_GUIDE
