from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_optional_current_user
from recommendation import evaluate_scheme_eligibility

router = APIRouter(prefix="/api/schemes", tags=["Government Schemes"])

@router.get("", response_model=List[schemas.SchemeResponse])
def get_schemes(
    category: Optional[str] = None,
    scheme_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.GovernmentScheme).filter(models.GovernmentScheme.is_active == True)

    if category and category != "all":
        query = query.filter(models.GovernmentScheme.category == category)
    if scheme_type and scheme_type != "all":
        query = query.filter(models.GovernmentScheme.scheme_type == scheme_type)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.GovernmentScheme.scheme_name.ilike(search_filter)) |
            (models.GovernmentScheme.description.ilike(search_filter)) |
            (models.GovernmentScheme.department.ilike(search_filter))
        )

    return query.order_by(models.GovernmentScheme.id.asc()).all()

@router.get("/recommendations", response_model=List[schemas.SchemeRecommendation])
def get_recommendations(
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    # Guest simulation parameters if user not logged in
    land_acres: Optional[float] = Query(None),
    farmer_category: Optional[str] = Query(None),
    crops: Optional[str] = Query(None),
    irrigation_type: Optional[str] = Query(None),
    fruits_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Determine farmer profile to use
    farmer_profile = None
    if current_user and current_user.farmer_profile:
        farmer_profile = current_user.farmer_profile
    elif land_acres is not None:
        # Build mock profile for guest query
        farmer_profile = models.FarmerProfile(
            land_acres=land_acres,
            farmer_category=farmer_category or "small_marginal",
            crops=crops or "Paddy",
            irrigation_type=irrigation_type or "canal",
            fruits_id=fruits_id,
            district="Mandya",
            taluk="Mandya",
            village="Guthalu"
        )

    schemes = db.query(models.GovernmentScheme).filter(models.GovernmentScheme.is_active == True).all()
    recommendations = []

    for scheme in schemes:
        eval_result = evaluate_scheme_eligibility(farmer_profile, scheme)
        recommendations.append({
            "scheme": scheme,
            "eligibility_status": eval_result["eligibility_status"],
            "match_score": eval_result["match_score"],
            "reasons": eval_result["reasons"],
            "missing_criteria": eval_result["missing_criteria"]
        })

    # Sort: eligible first (sorted by match score desc), then more_info_needed, then not_eligible
    status_order = {"eligible": 0, "more_info_needed": 1, "not_eligible": 2}
    recommendations.sort(key=lambda x: (status_order.get(x["eligibility_status"], 3), -x["match_score"]))

    return recommendations

@router.get("/{scheme_id}", response_model=schemas.SchemeResponse)
def get_scheme_by_id(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(models.GovernmentScheme).filter(models.GovernmentScheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme
