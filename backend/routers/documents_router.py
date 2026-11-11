from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["Document Checklist"])

STANDARD_DOCUMENTS = {
    "aadhaar": {
        "name": "Aadhaar Card",
        "description": "Proof of identity and residential address with linked mobile number.",
        "issuing_authority": "UIDAI / Post Office / Grama One",
        "how_to_get": "Download online at myaadhaar.uidai.gov.in or visit any nearest Grama One / Post Office."
    },
    "pahani_rtc": {
        "name": "Pahani / RTC (Land Record)",
        "description": "Karnataka Record of Rights, Tenancy and Crops showing survey number, owner name, and crop details.",
        "issuing_authority": "Karnataka Revenue Department / Bhoomi",
        "how_to_get": "Download certified RTC instantly from Karnataka Bhoomi Portal (landrecords.karnataka.gov.in) or Nadakacheri."
    },
    "bank_passbook": {
        "name": "Bank Passbook (Aadhaar & NPCI Linked)",
        "description": "Front page of active bank account passbook showing Name, Account Number and IFSC Code for Direct Benefit Transfer (DBT).",
        "issuing_authority": "Nationalized or Rural/Cooperative Bank",
        "how_to_get": "Visit your local bank branch to get an updated passbook and ensure Aadhaar NPCI seeding."
    },
    "fruits_id": {
        "name": "Karnataka FRUITS ID (FID)",
        "description": "Unique farmer identity number in Karnataka providing single-window access to all department benefits.",
        "issuing_authority": "Karnataka Agriculture Department",
        "how_to_get": "Visit your nearest Raitha Samparka Kendra (RSK) with your Aadhaar and RTC to generate or link your FID."
    },
    "caste_cert": {
        "name": "Caste & Income Certificate (RD Number)",
        "description": "Required to claim enhanced 80% to 90% subsidies for SC/ST and special farmer categories.",
        "issuing_authority": "Tahsildar / Nadakacheri",
        "how_to_get": "Apply online at nadakacheri.karnataka.gov.in or visit Nadakacheri / Grama One centre."
    },
    "water_cert": {
        "name": "Water Source / Irrigation Certificate",
        "description": "Certification of perennial water source (borewell, open well, or canal) needed for micro-irrigation and pump subsidies.",
        "issuing_authority": "Gram Panchayat / Minor Irrigation Dept",
        "how_to_get": "Obtain electricity bill / NOC from Gram Panchayat or water availability certificate from RSK."
    },
    "quotation": {
        "name": "Authorized Equipment Quotation",
        "description": "Proforma invoice / quotation from a certified empanelled manufacturer or dealer for the machinery.",
        "issuing_authority": "Registered Agricultural Machinery Dealer",
        "how_to_get": "Collect directly from any approved machinery dealer or RSK registered vendor list."
    },
    "soil_card": {
        "name": "Soil Health Card",
        "description": "Scientific soil nutrient status report to determine fertilizer and seed eligibility.",
        "issuing_authority": "Raitha Samparka Kendra / Krishi Vigyan Kendra",
        "how_to_get": "Submit a soil sample at the local Raitha Samparka Kendra for free lab analysis."
    },
    "photos": {
        "name": "Passport Size Photographs",
        "description": "Two recent color photographs for application verification.",
        "issuing_authority": "Local Studio",
        "how_to_get": "Any photo studio or Grama One center."
    }
}

@router.get("/checklist", response_model=List[schemas.DocumentItem])
def get_checklist(
    scheme_id: Optional[int] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user's saved progress
    user_docs = db.query(models.FarmerDocumentProgress).filter(
        models.FarmerDocumentProgress.user_id == current_user.id
    ).all()
    user_ready_map = {doc.document_key: (doc.is_ready, doc.notes) for doc in user_docs}

    # Determine which keys are required
    keys_to_include = list(STANDARD_DOCUMENTS.keys())
    if scheme_id:
        scheme = db.query(models.GovernmentScheme).filter(models.GovernmentScheme.id == scheme_id).first()
        if scheme and scheme.required_documents:
            # Parse scheme documents
            req_text = scheme.required_documents.lower()
            filtered_keys = []
            for k in STANDARD_DOCUMENTS.keys():
                if k in req_text or STANDARD_DOCUMENTS[k]["name"].lower() in req_text or "aadhaar" in k or "rtc" in k:
                    filtered_keys.append(k)
            if filtered_keys:
                keys_to_include = filtered_keys

    items = []
    for k in keys_to_include:
        doc_info = STANDARD_DOCUMENTS.get(k, {
            "name": k.replace("_", " ").title(),
            "description": "Official supporting document required for verification.",
            "issuing_authority": "Concerned Government Office",
            "how_to_get": "Contact your local Raitha Samparka Kendra."
        })
        is_ready, notes = user_ready_map.get(k, (False, None))
        items.append({
            "key": k,
            "name": doc_info["name"],
            "description": doc_info["description"],
            "issuing_authority": doc_info["issuing_authority"],
            "how_to_get": doc_info["how_to_get"],
            "is_ready": is_ready,
            "notes": notes
        })

    return items

@router.post("/status")
def update_document_status(
    status_update: schemas.DocumentStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(models.FarmerDocumentProgress).filter(
        models.FarmerDocumentProgress.user_id == current_user.id,
        models.FarmerDocumentProgress.document_key == status_update.document_key
    ).first()

    if not doc:
        doc = models.FarmerDocumentProgress(
            user_id=current_user.id,
            scheme_id=status_update.scheme_id,
            document_key=status_update.document_key,
            document_name=status_update.document_name,
            is_ready=status_update.is_ready,
            notes=status_update.notes
        )
        db.add(doc)
    else:
        doc.is_ready = status_update.is_ready
        if status_update.notes is not None:
            doc.notes = status_update.notes
        if status_update.scheme_id:
            doc.scheme_id = status_update.scheme_id

    db.commit()
    return {"status": "success", "document_key": status_update.document_key, "is_ready": status_update.is_ready}
