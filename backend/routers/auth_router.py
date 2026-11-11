from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.TokenResponse)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        (models.User.email == user_data.email) | (models.User.phone == user_data.phone)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email or mobile number already exists."
        )

    # Create User
    new_user = models.User(
        email=user_data.email.lower().strip(),
        phone=user_data.phone.strip(),
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name.strip(),
        role=user_data.role,
        preferred_language=user_data.preferred_language,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Create associated profile based on role
    if user_data.role == "farmer":
        farmer_prof = models.FarmerProfile(
            user_id=new_user.id,
            district=user_data.district or "Mandya",
            taluk=user_data.taluk or "Mandya",
            village=user_data.village or "Guthalu",
            land_acres=user_data.land_acres if user_data.land_acres is not None else 2.5,
            land_ownership=user_data.land_ownership or "owned",
            crops=user_data.crops or "Paddy, Sugarcane",
            crop_season=user_data.crop_season or "kharif",
            irrigation_type=user_data.irrigation_type or "canal",
            farmer_category=user_data.farmer_category or "small_marginal",
            fruits_id=user_data.fruits_id,
            has_kcc=False
        )
        db.add(farmer_prof)
    elif user_data.role == "provider":
        provider_prof = models.MachineryProvider(
            user_id=new_user.id,
            business_name=user_data.business_name or f"{user_data.full_name}'s Agri Machinery",
            contact_name=user_data.full_name,
            phone=user_data.phone,
            district=user_data.district or "Mandya",
            taluk=user_data.taluk or "Mandya",
            village=user_data.village or "Guthalu",
            is_verified=True,
            rating=5.0
        )
        db.add(provider_prof)

    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.id, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    email_or_phone = login_data.email.strip().lower()
    user = db.query(models.User).filter(
        (models.User.email == email_or_phone) | (models.User.phone == email_or_phone)
    ).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number/email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact support."
        )

    token = create_access_token(data={"sub": user.id, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    user_update: schemas.UserProfileUpdate,
    farmer_update: schemas.FarmerProfileUpdate = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.phone:
        current_user.phone = user_update.phone
    if user_update.preferred_language:
        current_user.preferred_language = user_update.preferred_language

    if farmer_update and current_user.role == "farmer":
        prof = current_user.farmer_profile
        if not prof:
            prof = models.FarmerProfile(user_id=current_user.id)
            db.add(prof)

        if farmer_update.district is not None: prof.district = farmer_update.district
        if farmer_update.taluk is not None: prof.taluk = farmer_update.taluk
        if farmer_update.village is not None: prof.village = farmer_update.village
        if farmer_update.land_acres is not None: prof.land_acres = farmer_update.land_acres
        if farmer_update.land_ownership is not None: prof.land_ownership = farmer_update.land_ownership
        if farmer_update.crops is not None: prof.crops = farmer_update.crops
        if farmer_update.crop_season is not None: prof.crop_season = farmer_update.crop_season
        if farmer_update.irrigation_type is not None: prof.irrigation_type = farmer_update.irrigation_type
        if farmer_update.farmer_category is not None: prof.farmer_category = farmer_update.farmer_category
        if farmer_update.fruits_id is not None: prof.fruits_id = farmer_update.fruits_id
        if farmer_update.annual_income is not None: prof.annual_income = farmer_update.annual_income
        if farmer_update.has_kcc is not None: prof.has_kcc = farmer_update.has_kcc

    db.commit()
    db.refresh(current_user)
    return current_user
