from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(20), default="farmer", nullable=False)  # farmer, provider, admin
    preferred_language = Column(String(10), default="en", nullable=False)  # en, kn, hi, te, ta
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    machinery_provider = relationship("MachineryProvider", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookings = relationship("MachineryBooking", back_populates="farmer", foreign_keys="MachineryBooking.farmer_id")
    applications = relationship("ApplicationRecord", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("FarmerDocumentProgress", back_populates="user", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    district = Column(String(80), nullable=False, default="Mandya")
    taluk = Column(String(80), nullable=False, default="Mandya")
    village = Column(String(100), nullable=False, default="Guthalu")
    land_acres = Column(Float, default=2.5, nullable=False)
    land_ownership = Column(String(20), default="owned")  # owned, leased, both
    crops = Column(Text, default="Paddy, Sugarcane")  # comma-separated crops
    crop_season = Column(String(30), default="kharif")  # kharif, rabi, summer, all_season
    irrigation_type = Column(String(30), default="canal")  # drip, sprinkler, borewell, canal, rainfed
    farmer_category = Column(String(30), default="small_marginal")  # small_marginal, medium, large, sc_st, woman
    fruits_id = Column(String(50), nullable=True)  # Karnataka FRUITS ID
    has_kcc = Column(Boolean, default=False)
    annual_income = Column(Float, default=120000.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="farmer_profile")

class MachineryProvider(Base):
    __tablename__ = "machinery_providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(150), nullable=False)
    contact_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    alt_phone = Column(String(20), nullable=True)
    district = Column(String(80), nullable=False)
    taluk = Column(String(80), nullable=False)
    village = Column(String(100), nullable=False)
    full_address = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="machinery_provider")
    machinery = relationship("Machinery", back_populates="provider", cascade="all, delete-orphan")

class Machinery(Base):
    __tablename__ = "machinery"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("machinery_providers.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(120), nullable=False)
    model_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # tractor, harvester, rotavator, seed_drill, cultivator, sprayer, thresher, pump, plough
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    price_per_hour = Column(Float, nullable=False, default=800.0)
    price_per_acre = Column(Float, nullable=True, default=1200.0)
    price_per_day = Column(Float, nullable=True, default=6000.0)
    has_operator = Column(Boolean, default=True)
    operator_rate_per_hour = Column(Float, default=150.0)
    transport_rate_per_km = Column(Float, default=25.0)
    equipment_condition = Column(String(30), default="excellent")  # excellent, good, fair
    horsepower = Column(Integer, default=50)
    district = Column(String(80), nullable=False)
    taluk = Column(String(80), nullable=False)
    village = Column(String(100), nullable=False)
    latitude = Column(Float, default=12.5218)
    longitude = Column(Float, default=76.8951)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    provider = relationship("MachineryProvider", back_populates="machinery")
    bookings = relationship("MachineryBooking", back_populates="machinery", cascade="all, delete-orphan")

class MachineryBooking(Base):
    __tablename__ = "machinery_bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(30), unique=True, index=True, nullable=False)
    machinery_id = Column(Integer, ForeignKey("machinery.id", ondelete="CASCADE"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    time_slot = Column(String(30), nullable=False)  # morning_8_12, afternoon_12_4, evening_4_8, full_day
    duration_hours = Column(Float, default=4.0)
    acreage = Column(Float, default=1.0)
    rental_cost = Column(Float, default=0.0)
    operator_cost = Column(Float, default=0.0)
    transport_cost = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    status = Column(String(30), default="requested", nullable=False)  # requested, confirmed, rejected, cancelled, in_progress, completed
    farmer_village = Column(String(100), nullable=False)
    delivery_required = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    provider_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    machinery = relationship("Machinery", back_populates="bookings")
    farmer = relationship("User", back_populates="bookings", foreign_keys=[farmer_id])

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String(50), unique=True, index=True, nullable=False)
    scheme_name = Column(String(200), nullable=False)
    kannada_name = Column(String(255), nullable=True)
    hindi_name = Column(String(255), nullable=True)
    department = Column(String(150), nullable=False)
    scheme_type = Column(String(40), default="state_karnataka")  # central, state_karnataka
    category = Column(String(50), nullable=False)  # crop_cultivation, irrigation, machinery, seeds, fertilizers, horticulture, dairy, organic_farming, infrastructure, insurance
    description = Column(Text, nullable=False)
    benefits_summary = Column(Text, nullable=False)
    financial_assistance = Column(String(255), nullable=False)
    subsidy_percentage = Column(Float, default=50.0)
    min_land_acres = Column(Float, default=0.0)
    max_land_acres = Column(Float, default=25.0)
    eligible_categories = Column(String(255), default="all")  # all, small_marginal, sc_st, woman, medium
    eligible_crops = Column(String(255), default="all")  # all, or comma list
    eligible_irrigation = Column(String(255), default="all")  # all, or comma list
    required_documents = Column(Text, nullable=False)  # Comma or JSON array of documents
    official_url = Column(String(255), nullable=False)
    helpline_number = Column(String(80), nullable=True)
    application_instructions = Column(Text, nullable=False)
    opening_date = Column(String(30), default="Open Throughout Year")
    closing_date = Column(String(30), default="Ongoing (Batch-wise)")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class LoanProduct(Base):
    __tablename__ = "loan_products"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String(150), nullable=False)
    loan_name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)  # kcc, crop_loan, machinery_loan, irrigation_loan, dairy_loan, gold_loan
    description = Column(Text, nullable=False)
    min_amount = Column(Float, default=10000.0)
    max_amount = Column(Float, default=300000.0)
    base_interest_rate = Column(Float, default=7.0)  # nominal bank interest
    subsidized_interest_rate = Column(Float, default=4.0)  # after prompt repayment subvention
    interest_subsidy_note = Column(Text, nullable=False)
    max_tenure_months = Column(Integer, default=12)
    collateral_required = Column(Boolean, default=False)
    collateral_details = Column(String(255), default="Hypothecation of crops / machinery up to ₹1.60 Lakhs, no land mortgage required")
    eligibility_criteria = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=False)
    application_url = Column(String(255), nullable=False)
    contact_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApplicationRecord(Base):
    __tablename__ = "application_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("government_schemes.id", ondelete="SET NULL"), nullable=True)
    loan_id = Column(Integer, ForeignKey("loan_products.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    department = Column(String(150), nullable=False)
    reference_number = Column(String(100), nullable=False)
    submission_date = Column(String(30), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    current_status = Column(String(40), default="submitted", nullable=False)
    # preparation, submitted, under_verification, pending, approved, rejected, benefit_received
    status_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=True)
    is_official_api = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    scheme = relationship("GovernmentScheme")
    loan = relationship("LoanProduct")

class FarmerDocumentProgress(Base):
    __tablename__ = "farmer_documents_checklist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(Integer, ForeignKey("government_schemes.id", ondelete="CASCADE"), nullable=True)
    document_key = Column(String(80), nullable=False)  # aadhaar, pahani_rtc, bank_passbook, caste_cert, fruits_id, etc.
    document_name = Column(String(150), nullable=False)
    is_ready = Column(Boolean, default=False)
    source_portal = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="documents")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(60), default="machinery_booking")  # machinery_booking, subsidy_application, loan_issue, technical
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="open")  # open, in_progress, resolved
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="complaints")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(40), default="info")  # info, booking, application, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
