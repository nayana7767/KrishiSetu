import sys
import os
sys.path.append(os.path.dirname(__file__))

from database import SessionLocal, engine, Base
import models
from recommendation import evaluate_scheme_eligibility
from routers.loans_router import compare_loans
from routers.bookings_router import create_booking
import schemas

def run_direct_tests():
    print("==================================================")
    print("DIRECT IN-PROCESS TEST OF ALL CORE MODULES")
    print("==================================================")

    db = SessionLocal()
    try:
        # 1. Verify Users & Roles
        farmer = db.query(models.User).filter(models.User.email == "farmer@krishisetu.in").first()
        provider = db.query(models.User).filter(models.User.email == "provider@krishisetu.in").first()
        admin = db.query(models.User).filter(models.User.email == "admin@krishisetu.in").first()

        assert farmer is not None and farmer.role == "farmer"
        assert provider is not None and provider.role == "provider"
        assert admin is not None and admin.role == "admin"
        print(f"✓ Users verified: Farmer '{farmer.full_name}', Provider '{provider.full_name}', Admin '{admin.full_name}'")

        # 2. Verify Rule-Based Scheme Recommendations
        farmer_prof = farmer.farmer_profile
        schemes = db.query(models.GovernmentScheme).filter(models.GovernmentScheme.is_active == True).all()
        print(f"✓ Active Government Schemes in DB: {len(schemes)}")

        eligible_count = 0
        for s in schemes:
            eval_res = evaluate_scheme_eligibility(farmer_prof, s)
            if eval_res["eligibility_status"] == "eligible":
                eligible_count += 1
                print(f"   -> Eligible: {s.scheme_name} (Score: {eval_res['match_score']}%)")
                print(f"      Reasons: {eval_res['reasons']}")
        assert eligible_count > 0, "Expected at least 1 eligible scheme"
        print(f"✓ Recommendation Engine passed: {eligible_count} eligible schemes for 2.5 acres Mandya farmer")

        # 3. Verify Loan Comparison Calculator
        compare_req = schemas.LoanCompareRequest(
            needed_amount=100000.0,
            purpose="crop",
            tenure_months=12
        )
        loan_res = compare_loans(compare_req, db)
        assert len(loan_res) > 0
        top_loan = loan_res[0]
        print(f"✓ Loan Comparison passed: Top match '{top_loan['loan'].loan_name}'")
        print(f"   Bank Rate: {top_loan['loan'].base_interest_rate}%, Subsidized: {top_loan['loan'].subsidized_interest_rate}%, Govt Savings: ₹{top_loan['government_interest_saving']}")
        print(f"   Monthly EMI: ₹{top_loan['estimated_monthly_emi']}")

        # 4. Verify Machinery Listings & Locations
        machinery_items = db.query(models.Machinery).filter(models.Machinery.is_active == True).all()
        assert len(machinery_items) >= 8
        first_m = machinery_items[0]
        print(f"✓ Machinery Listings verified: {len(machinery_items)} total across Karnataka")
        print(f"   Sample: {first_m.name} at {first_m.village}, {first_m.district} (Rate: ₹{first_m.price_per_hour}/hr)")

        # 5. Verify Booking & Concurrency Double-Booking Prevention!
        test_date = "2026-11-28"
        test_slot = "morning_8_12"

        # Check existing bookings for that slot
        existing = db.query(models.MachineryBooking).filter(
            models.MachineryBooking.machinery_id == first_m.id,
            models.MachineryBooking.booking_date == test_date,
            models.MachineryBooking.time_slot == test_slot
        ).first()

        if not existing:
            booking_req = schemas.BookingCreate(
                machinery_id=first_m.id,
                booking_date=test_date,
                time_slot=test_slot,
                duration_hours=4.0,
                acreage=2.5,
                with_operator=True,
                distance_km=5.0,
                farmer_village="Guthalu, Mandya"
            )
            b1 = create_booking(booking_req, farmer, db)
            print(f"✓ Booking created successfully: {b1.booking_code} (Total: ₹{b1.total_amount})")

        # Now attempt duplicate booking on same slot
        conflict_detected = False
        try:
            booking_req2 = schemas.BookingCreate(
                machinery_id=first_m.id,
                booking_date=test_date,
                time_slot=test_slot,
                duration_hours=3.0,
                acreage=1.5,
                with_operator=True,
                distance_km=4.0,
                farmer_village="Kestur, Mandya"
            )
            create_booking(booking_req2, farmer, db)
        except Exception as e:
            conflict_detected = True
            print(f"✓ DOUBLE-BOOKING CONCURRENCY EXCEPTION CAUGHT: {e.detail}")

        assert conflict_detected, "Double-booking prevention failed to reject conflicting slot!"

        print("==================================================")
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
        print("==================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_direct_tests()
