import sys
import os
sys.path.append(os.path.dirname(__file__))

from starlette.testclient import TestClient
from main import app

def test_full_platform():
    print("==================================================")
    print("STARTING KRISHISETU FULL-STACK END-TO-END TESTS")
    print("==================================================")

    with TestClient(app) as client:
        # 1. Health & Root
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print("✓ Root & Health check OK")

        # 2. Login as Farmer
        res = client.post("/api/auth/login", json={
            "email": "farmer@krishisetu.in",
            "password": "farmer123"
        })
        assert res.status_code == 200, f"Farmer login failed: {res.text}"
        farmer_data = res.json()
        farmer_token = farmer_data["access_token"]
        farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
        print(f"✓ Farmer logged in: {farmer_data['user']['full_name']} (Role: {farmer_data['user']['role']})")

        # 3. Scheme Recommendations
        res = client.get("/api/schemes/recommendations", headers=farmer_headers)
        assert res.status_code == 200, f"Recommendations failed: {res.text}"
        recs = res.json()
        eligible_schemes = [r for r in recs if r["eligibility_status"] == "eligible"]
        print(f"✓ Scheme recommendations OK: {len(recs)} total, {len(eligible_schemes)} potentially eligible")
        assert len(eligible_schemes) > 0
        first_rec = eligible_schemes[0]
        print(f"   Top Match: {first_rec['scheme']['scheme_name']} ({first_rec['match_score']}% match)")
        print(f"   Why you match: {first_rec['reasons']}")

        # 4. Loan Comparison Tool
        res = client.post("/api/loans/compare", json={
            "needed_amount": 100000,
            "purpose": "crop",
            "tenure_months": 12
        })
        assert res.status_code == 200, f"Loan compare failed: {res.text}"
        loan_results = res.json()
        print(f"✓ Loan comparison OK: {len(loan_results)} matching products")
        top_loan = loan_results[0]
        print(f"   Top Option: {top_loan['loan']['loan_name']}")
        print(f"   Base: {top_loan['loan']['base_interest_rate']}%, Subsidized: {top_loan['loan']['subsidized_interest_rate']}%, Saved/Yr: ₹{top_loan['government_interest_saving']}")

        # 5. Machinery Listings & Map Pins
        res = client.get("/api/machinery")
        assert res.status_code == 200
        machines = res.json()
        assert len(machines) >= 8
        print(f"✓ Machinery listings count: {len(machines)}")

        res = client.get("/api/machinery/map-pins")
        assert res.status_code == 200
        pins = res.json()
        assert len(pins) >= 8
        print(f"✓ Leaflet Map pins count: {len(pins)}")

        # 6. Concurrency Check: Double-Booking Prevention!
        machine_id = machines[0]["id"]
        test_date = "2026-11-25"
        test_slot = "morning_8_12"

        # Step A: Place First Booking
        res1 = client.post("/api/bookings", headers=farmer_headers, json={
            "machinery_id": machine_id,
            "booking_date": test_date,
            "time_slot": test_slot,
            "duration_hours": 4.0,
            "acreage": 2.5,
            "with_operator": True,
            "distance_km": 6.0,
            "farmer_village": "Guthalu, Mandya",
            "notes": "First test booking"
        })
        # If already exists from previous run, that's fine or create a new date
        if res1.status_code == 409:
            test_date = "2026-11-26"
            res1 = client.post("/api/bookings", headers=farmer_headers, json={
                "machinery_id": machine_id,
                "booking_date": test_date,
                "time_slot": test_slot,
                "duration_hours": 4.0,
                "acreage": 2.5,
                "with_operator": True,
                "distance_km": 6.0,
                "farmer_village": "Guthalu, Mandya",
                "notes": "First test booking"
            })
        assert res1.status_code == 200, f"First booking failed: {res1.text}"
        booking1 = res1.json()
        print(f"✓ Booking 1 created: {booking1['booking_code']} (Total: ₹{booking1['total_amount']})")

        # Step B: Attempt Conflicting Overlapping Booking on Same Machine, Same Date & Same Slot
        res2 = client.post("/api/bookings", headers=farmer_headers, json={
            "machinery_id": machine_id,
            "booking_date": test_date,
            "time_slot": test_slot,
            "duration_hours": 3.0,
            "acreage": 1.5,
            "with_operator": True,
            "distance_km": 5.0,
            "farmer_village": "Kestur, Mandya",
            "notes": "Second overlapping booking"
        })
        assert res2.status_code == 409, f"Double booking prevention failed! Expected 409 but got {res2.status_code}"
        print(f"✓ DOUBLE-BOOKING CONCURRENCY PROTECTION VERIFIED: Conflicting request rejected with 409 Conflict: {res2.json()['detail']}")

        # 7. Document Checklist & Progress
        res = client.get("/api/documents/checklist?scheme_id=1", headers=farmer_headers)
        assert res.status_code == 200
        checklist = res.json()
        print(f"✓ Document checklist loaded: {len(checklist)} documents")

        # 8. Login as Provider & Manage Booking
        res = client.post("/api/auth/login", json={
            "email": "provider@krishisetu.in",
            "password": "provider123"
        })
        assert res.status_code == 200
        provider_token = res.json()["access_token"]
        provider_headers = {"Authorization": f"Bearer {provider_token}"}

        res = client.get("/api/provider/dashboard-stats", headers=provider_headers)
        assert res.status_code == 200
        p_stats = res.json()
        print(f"✓ Provider dashboard: {p_stats['provider_name']} (Total Bookings: {p_stats['total_bookings']}, Gross: ₹{p_stats['total_estimated_earnings']})")

        # Accept the booking created earlier
        res = client.put(f"/api/provider/bookings/{booking1['id']}/status", headers=provider_headers, json={
            "status": "confirmed",
            "provider_notes": "Tractor confirmed. Reaching field at 8:00 AM."
        })
        assert res.status_code == 200
        print(f"✓ Provider accepted and confirmed booking {booking1['booking_code']}")

        # 9. Login as Administrator & Verify System Analytics
        res = client.post("/api/auth/login", json={
            "email": "admin@krishisetu.in",
            "password": "admin123"
        })
        assert res.status_code == 200
        admin_token = res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        res = client.get("/api/admin/stats", headers=admin_headers)
        assert res.status_code == 200
        a_stats = res.json()
        print(f"✓ Admin console stats: Farmers: {a_stats['total_farmers']}, Providers: {a_stats['total_providers']}, Live Machinery: {a_stats['active_machinery']}, Gross Booking: ₹{a_stats['gross_booking_value']}")
        print(f"   Machinery Distribution: {a_stats['machinery_distribution']}")

        print("==================================================")
        print("ALL 9 TEST SUITES PASSED FLAWLESSLY (100% SUCCESS)")
        print("==================================================")

if __name__ == "__main__":
    test_full_platform()
