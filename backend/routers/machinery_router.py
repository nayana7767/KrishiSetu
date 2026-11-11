from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/machinery", tags=["Agricultural Machinery Marketplace"])

@router.get("", response_model=List[schemas.MachineryResponse])
def get_machinery_listings(
    district: Optional[str] = None,
    taluk: Optional[str] = None,
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    has_operator: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Machinery).filter(models.Machinery.is_active == True)

    if district and district != "all":
        query = query.filter(models.Machinery.district.ilike(f"%{district}%"))
    if taluk and taluk != "all":
        query = query.filter(models.Machinery.taluk.ilike(f"%{taluk}%"))
    if category and category != "all":
        query = query.filter(models.Machinery.category == category)
    if max_price is not None and max_price > 0:
        query = query.filter(models.Machinery.price_per_hour <= max_price)
    if has_operator is not None:
        query = query.filter(models.Machinery.has_operator == has_operator)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Machinery.name.ilike(search_filter)) |
            (models.Machinery.model_name.ilike(search_filter)) |
            (models.Machinery.village.ilike(search_filter)) |
            (models.Machinery.description.ilike(search_filter))
        )

    return query.order_by(models.Machinery.id.asc()).all()

@router.get("/map-pins")
def get_machinery_map_pins(
    category: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Machinery).filter(models.Machinery.is_active == True)
    if category and category != "all":
        query = query.filter(models.Machinery.category == category)
    if district and district != "all":
        query = query.filter(models.Machinery.district.ilike(f"%{district}%"))

    items = query.all()
    pins = []
    for m in items:
        provider_name = m.provider.business_name if m.provider else "Local Provider"
        provider_phone = m.provider.phone if m.provider else "9876543210"
        pins.append({
            "id": m.id,
            "name": m.name,
            "category": m.category,
            "price_per_hour": m.price_per_hour,
            "price_per_acre": m.price_per_acre,
            "district": m.district,
            "taluk": m.taluk,
            "village": m.village,
            "latitude": m.latitude or 12.5218,
            "longitude": m.longitude or 76.8951,
            "has_operator": m.has_operator,
            "image_url": m.image_url,
            "provider_name": provider_name,
            "provider_phone": provider_phone
        })
    return pins

@router.get("/{machinery_id}", response_model=schemas.MachineryResponse)
def get_machinery_details(machinery_id: int, db: Session = Depends(get_db)):
    machine = db.query(models.Machinery).filter(models.Machinery.id == machinery_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machinery item not found")
    return machine
