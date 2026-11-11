from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/loans", tags=["Agricultural Loans"])

@router.get("", response_model=List[schemas.LoanResponse])
def get_loans(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.LoanProduct).filter(models.LoanProduct.is_active == True)
    if category and category != "all":
        query = query.filter(models.LoanProduct.category == category)
    return query.order_by(models.LoanProduct.id.asc()).all()

@router.post("/compare", response_model=List[schemas.LoanCompareResult])
def compare_loans(
    req: schemas.LoanCompareRequest,
    db: Session = Depends(get_db)
):
    loans = db.query(models.LoanProduct).filter(models.LoanProduct.is_active == True).all()
    results = []

    for loan in loans:
        # Check amount range fit
        if req.needed_amount > loan.max_amount * 1.5:
            continue

        # Standard simple EMI formula for demonstration comparison:
        # P * r * (1+r)^n / ((1+r)^n - 1)
        p = req.needed_amount
        r_annual = loan.subsidized_interest_rate / 100.0
        r_monthly = r_annual / 12.0
        n = min(req.tenure_months, loan.max_tenure_months)

        if r_monthly > 0 and n > 0:
            emi = (p * r_monthly * ((1 + r_monthly) ** n)) / (((1 + r_monthly) ** n) - 1)
        else:
            emi = p / (n if n > 0 else 12)

        annual_base = p * (loan.base_interest_rate / 100.0)
        annual_subsidized = p * (loan.subsidized_interest_rate / 100.0)
        gov_saving = max(0.0, annual_base - annual_subsidized)

        # Match fit logic based on purpose
        fit = "Good Option"
        if req.purpose == "crop" and loan.category in ["kcc", "crop_loan"]:
            fit = "Highly Recommended for Crops"
        elif req.purpose == "equipment" and loan.category in ["machinery_loan"]:
            fit = "Highly Recommended for Machinery"
        elif req.purpose == "irrigation" and loan.category in ["irrigation_loan"]:
            fit = "Highly Recommended for Water & Irrigation"
        elif req.purpose == "livestock" and loan.category in ["dairy_loan"]:
            fit = "Highly Recommended for Dairy & Livestock"

        results.append({
            "loan": loan,
            "estimated_monthly_emi": round(emi, 2),
            "annual_interest_base": round(annual_base, 2),
            "annual_interest_subsidized": round(annual_subsidized, 2),
            "government_interest_saving": round(gov_saving, 2),
            "is_collateral_free": not loan.collateral_required,
            "match_fit": fit
        })

    # Sort results with recommended fits first
    results.sort(key=lambda x: (0 if "Highly" in x["match_fit"] else 1, x["estimated_monthly_emi"]))
    return results

@router.get("/{loan_id}", response_model=schemas.LoanResponse)
def get_loan_by_id(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.LoanProduct).filter(models.LoanProduct.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan product not found")
    return loan
