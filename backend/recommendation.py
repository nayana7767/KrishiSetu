from typing import List, Dict, Any
import models
import schemas

def evaluate_scheme_eligibility(farmer_profile: models.FarmerProfile, scheme: models.GovernmentScheme) -> Dict[str, Any]:
    """
    Rule-based recommendation engine for KrishiSetu.
    Evaluates farmer's profile against scheme eligibility requirements.
    Categorizes into:
      1. eligible (Potentially Eligible)
      2. more_info_needed (More Information Required)
      3. not_eligible (Not Eligible Based on Known Criteria)
    """
    reasons = []
    missing_criteria = []
    score = 50  # baseline

    # If no farmer profile provided, require info
    if not farmer_profile:
        return {
            "eligibility_status": "more_info_needed",
            "match_score": 40,
            "reasons": ["General agricultural scheme in Karnataka. Complete your farmer profile to see specific match."],
            "missing_criteria": ["Farmer landholding", "Crops cultivated", "Irrigation profile"]
        }

    land = farmer_profile.land_acres
    category = farmer_profile.farmer_category.lower() if farmer_profile.farmer_category else ""
    crops_text = (farmer_profile.crops or "").lower()
    crops_list = [c.strip() for c in crops_text.split(",") if c.strip()]
    irrigation = (farmer_profile.irrigation_type or "").lower()
    district = (farmer_profile.district or "").lower()

    # 1. Landholding check
    if scheme.min_land_acres > 0 and land < scheme.min_land_acres:
        missing_criteria.append(f"Requires minimum {scheme.min_land_acres} acres (You have {land} acres)")
        score -= 40
    elif scheme.max_land_acres < 50 and land > scheme.max_land_acres:
        missing_criteria.append(f"Restricted to landholdings up to {scheme.max_land_acres} acres (You have {land} acres)")
        score -= 40
    else:
        score += 20
        reasons.append(f"Your landholding of {land} acres meets the scheme limit ({scheme.min_land_acres} to {scheme.max_land_acres} acres)")

    # 2. Farmer Category check (small_marginal, sc_st, woman, etc.)
    eligible_cats = [c.strip().lower() for c in (scheme.eligible_categories or "all").split(",") if c.strip()]
    if "all" in eligible_cats:
        reasons.append("Open to all farmer categories across Karnataka")
        score += 15
    else:
        is_cat_match = False
        if category in eligible_cats:
            is_cat_match = True
        elif category in ["sc_st", "woman"] and "small_marginal" in eligible_cats:
            is_cat_match = True  # SC/ST and women farmers receive small/marginal prioritization

        if is_cat_match:
            score += 25
            cat_label = category.replace("_", " ").title()
            reasons.append(f"Matches your farmer category profile: {cat_label}")
        else:
            missing_criteria.append(f"Scheme specifically prioritizes: {', '.join(eligible_cats).replace('_', ' ').title()}")
            score -= 15

    # 3. Crop suitability check
    eligible_crops = [c.strip().lower() for c in (scheme.eligible_crops or "all").split(",") if c.strip()]
    if "all" in eligible_crops:
        reasons.append("Applicable for multiple crops including horticulture and field crops")
        score += 10
    else:
        matching_crops = [c for c in crops_list if any(ec in c or c in ec for ec in eligible_crops)]
        if matching_crops:
            score += 25
            reasons.append(f"Your cultivated crop(s) ({', '.join(matching_crops).title()}) qualify for this programme")
        else:
            # Check if scheme is irrigation or machinery which might not be crop-exclusive
            if scheme.category in ["irrigation", "machinery", "infrastructure", "dairy"]:
                score += 5
                reasons.append(f"Broad asset-based assistance; may be used for current crops ({crops_text.title()})")
            else:
                missing_criteria.append(f"Scheme focuses on crops: {', '.join(eligible_crops).title()}")
                score -= 20

    # 4. Irrigation suitability check
    eligible_irrig = [i.strip().lower() for i in (scheme.eligible_irrigation or "all").split(",") if i.strip()]
    if "all" in eligible_irrig:
        pass
    else:
        if irrigation in eligible_irrig:
            score += 15
            reasons.append(f"Your current irrigation setup ({irrigation.title()}) is eligible")
        elif scheme.category == "irrigation":
            score += 15
            reasons.append(f"Designed to convert/upgrade your {irrigation.title()} water source into micro-irrigation")

    # 5. FRUITS ID check (Karnataka specific requirement)
    if farmer_profile.fruits_id:
        score += 10
        reasons.append(f"Registered Karnataka FRUITS ID ({farmer_profile.fruits_id}) will accelerate direct benefit transfer (DBT)")
    else:
        missing_criteria.append("FRUITS ID (FID) not yet linked — recommend generating FID at Raitha Samparka Kendra")

    # Determine status based on score and missing criteria
    if missing_criteria and any("Requires minimum" in m or "Restricted to" in m for m in missing_criteria):
        status = "not_eligible"
        score = max(score, 15)
    elif len(missing_criteria) >= 2 or not farmer_profile.fruits_id and score < 60:
        status = "more_info_needed"
    else:
        status = "eligible"
        score = min(score, 98)

    # Cap score
    score = max(10, min(100, score))

    return {
        "eligibility_status": status,
        "match_score": score,
        "reasons": reasons,
        "missing_criteria": missing_criteria
    }
