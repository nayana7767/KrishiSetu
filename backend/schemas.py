from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: str
    phone: str
    password: str = Field(min_length=6)
    full_name: str
    role: str = "farmer"  # farmer, provider, admin
    preferred_language: str = "en"
    # Optional farmer profile details during initial registration
    district: Optional[str] = "Mandya"
    taluk: Optional[str] = "Mandya"
    village: Optional[str] = "Guthalu"
    land_acres: Optional[float] = 2.5
    land_ownership: Optional[str] = "owned"
    crops: Optional[str] = "Paddy, Sugarcane"
    crop_season: Optional[str] = "kharif"
    irrigation_type: Optional[str] = "canal"
    farmer_category: Optional[str] = "small_marginal"
    fruits_id: Optional[str] = None
    # Optional provider details
    business_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None

class FarmerProfileUpdate(BaseModel):
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    land_acres: Optional[float] = None
    land_ownership: Optional[str] = None
    crops: Optional[str] = None
    crop_season: Optional[str] = None
    irrigation_type: Optional[str] = None
    farmer_category: Optional[str] = None
    fruits_id: Optional[str] = None
    annual_income: Optional[float] = None
    has_kcc: Optional[bool] = None

class FarmerProfileResponse(BaseModel):
    id: int
    user_id: int
    district: str
    taluk: str
    village: str
    land_acres: float
    land_ownership: str
    crops: str
    crop_season: str
    irrigation_type: str
    farmer_category: str
    fruits_id: Optional[str] = None
    has_kcc: bool
    annual_income: float

    class Config:
        from_attributes = True

class MachineryProviderResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    contact_name: str
    phone: str
    district: str
    taluk: str
    village: str
    is_verified: bool
    rating: float

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    phone: str
    full_name: str
    role: str
    preferred_language: str
    is_active: bool
    farmer_profile: Optional[FarmerProfileResponse] = None
    machinery_provider: Optional[MachineryProviderResponse] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Machinery & Booking Schemas ---
class MachineryCreate(BaseModel):
    name: str
    model_name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price_per_hour: float
    price_per_acre: Optional[float] = None
    price_per_day: Optional[float] = None
    has_operator: bool = True
    operator_rate_per_hour: float = 150.0
    transport_rate_per_km: float = 25.0
    equipment_condition: str = "excellent"
    horsepower: int = 50
    district: str
    taluk: str
    village: str
    latitude: Optional[float] = 12.5218
    longitude: Optional[float] = 76.8951

class MachineryResponse(BaseModel):
    id: int
    provider_id: int
    name: str
    model_name: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price_per_hour: float
    price_per_acre: Optional[float] = None
    price_per_day: Optional[float] = None
    has_operator: bool
    operator_rate_per_hour: float
    transport_rate_per_km: float
    equipment_condition: str
    horsepower: int
    district: str
    taluk: str
    village: str
    latitude: float
    longitude: float
    is_active: bool
    provider: Optional[MachineryProviderResponse] = None

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    machinery_id: int
    booking_date: str  # YYYY-MM-DD
    time_slot: str     # morning_8_12, afternoon_12_4, evening_4_8, full_day
    duration_hours: float = 4.0
    acreage: float = 1.0
    with_operator: bool = True
    distance_km: float = 5.0
    farmer_village: str
    notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str
    provider_notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    booking_code: str
    machinery_id: int
    farmer_id: int
    booking_date: str
    time_slot: str
    duration_hours: float
    acreage: float
    rental_cost: float
    operator_cost: float
    transport_cost: float
    total_amount: float
    status: str
    farmer_village: str
    delivery_required: bool
    notes: Optional[str] = None
    provider_notes: Optional[str] = None
    created_at: datetime
    machinery: Optional[MachineryResponse] = None
    farmer: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- Government Scheme & Recommendation Schemas ---
class SchemeResponse(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    kannada_name: Optional[str] = None
    hindi_name: Optional[str] = None
    department: str
    scheme_type: str
    category: str
    description: str
    benefits_summary: str
    financial_assistance: str
    subsidy_percentage: float
    min_land_acres: float
    max_land_acres: float
    eligible_categories: str
    eligible_crops: str
    eligible_irrigation: str
    required_documents: str
    official_url: str
    helpline_number: Optional[str] = None
    application_instructions: str
    opening_date: str
    closing_date: str
    is_active: bool

    class Config:
        from_attributes = True

class SchemeRecommendation(BaseModel):
    scheme: SchemeResponse
    eligibility_status: str  # eligible, more_info_needed, not_eligible
    match_score: int         # 0 - 100
    reasons: List[str]       # Transparent explanation of why it fits
    missing_criteria: List[str]

# --- Loan Schemas ---
class LoanResponse(BaseModel):
    id: int
    bank_name: str
    loan_name: str
    category: str
    description: str
    min_amount: float
    max_amount: float
    base_interest_rate: float
    subsidized_interest_rate: float
    interest_subsidy_note: str
    max_tenure_months: int
    collateral_required: bool
    collateral_details: str
    eligibility_criteria: str
    required_documents: str
    application_url: str
    contact_number: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class LoanCompareRequest(BaseModel):
    needed_amount: float
    purpose: str  # crop, equipment, irrigation, livestock, general
    tenure_months: int = 12

class LoanCompareResult(BaseModel):
    loan: LoanResponse
    estimated_monthly_emi: float
    annual_interest_base: float
    annual_interest_subsidized: float
    government_interest_saving: float
    is_collateral_free: bool
    match_fit: str

# --- Document Checklist Schemas ---
class DocumentItem(BaseModel):
    key: str
    name: str
    description: str
    issuing_authority: str
    how_to_get: str
    is_ready: bool = False
    notes: Optional[str] = None

class DocumentStatusUpdate(BaseModel):
    document_key: str
    document_name: str
    is_ready: bool
    scheme_id: Optional[int] = None
    notes: Optional[str] = None

# --- Application Tracker Schemas ---
class ApplicationCreate(BaseModel):
    title: str
    department: str
    reference_number: str
    scheme_id: Optional[int] = None
    loan_id: Optional[int] = None
    submission_date: Optional[str] = None
    current_status: str = "submitted"
    status_notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    current_status: str
    status_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    corrective_action: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    scheme_id: Optional[int] = None
    loan_id: Optional[int] = None
    title: str
    department: str
    reference_number: str
    submission_date: str
    current_status: str
    status_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    corrective_action: Optional[str] = None
    is_official_api: bool
    created_at: datetime
    updated_at: datetime
    scheme: Optional[SchemeResponse] = None

    class Config:
        from_attributes = True

# --- Complaints & Help ---
class ComplaintCreate(BaseModel):
    category: str
    subject: str
    description: str

class ComplaintResponse(BaseModel):
    id: int
    user_id: int
    category: str
    subject: str
    description: str
    status: str
    admin_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
