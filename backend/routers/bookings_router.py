import random
import string
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Machinery Bookings"])

def generate_booking_code() -> str:
    timestamp = datetime.utcnow().strftime("%y%m%d")
    rand_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"KS-{timestamp}-{rand_chars}"

@router.post("", response_model=schemas.BookingResponse)
def create_booking(
    booking_req: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch machinery
    machine = db.query(models.Machinery).filter(
        models.Machinery.id == booking_req.machinery_id,
        models.Machinery.is_active == True
    ).first()

    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The selected machinery is unavailable or no longer listed."
        )

    # 2. Concurrency Check: Prevent Double-Booking on same equipment, date and time slot!
    # Slots overlap if:
    # - exact same slot
    # - or either booking is 'full_day'
    active_conflicting_statuses = ["requested", "confirmed", "in_progress"]

    conflicting_bookings = db.query(models.MachineryBooking).filter(
        models.MachineryBooking.machinery_id == booking_req.machinery_id,
        models.MachineryBooking.booking_date == booking_req.booking_date,
        models.MachineryBooking.status.in_(active_conflicting_statuses)
    ).all()

    for existing in conflicting_bookings:
        if (
            existing.time_slot == booking_req.time_slot or
            existing.time_slot == "full_day" or
            booking_req.time_slot == "full_day"
        ):
            slot_label = existing.time_slot.replace("_", " ").title()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"This equipment is already reserved on {booking_req.booking_date} for slot: {slot_label}. Please select another date or time slot."
            )

    # 3. Calculate transparent pricing breakdown
    hours = max(1.0, booking_req.duration_hours)
    rental_cost = machine.price_per_hour * hours

    operator_cost = 0.0
    if booking_req.with_operator and machine.has_operator:
        operator_cost = machine.operator_rate_per_hour * hours

    distance = max(0.0, booking_req.distance_km)
    transport_cost = machine.transport_rate_per_km * distance

    total_amount = rental_cost + operator_cost + transport_cost

    # 4. Create and persist booking record
    new_booking = models.MachineryBooking(
        booking_code=generate_booking_code(),
        machinery_id=machine.id,
        farmer_id=current_user.id,
        booking_date=booking_req.booking_date,
        time_slot=booking_req.time_slot,
        duration_hours=hours,
        acreage=booking_req.acreage,
        rental_cost=round(rental_cost, 2),
        operator_cost=round(operator_cost, 2),
        transport_cost=round(transport_cost, 2),
        total_amount=round(total_amount, 2),
        status="requested",
        farmer_village=booking_req.farmer_village,
        delivery_required=distance > 0,
        notes=booking_req.notes
    )

    db.add(new_booking)

    # Add notification for farmer
    farmer_notification = models.Notification(
        user_id=current_user.id,
        title="Machinery Booking Submitted",
        message=f"Booking {new_booking.booking_code} for {machine.name} on {booking_req.booking_date} has been placed. Provider will confirm shortly.",
        type="booking"
    )
    db.add(farmer_notification)

    # Add notification for provider
    if machine.provider:
        provider_notification = models.Notification(
            user_id=machine.provider.user_id,
            title="New Equipment Booking Request",
            message=f"New booking request from {current_user.full_name} for {machine.name} on {booking_req.booking_date}.",
            type="booking"
        )
        db.add(provider_notification)

    db.commit()
    db.refresh(new_booking)

    return new_booking

@router.get("/my-bookings", response_model=List[schemas.BookingResponse])
def get_farmer_bookings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookings = db.query(models.MachineryBooking).filter(
        models.MachineryBooking.farmer_id == current_user.id
    ).order_by(models.MachineryBooking.id.desc()).all()
    return bookings

@router.post("/{booking_id}/cancel", response_model=schemas.BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(models.MachineryBooking).filter(
        models.MachineryBooking.id == booking_id,
        models.MachineryBooking.farmer_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status in ["completed", "in_progress"]:
        raise HTTPException(status_code=400, detail="Cannot cancel an in-progress or completed booking")

    booking.status = "cancelled"
    booking.notes = (booking.notes or "") + " [Cancelled by Farmer]"
    db.commit()
    db.refresh(booking)
    return booking
