from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user, require_provider

router = APIRouter(prefix="/api/provider", tags=["Machinery Provider Management"])

@router.get("/dashboard-stats")
def get_provider_dashboard_stats(
    current_user: models.User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = current_user.machinery_provider
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")

    machinery_items = db.query(models.Machinery).filter(
        models.Machinery.provider_id == provider.id
    ).all()
    machinery_ids = [m.id for m in machinery_items]

    bookings = []
    if machinery_ids:
        bookings = db.query(models.MachineryBooking).filter(
            models.MachineryBooking.machinery_id.in_(machinery_ids)
        ).all()

    total_earnings = sum(b.total_amount for b in bookings if b.status in ["confirmed", "in_progress", "completed"])
    completed_earnings = sum(b.total_amount for b in bookings if b.status == "completed")
    pending_requests = len([b for b in bookings if b.status == "requested"])
    active_bookings = len([b for b in bookings if b.status in ["confirmed", "in_progress"]])

    return {
        "provider_name": provider.business_name,
        "is_verified": provider.is_verified,
        "rating": provider.rating,
        "total_machinery": len(machinery_items),
        "total_bookings": len(bookings),
        "pending_requests": pending_requests,
        "active_bookings": active_bookings,
        "completed_bookings": len([b for b in bookings if b.status == "completed"]),
        "total_estimated_earnings": round(total_earnings, 2),
        "total_completed_earnings": round(completed_earnings, 2)
    }

@router.get("/my-machinery", response_model=List[schemas.MachineryResponse])
def get_my_machinery(
    current_user: models.User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = current_user.machinery_provider
    if not provider:
        return []
    return db.query(models.Machinery).filter(models.Machinery.provider_id == provider.id).all()

@router.post("/machinery", response_model=schemas.MachineryResponse)
def add_machinery(
    machinery_data: schemas.MachineryCreate,
    current_user: models.User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = current_user.machinery_provider
    if not provider:
        # Create default provider profile if missing
        provider = models.MachineryProvider(
            user_id=current_user.id,
            business_name=f"{current_user.full_name}'s Agri Services",
            contact_name=current_user.full_name,
            phone=current_user.phone,
            district=machinery_data.district,
            taluk=machinery_data.taluk,
            village=machinery_data.village,
            is_verified=True,
            rating=4.9
        )
        db.add(provider)
        db.flush()

    new_machine = models.Machinery(
        provider_id=provider.id,
        name=machinery_data.name,
        model_name=machinery_data.model_name,
        category=machinery_data.category,
        description=machinery_data.description,
        image_url=machinery_data.image_url or "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=600",
        price_per_hour=machinery_data.price_per_hour,
        price_per_acre=machinery_data.price_per_acre,
        price_per_day=machinery_data.price_per_day,
        has_operator=machinery_data.has_operator,
        operator_rate_per_hour=machinery_data.operator_rate_per_hour,
        transport_rate_per_km=machinery_data.transport_rate_per_km,
        equipment_condition=machinery_data.equipment_condition,
        horsepower=machinery_data.horsepower,
        district=machinery_data.district,
        taluk=machinery_data.taluk,
        village=machinery_data.village,
        latitude=machinery_data.latitude or 12.5218,
        longitude=machinery_data.longitude or 76.8951,
        is_active=True
    )
    db.add(new_machine)
    db.commit()
    db.refresh(new_machine)
    return new_machine

@router.put("/machinery/{machinery_id}/toggle-active", response_model=schemas.MachineryResponse)
def toggle_machinery_active(
    machinery_id: int,
    current_user: models.User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = current_user.machinery_provider
    machine = db.query(models.Machinery).filter(
        models.Machinery.id == machinery_id,
        models.Machinery.provider_id == provider.id
    ).first()

    if not machine:
        raise HTTPException(status_code=404, detail="Equipment not found")

    machine.is_active = not machine.is_active
    db.commit()
    db.refresh(machine)
    return machine

@router.get("/bookings", response_model=List[schemas.BookingResponse])
def get_provider_bookings(
    current_user: models.User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = current_user.machinery_provider
    if not provider:
        return []

    machinery_ids = [m.id for m in provider.machinery]
    if not machinery_ids:
        return []

    return db.query(models.MachineryBooking).filter(
        models.MachineryBooking.machinery_id.in_(machinery_ids)
    ).order_by(models.MachineryBooking.id.desc()).all()

@router.put("/bookings/{booking_id}/status", response_model=schemas.BookingResponse)
def update_booking_status(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    current_user: models.User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = current_user.machinery_provider
    machinery_ids = [m.id for m in provider.machinery]

    booking = db.query(models.MachineryBooking).filter(
        models.MachineryBooking.id == booking_id,
        models.MachineryBooking.machinery_id.in_(machinery_ids)
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found for your equipment")

    valid_statuses = ["confirmed", "rejected", "cancelled", "in_progress", "completed"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    booking.status = status_update.status
    if status_update.provider_notes:
        booking.provider_notes = status_update.provider_notes

    # Add notification for the farmer
    farmer_notification = models.Notification(
        user_id=booking.farmer_id,
        title=f"Booking Status: {status_update.status.title()}",
        message=f"Your booking {booking.booking_code} status has been updated to '{status_update.status.upper()}'. {status_update.provider_notes or ''}",
        type="booking"
    )
    db.add(farmer_notification)

    db.commit()
    db.refresh(booking)
    return booking
