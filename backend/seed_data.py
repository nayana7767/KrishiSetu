import logging
from sqlalchemy.orm import Session
import models
from auth import hash_password

logger = logging.getLogger("krishisetu.seed")

def seed_database(db: Session):
    # Check if data already seeded
    if db.query(models.User).filter(models.User.email == "farmer@krishisetu.in").first():
        logger.info("Database already seeded with demo records.")
        return

    logger.info("Seeding realistic Karnataka agricultural demo data...")

    # 1. Create Users
    # Farmer 1 (Small & Marginal, Mandya)
    farmer1 = models.User(
        email="farmer@krishisetu.in",
        phone="9845012345",
        password_hash=hash_password("farmer123"),
        full_name="Basavaraj Patil",
        role="farmer",
        preferred_language="kn",
        is_active=True
    )
    db.add(farmer1)
    db.flush()

    farmer1_profile = models.FarmerProfile(
        user_id=farmer1.id,
        district="Mandya",
        taluk="Mandya",
        village="Guthalu",
        land_acres=2.5,
        land_ownership="owned",
        crops="Paddy, Sugarcane",
        crop_season="kharif",
        irrigation_type="canal",
        farmer_category="small_marginal",
        fruits_id="KA-MAN-2024-98451",
        has_kcc=False,
        annual_income=110000.0
    )
    db.add(farmer1_profile)

    # Farmer 2 (Woman Farmer, Mysuru)
    farmer2 = models.User(
        email="lakshmi@krishisetu.in",
        phone="9845067890",
        password_hash=hash_password("farmer123"),
        full_name="Lakshmi Devi",
        role="farmer",
        preferred_language="en",
        is_active=True
    )
    db.add(farmer2)
    db.flush()

    farmer2_profile = models.FarmerProfile(
        user_id=farmer2.id,
        district="Mysuru",
        taluk="Nanjangud",
        village="Hullahalli",
        land_acres=1.8,
        land_ownership="owned",
        crops="Ragi, Vegetables",
        crop_season="kharif",
        irrigation_type="drip",
        farmer_category="woman",
        fruits_id="KA-MYS-2024-33219",
        has_kcc=True,
        annual_income=95000.0
    )
    db.add(farmer2_profile)

    # Machinery Provider 1 (Mandya)
    provider1_user = models.User(
        email="provider@krishisetu.in",
        phone="9448011223",
        password_hash=hash_password("provider123"),
        full_name="Siddalingappa K",
        role="provider",
        preferred_language="kn",
        is_active=True
    )
    db.add(provider1_user)
    db.flush()

    provider1 = models.MachineryProvider(
        user_id=provider1_user.id,
        business_name="Siddalingappa Agri Services & Rentals",
        contact_name="Siddalingappa K",
        phone="9448011223",
        alt_phone="08232-221144",
        district="Mandya",
        taluk="Maddur",
        village="Kestur",
        full_address="Main Road, Near Kestur Gram Panchayat, Maddur Taluk, Mandya - 571428",
        is_verified=True,
        rating=4.9
    )
    db.add(provider1)
    db.flush()

    # Machinery Provider 2 (Mysuru)
    provider2_user = models.User(
        email="mysuru_provider@krishisetu.in",
        phone="9448099887",
        password_hash=hash_password("provider123"),
        full_name="Ramesh Gowda",
        role="provider",
        preferred_language="en",
        is_active=True
    )
    db.add(provider2_user)
    db.flush()

    provider2 = models.MachineryProvider(
        user_id=provider2_user.id,
        business_name="Cauvery Kisan Machinery Center",
        contact_name="Ramesh Gowda",
        phone="9448099887",
        alt_phone="0821-248811",
        district="Mysuru",
        taluk="T. Narasipura",
        village="Bannur",
        full_address="Opp. Raitha Seva Sahakari Bank, Bannur Road, Mysuru - 571101",
        is_verified=True,
        rating=4.8
    )
    db.add(provider2)
    db.flush()

    # Admin
    admin_user = models.User(
        email="admin@krishisetu.in",
        phone="9000000001",
        password_hash=hash_password("admin123"),
        full_name="KrishiSetu Admin",
        role="admin",
        preferred_language="en",
        is_active=True
    )
    db.add(admin_user)
    db.flush()

    # 2. Government Schemes (Verified Karnataka & Central Details)
    schemes_data = [
        {
            "scheme_code": "KA-AGRI-001",
            "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            "kannada_name": "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ (ಪಿಎಂ-ಕಿಸಾನ್)",
            "hindi_name": "प्रधानमंत्री किसान सम्मान निधि",
            "department": "Department of Agriculture, Cooperation & Farmers Welfare",
            "scheme_type": "central",
            "category": "crop_cultivation",
            "description": "Central Sector scheme providing income support to all landholding farmer families in India having cultivable land.",
            "benefits_summary": "Direct cash support of ₹6,000 per year transferred directly to the farmer bank account in three equal instalments of ₹2,000 every four months.",
            "financial_assistance": "₹6,000 per year (100% Direct Benefit Transfer)",
            "subsidy_percentage": 100.0,
            "min_land_acres": 0.05,
            "max_land_acres": 25.0,
            "eligible_categories": "all, small_marginal, sc_st, woman, medium",
            "eligible_crops": "all",
            "eligible_irrigation": "all",
            "required_documents": "Aadhaar Card, Pahani / RTC, Aadhaar-linked Bank Passbook, Mobile Number",
            "official_url": "https://pmkisan.gov.in",
            "helpline_number": "155261 / 011-24300606",
            "application_instructions": "Register on the PM-KISAN portal using your Aadhaar and mobile number, verify land record RTC online, or visit the nearest Raitha Samparka Kendra / CSC Grama One.",
            "opening_date": "Open Throughout Year",
            "closing_date": "Ongoing Scheme"
        },
        {
            "scheme_code": "KA-AGRI-002",
            "scheme_name": "Raitha Siri Scheme (Karnataka Millet Incentive)",
            "kannada_name": "ರೈತ ಸಿರಿ ಸಿರಿಧಾನ್ಯ ಪ್ರೋತ್ಸಾಹಧನ ಯೋಜನೆ",
            "hindi_name": "रायथा सिरी श्रीअन्न प्रोत्साहन योजना",
            "department": "Department of Agriculture, Government of Karnataka",
            "scheme_type": "state_karnataka",
            "category": "crop_cultivation",
            "description": "Karnataka state flagship initiative to encourage climate-resilient millet farming by providing direct financial incentives to cultivators of recognized millets.",
            "benefits_summary": "Incentive of ₹10,000 per hectare (up to a maximum of 2 hectares per farmer, i.e. up to ₹20,000) directly into bank account via DBT upon crop verification.",
            "financial_assistance": "₹10,000 per hectare (Max ₹20,000)",
            "subsidy_percentage": 100.0,
            "min_land_acres": 0.5,
            "max_land_acres": 15.0,
            "eligible_categories": "all, small_marginal, sc_st, woman",
            "eligible_crops": "Ragi, Jowar, Bajra, Foxtail Millet, Little Millet, Kodo Millet, Barnyard Millet",
            "eligible_irrigation": "rainfed, canal, borewell, drip",
            "required_documents": "Pahani / RTC showing millet crop entry, Aadhaar Card, Karnataka FRUITS ID, Bank Passbook",
            "official_url": "https://raitamitra.karnataka.gov.in",
            "helpline_number": "080-22212804 / Kisan Call Centre 1800-180-1551",
            "application_instructions": "Ensure your sown millet crop is recorded in the Karnataka Crop Survey (Bele Darshini) mobile app. Submit application along with FRUITS ID at your local Raitha Samparka Kendra.",
            "opening_date": "Kharif & Rabi Sowing Season",
            "closing_date": "31st December Annually"
        },
        {
            "scheme_code": "KA-AGRI-003",
            "scheme_name": "Krishi Bhagya Scheme (Farm Pond & Water Harvesting)",
            "kannada_name": "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ (ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಮಳೆನೀರು ಕೊಯ್ಲು)",
            "hindi_name": "कृषि भाग्य योजना (खेत तालाब एवं जल संचयन)",
            "department": "Department of Agriculture, Government of Karnataka",
            "scheme_type": "state_karnataka",
            "category": "irrigation",
            "description": "Comprehensive rainwater harvesting package for dryland and rainfed farmers in Karnataka, featuring Krishi Honda (farm pond) construction, polythene sheet lining, diesel/solar pump sets and protective shade cover.",
            "benefits_summary": "Up to 90% subsidy for SC/ST farmers and up to 80% subsidy for general category small and marginal farmers on farm pond excavation and polythene tarpaulin lining.",
            "financial_assistance": "Up to ₹1,25,000 subsidy per farm pond package",
            "subsidy_percentage": 85.0,
            "min_land_acres": 1.0,
            "max_land_acres": 10.0,
            "eligible_categories": "small_marginal, sc_st, woman, all",
            "eligible_crops": "all",
            "eligible_irrigation": "rainfed, borewell",
            "required_documents": "Pahani / RTC, Caste Certificate (RD Number for SC/ST), Aadhaar, FRUITS ID, Bank Passbook, Farm site GPS photo",
            "official_url": "https://raitamitra.karnataka.gov.in/krishibhagya",
            "helpline_number": "080-22212804",
            "application_instructions": "Apply through the Karnataka Agriculture Department portal or contact the Assistant Director of Agriculture (ADA) office in your taluk. Field inspection will be conducted before pond digging.",
            "opening_date": "June Annually (Pre-Monsoon)",
            "closing_date": "November Annually"
        },
        {
            "scheme_code": "KA-AGRI-004",
            "scheme_name": "PM Krishi Sinchayee Yojana (PMKSY - Micro Irrigation)",
            "kannada_name": "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕೃಷಿ ಸಿಂಚಾಯಿ ಯೋಜನೆ - ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ",
            "hindi_name": "प्रधानमंत्री कृषि सिंचाई योजना - प्रति बूंद अधिक फसल",
            "department": "Karnataka State Horticulture & Agriculture Department",
            "scheme_type": "central",
            "category": "irrigation",
            "description": "Per Drop More Crop component providing heavy capital subsidies for installing drip irrigation and sprinkler systems to conserve water and boost crop yields.",
            "benefits_summary": "Karnataka state provides 90% subsidy for small and marginal farmers (up to 5 acres) and 45% to 55% subsidy for other farmers for drip/sprinkler installations.",
            "financial_assistance": "90% subsidy for small & marginal farmers; up to ₹50,000/acre",
            "subsidy_percentage": 90.0,
            "min_land_acres": 0.5,
            "max_land_acres": 12.5,
            "eligible_categories": "small_marginal, sc_st, woman, all",
            "eligible_crops": "Sugarcane, Banana, Arecanut, Vegetables, Cotton, Maize, Horticulture",
            "eligible_irrigation": "borewell, canal, open_well, drip, sprinkler",
            "required_documents": "RTC / Pahani, Water Source & Electricity NOC/Bill, Aadhaar Card, FRUITS ID, Soil & Water Test Report, Dealer Quotation",
            "official_url": "https://horticulturedir.karnataka.gov.in",
            "helpline_number": "080-26571974 / 1800-425-3553",
            "application_instructions": "Register on the Karnataka Micro-Irrigation portal, select an authorized empanelled drip supplier, upload land and water documents. Joint inspection is done post-installation for subsidy release.",
            "opening_date": "Open Round the Year",
            "closing_date": "Subject to annual taluk target quotas"
        },
        {
            "scheme_code": "KA-AGRI-005",
            "scheme_name": "Sub-Mission on Agricultural Mechanization (SMAM)",
            "kannada_name": "ಕೃಷಿ ಯಾಂತ್ರೀಕರಣ ಉಪ-ಅಭಿಯಾನ (ಕೃಷಿ ಉಪಕರಣ ಸಹಾಯಧನ)",
            "hindi_name": "कृषि यंत्रीकरण उप-मिशन",
            "department": "Department of Agriculture, Government of Karnataka",
            "scheme_type": "central",
            "category": "machinery",
            "description": "Assistance for farm mechanization including purchase of mini tractors, rotavators, power tillers, transplanters, cultivators and threshers.",
            "benefits_summary": "Subsidy of 50% of machine cost up to specified ceiling for SC/ST and women farmers; 40% for general small/marginal farmers.",
            "financial_assistance": "40% to 50% subsidy (up to ₹2,50,000 on tractors and ₹80,000 on power tillers)",
            "subsidy_percentage": 50.0,
            "min_land_acres": 1.0,
            "max_land_acres": 25.0,
            "eligible_categories": "small_marginal, sc_st, woman, all",
            "eligible_crops": "all",
            "eligible_irrigation": "all",
            "required_documents": "Pahani / RTC, Aadhaar Card, Caste Certificate (if SC/ST), FRUITS ID, Bank Passbook, Authorized Dealer Quotation",
            "official_url": "https://agrimachinery.nic.in",
            "helpline_number": "1800-180-1551",
            "application_instructions": "Submit an online application on the SMAM portal with desired equipment category and dealer quotation. Subsidies are disbursed directly to bank account after physical verification.",
            "opening_date": "Batch-wise quarterly notification",
            "closing_date": "Ongoing"
        },
        {
            "scheme_code": "KA-AGRI-006",
            "scheme_name": "PM Fasal Bima Yojana (PMFBY Crop Insurance)",
            "kannada_name": "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ (ಬೆಳೆ ವಿಮೆ)",
            "hindi_name": "प्रधानमंत्री फसल बीमा योजना",
            "department": "Karnataka Agriculture Department & Insurance Companies",
            "scheme_type": "central",
            "category": "insurance",
            "description": "Comprehensive insurance coverage against crop loss caused by natural calamities, pests, drought, and unseasonal rainfall.",
            "benefits_summary": "Extremely low farmer premium: only 2% of sum insured for Kharif crops, 1.5% for Rabi food and oilseed crops, and 5% for commercial/horticultural crops. Balance premium paid jointly by Central and State Governments.",
            "financial_assistance": "Full sum insured claim up to ₹35,000 - ₹50,000 per acre upon verified crop loss",
            "subsidy_percentage": 90.0,
            "min_land_acres": 0.1,
            "max_land_acres": 50.0,
            "eligible_categories": "all, small_marginal, sc_st, woman, medium, large",
            "eligible_crops": "Paddy, Sugarcane, Ragi, Maize, Cotton, Groundnut, Red Gram, Bengal Gram",
            "eligible_irrigation": "all",
            "required_documents": "Pahani / RTC, Sowing Certificate (or Bele Darshini entry), Aadhaar Card, Bank Passbook with IFSC",
            "official_url": "https://samrakshane.karnataka.gov.in",
            "helpline_number": "1800-180-1551 / Samrakshane Portal Support",
            "application_instructions": "Enroll on the Karnataka Samrakshane portal, CSC Grama One centre, or through your local bank branch before the notified cut-off date for the season.",
            "opening_date": "At start of each sowing season (Kharif / Rabi)",
            "closing_date": "31st July (Kharif) / 30th November (Rabi)"
        },
        {
            "scheme_code": "KA-AGRI-007",
            "scheme_name": "National Livestock Mission (NLM) - Dairy & Cattle Shed",
            "kannada_name": "ರಾಷ್ಟ್ರೀಯ ಜಾನುವಾರು ಅಭಿಯಾನ - ಹೈನುಗಾರಿಕೆ ಮತ್ತು ಕೊಟ್ಟಿಗೆ ಸಹಾಯಧನ",
            "hindi_name": "राष्ट्रीय पशुधन मिशन - डेयरी एवं पशु शेड",
            "department": "Department of Animal Husbandry and Veterinary Services, Karnataka",
            "scheme_type": "central",
            "category": "dairy",
            "description": "Capital subsidy support to farmers for establishing small dairy units (2 to 10 milch cows/buffaloes) and constructing cattle sheds.",
            "benefits_summary": "25% to 33.33% back-ended capital subsidy on unit cost through NABARD/Bank linkage.",
            "financial_assistance": "25% to 33.33% subsidy (Up to ₹1,50,000 for 10-cow unit)",
            "subsidy_percentage": 33.33,
            "min_land_acres": 0.5,
            "max_land_acres": 25.0,
            "eligible_categories": "all, small_marginal, sc_st, woman",
            "eligible_crops": "all",
            "eligible_irrigation": "all",
            "required_documents": "Aadhaar Card, Land RTC / House Tax Extract, Bank Passbook, Milk Dairy Society Membership card, Veterinary Doctor Health Certificate",
            "official_url": "https://ahvs.karnataka.gov.in",
            "helpline_number": "080-22864984 / 1800-425-0012",
            "application_instructions": "Submit proposal via local Veterinary Dispensary or Assistant Director of Animal Husbandry in your taluk.",
            "opening_date": "Open Throughout Year",
            "closing_date": "Subject to district animal husbandry allocation"
        },
        {
            "scheme_code": "KA-AGRI-008",
            "scheme_name": "PM KUSUM Solar Agriculture Pump Scheme (Component B)",
            "kannada_name": "ಪಿಎಂ ಕುಸುಮ್ ಕೃಷಿ ಸೌರ ಪಂಪ್ ಯೋಜನೆ (ಕಾಂಪೊನೆಂಟ್ ಬಿ)",
            "hindi_name": "पीएम कुसुम सौर कृषि पंप योजना",
            "department": "Karnataka Renewable Energy Development Ltd (KREDL)",
            "scheme_type": "central",
            "category": "infrastructure",
            "description": "Installation of standalone solar photovoltaic water pumping systems (3 HP, 5 HP, 7.5 HP) for off-grid irrigation in rural agricultural lands.",
            "benefits_summary": "Total 80% subsidy (30% Central Ministry of New and Renewable Energy + 50% Karnataka State Govt). Farmer contributes only 20% of pump cost.",
            "financial_assistance": "80% total subsidy (up to ₹2,20,000 on 5 HP solar pump set)",
            "subsidy_percentage": 80.0,
            "min_land_acres": 1.0,
            "max_land_acres": 15.0,
            "eligible_categories": "all, small_marginal, sc_st, woman",
            "eligible_crops": "all",
            "eligible_irrigation": "borewell, open_well, rainfed",
            "required_documents": "RTC / Pahani, Ground Water / Geologist Certificate, Aadhaar Card, Electricity Non-Availability or Consent Letter, FRUITS ID",
            "official_url": "https://kredlinfo.in",
            "helpline_number": "080-22208109",
            "application_instructions": "Apply on the KREDL Karnataka portal with verified land survey number and borewell yield certificate.",
            "opening_date": "Annual allocation window",
            "closing_date": "31st January Annually"
        }
    ]

    for s_dict in schemes_data:
        db.add(models.GovernmentScheme(**s_dict))
    db.flush()

    # 3. Agricultural Loans Data
    loans_data = [
        {
            "bank_name": "Karnataka Gramin Bank / Canara Bank / State Bank of India",
            "loan_name": "Kisan Credit Card (KCC) Crop Production Loan",
            "category": "kcc",
            "description": "Revolving credit facility providing timely and adequate credit to farmers for seasonal crop cultivation and maintenance expenses with zero hassle.",
            "min_amount": 10000.0,
            "max_amount": 300000.0,
            "base_interest_rate": 7.0,
            "subsidized_interest_rate": 4.0,
            "interest_subsidy_note": "Nominal bank rate is 7%. Central Government provides 3% prompt repayment incentive, reducing interest to 4%. In Karnataka, loans up to ₹3 Lakhs through Primary Agricultural Credit Societies (PACS) carry 0% interest if repaid on time!",
            "max_tenure_months": 12,
            "collateral_required": False,
            "collateral_details": "No collateral required for loans up to ₹1.60 Lakhs (extended up to ₹2.00 Lakhs in select tied credit). Only hypothecation of cultivated crops.",
            "eligibility_criteria": "All farmers - individuals / joint borrowers, tenant farmers, sharecroppers with valid cultivation documents.",
            "required_documents": "Aadhaar Card, Pahani / RTC, Sowing Certificate from RSK, Two Passport Photos, Land Title Deed",
            "application_url": "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card",
            "contact_number": "1800-425-3800 / 1800-11-2211"
        },
        {
            "bank_name": "Canara Bank / Union Bank of India",
            "loan_name": "Agricultural Tractor & Farm Machinery Term Loan",
            "category": "machinery_loan",
            "description": "Medium-term credit for purchasing new tractors, power tillers, rotavators, combine harvesters, and implement accessories for agricultural operations.",
            "min_amount": 100000.0,
            "max_amount": 1500000.0,
            "base_interest_rate": 9.5,
            "subsidized_interest_rate": 8.5,
            "interest_subsidy_note": "Concessionary agri term loan rate with 1% interest subvention for timely repayment. Eligible for integration with SMAM government capital subsidy.",
            "max_tenure_months": 84,
            "collateral_required": True,
            "collateral_details": "Hypothecation of the purchased tractor/machinery plus equitable mortgage of agricultural land (minimum 3 acres for tractor loans).",
            "eligibility_criteria": "Cultivating farmers owning minimum 2 to 3 acres of perennial irrigated land or 6 acres of dry land.",
            "required_documents": "Pahani / RTC of past 3 years, Mutation Register (MR), Authorized Dealer Quotation, Aadhaar, PAN Card, Bank Statement",
            "application_url": "https://canarabank.com/agri-loans",
            "contact_number": "1800-425-0018"
        },
        {
            "bank_name": "NABARD / Karnataka State Apex Cooperative Bank",
            "loan_name": "Micro-Irrigation & Borewell Energization Term Loan",
            "category": "irrigation_loan",
            "description": "Long-term investment loan for sinking new borewells, installing submersible pump sets, electrical energization, and laying underground PVC delivery pipes.",
            "min_amount": 50000.0,
            "max_amount": 400000.0,
            "base_interest_rate": 8.75,
            "subsidized_interest_rate": 7.25,
            "interest_subsidy_note": "NABARD refinance support with concessionary priority sector interest rate. Up to 1.5% interest reduction upon linking with PMKSY micro-irrigation subsidy.",
            "max_tenure_months": 72,
            "collateral_required": False,
            "collateral_details": "Hypothecation of pump set and pipe equipment; charge created on land in Bhoomi portal.",
            "eligibility_criteria": "Small and marginal farmers holding registered agricultural land with certified groundwater clearance.",
            "required_documents": "Certified RTC, Geologist Borewell feasibility point report, Estimate from licensed pump dealer, Aadhaar Card",
            "application_url": "https://www.nabard.org",
            "contact_number": "080-22225211"
        },
        {
            "bank_name": "State Bank of India / HDFC Bank Agri",
            "loan_name": "Dairy Development & Cattle Purchase Loan",
            "category": "dairy_loan",
            "description": "Credit for purchasing high-yielding crossbred cows (HF/Jersey) or Murrah buffaloes, constructing sanitary cattle sheds, and chaff cutter machines.",
            "min_amount": 60000.0,
            "max_amount": 500000.0,
            "base_interest_rate": 9.0,
            "subsidized_interest_rate": 7.0,
            "interest_subsidy_note": "Eligible for 2% interest subvention under Animal Husbandry Infrastructure Development Fund (AHIDF) for prompt repayment.",
            "max_tenure_months": 60,
            "collateral_required": False,
            "collateral_details": "Hypothecation of cattle (animals tagged and insured) up to ₹1.60 Lakhs loan limit.",
            "eligibility_criteria": "Farmers with green fodder cultivation capacity and tie-up with local Karnataka Milk Federation (KMF) / Nandini dairy cooperative.",
            "required_documents": "KMF Dairy Passbook, Animal Health Certificate, Land RTC, Aadhaar Card, Two Passport Photos",
            "application_url": "https://sbi.co.in/web/agri-rural/dairy",
            "contact_number": "1800-11-2211"
        },
        {
            "bank_name": "Bank of Baroda / Canara Bank",
            "loan_name": "Agricultural Gold Loan (Krishi Swarna)",
            "category": "gold_loan",
            "description": "Immediate liquidity against gold ornaments for seasonal cultivation needs, fertilizer purchase, and emergency agricultural labor charges.",
            "min_amount": 25000.0,
            "max_amount": 1000000.0,
            "base_interest_rate": 8.5,
            "subsidized_interest_rate": 8.0,
            "interest_subsidy_note": "Concessionary interest rate for bona fide farmers (0.5% lower than non-agri personal gold loans). Zero processing fee for loans up to ₹3 Lakhs.",
            "max_tenure_months": 12,
            "collateral_required": True,
            "collateral_details": "Pledge of 22 karat gold jewelry / ornaments. Loan up to 75% of market value.",
            "eligibility_criteria": "Any individual farmer engaged in agriculture with proof of landholding or tenancy.",
            "required_documents": "Aadhaar Card, Land Record (Pahani / RTC), Gold Jewelry for appraiser testing",
            "application_url": "https://www.bankofbaroda.in/agriculture-gold-loan",
            "contact_number": "1800-258-4455"
        }
    ]

    for l_dict in loans_data:
        db.add(models.LoanProduct(**l_dict))
    db.flush()

    # 4. Agricultural Machinery Listings (Authentic Mandya & Mysuru Locations)
    machinery_data = [
        {
            "provider_id": provider1.id,
            "name": "Mahindra 575 DI 45HP Tractor (with Plough & Trailer)",
            "model_name": "Mahindra 575 DI Bhoomiputra 2023",
            "category": "tractor",
            "description": "Reliable 45 HP workhorse suited for dryland ploughing, wet puddling for paddy, harrowing, and trailer haulage. Maintained in prime condition with dual clutch and hydraulic draft control.",
            "image_url": "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 750.0,
            "price_per_acre": 1200.0,
            "price_per_day": 5500.0,
            "has_operator": True,
            "operator_rate_per_hour": 150.0,
            "transport_rate_per_km": 25.0,
            "equipment_condition": "excellent",
            "horsepower": 45,
            "district": "Mandya",
            "taluk": "Maddur",
            "village": "Kestur",
            "latitude": 12.6341,
            "longitude": 77.0425,
            "is_active": True
        },
        {
            "provider_id": provider1.id,
            "name": "Shaktiman 6-Feet Multi-Speed Rotary Tiller / Rotavator",
            "model_name": "Shaktiman SRT 6-Feet Heavy Duty",
            "category": "rotavator",
            "description": "High-efficiency rotavator with 48 boron steel L-blades. Breaks clods, pulverizes soil finely in a single pass, ideal for sugarcane and paddy seedbed preparation.",
            "image_url": "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 600.0,
            "price_per_acre": 950.0,
            "price_per_day": 4500.0,
            "has_operator": True,
            "operator_rate_per_hour": 150.0,
            "transport_rate_per_km": 20.0,
            "equipment_condition": "excellent",
            "horsepower": 50,
            "district": "Mandya",
            "taluk": "Mandya",
            "village": "Guthalu",
            "latitude": 12.5218,
            "longitude": 76.8951,
            "is_active": True
        },
        {
            "provider_id": provider1.id,
            "name": "Kubota DC-68G Paddy Combine Harvester",
            "model_name": "Kubota DC-68G Rubber Crawler 2024",
            "category": "harvester",
            "description": "Rubber-tracked combine harvester specifically designed for wet and marshy paddy fields. Cuts, threshes, cleans, and delivers clean grain with near-zero grain loss.",
            "image_url": "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 2400.0,
            "price_per_acre": 3200.0,
            "price_per_day": 18000.0,
            "has_operator": True,
            "operator_rate_per_hour": 250.0,
            "transport_rate_per_km": 40.0,
            "equipment_condition": "excellent",
            "horsepower": 68,
            "district": "Mandya",
            "taluk": "Srirangapatna",
            "village": "Arakere",
            "latitude": 12.4215,
            "longitude": 76.7028,
            "is_active": True
        },
        {
            "provider_id": provider2.id,
            "name": "John Deere 5050D 50HP Heavy Duty Tractor",
            "model_name": "John Deere 5050 D 4WD 2024",
            "category": "tractor",
            "description": "Powerful 50 HP 4-Wheel Drive tractor equipped with power steering, oil immersed disc brakes, and high torque engine. Superb for deep sub-soiling, heavy haulage, and laser levelling.",
            "image_url": "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 850.0,
            "price_per_acre": 1350.0,
            "price_per_day": 6200.0,
            "has_operator": True,
            "operator_rate_per_hour": 150.0,
            "transport_rate_per_km": 30.0,
            "equipment_condition": "excellent",
            "horsepower": 50,
            "district": "Mysuru",
            "taluk": "T. Narasipura",
            "village": "Bannur",
            "latitude": 12.3328,
            "longitude": 76.8624,
            "is_active": True
        },
        {
            "provider_id": provider2.id,
            "name": "Automatic Seed-Cum-Fertilizer Drill (9 Tines)",
            "model_name": "National Agro Seed Drill 9-Tine 2023",
            "category": "seed_drill",
            "description": "Precision sowing machine that deposits seeds and fertilizer simultaneously at proper depth and uniform spacing. Prevents seed wastage and ensures uniform germination for ragi, wheat, and pulses.",
            "image_url": "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 450.0,
            "price_per_acre": 750.0,
            "price_per_day": 3200.0,
            "has_operator": True,
            "operator_rate_per_hour": 100.0,
            "transport_rate_per_km": 20.0,
            "equipment_condition": "good",
            "horsepower": 35,
            "district": "Mysuru",
            "taluk": "Nanjangud",
            "village": "Hullahalli",
            "latitude": 12.1189,
            "longitude": 76.6853,
            "is_active": True
        },
        {
            "provider_id": provider2.id,
            "name": "ASPEE 4-Stroke High-Pressure Power Boom Sprayer (600L)",
            "model_name": "ASPEE Tractor Mounted HTP 600L",
            "category": "sprayer",
            "description": "Tractor-mounted 600-liter tank with 12-meter folding boom spray arms and adjustable brass nozzles. Covers large fields of sugarcane, cotton, and vegetables quickly.",
            "image_url": "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 400.0,
            "price_per_acre": 600.0,
            "price_per_day": 2800.0,
            "has_operator": True,
            "operator_rate_per_hour": 120.0,
            "transport_rate_per_km": 15.0,
            "equipment_condition": "excellent",
            "horsepower": 40,
            "district": "Mysuru",
            "taluk": "Mysuru",
            "village": "Varuna",
            "latitude": 12.2851,
            "longitude": 76.7214,
            "is_active": True
        },
        {
            "provider_id": provider1.id,
            "name": "Kirloskar Mobile Diesel Water Pump Set (7.5 HP)",
            "model_name": "Kirloskar Mega T Mobile 7.5HP",
            "category": "pump",
            "description": "Trolley-mounted high-discharge centrifugal diesel pump set for lifting irrigation water from rivers, canals, open wells, and farm ponds (Krishi Honda). Self-priming with 50-meter delivery pipe.",
            "image_url": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 250.0,
            "price_per_acre": 400.0,
            "price_per_day": 1600.0,
            "has_operator": False,
            "operator_rate_per_hour": 0.0,
            "transport_rate_per_km": 15.0,
            "equipment_condition": "excellent",
            "horsepower": 8,
            "district": "Mandya",
            "taluk": "Pandavapura",
            "village": "Melukote",
            "latitude": 12.6653,
            "longitude": 76.6548,
            "is_active": True
        },
        {
            "provider_id": provider2.id,
            "name": "Multi-Crop Grain Thresher (Paddy, Ragi & Maize)",
            "model_name": "Guru Nanak Multi-Crop Thresher 2023",
            "category": "thresher",
            "description": "Stationary high-output grain thresher equipped with dual blower fan and vibrating sieve screens for dust-free grain separation. Processes 15-20 quintals per hour.",
            "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=700",
            "price_per_hour": 600.0,
            "price_per_acre": 850.0,
            "price_per_day": 4200.0,
            "has_operator": True,
            "operator_rate_per_hour": 150.0,
            "transport_rate_per_km": 20.0,
            "equipment_condition": "good",
            "horsepower": 40,
            "district": "Mysuru",
            "taluk": "Hunsur",
            "village": "Bilikere",
            "latitude": 12.3524,
            "longitude": 76.4258,
            "is_active": True
        }
    ]

    created_machinery = []
    for m_dict in machinery_data:
        m = models.Machinery(**m_dict)
        db.add(m)
        created_machinery.append(m)
    db.flush()

    # 5. Pre-seed Sample Bookings for Farmer 1
    booking1 = models.MachineryBooking(
        booking_code="KS-2611-T091",
        machinery_id=created_machinery[0].id,  # Mahindra tractor
        farmer_id=farmer1.id,
        booking_date="2026-11-15",
        time_slot="morning_8_12",
        duration_hours=4.0,
        acreage=2.5,
        rental_cost=3000.0,
        operator_cost=600.0,
        transport_cost=150.0,
        total_amount=3750.0,
        status="confirmed",
        farmer_village="Guthalu, Mandya",
        delivery_required=True,
        notes="Ploughing required for upcoming paddy nursery.",
        provider_notes="Tractor confirmed. Driver will reach by 7:45 AM."
    )
    db.add(booking1)

    booking2 = models.MachineryBooking(
        booking_code="KS-2611-R442",
        machinery_id=created_machinery[1].id,  # Shaktiman Rotavator
        farmer_id=farmer1.id,
        booking_date="2026-11-18",
        time_slot="afternoon_12_4",
        duration_hours=3.0,
        acreage=2.0,
        rental_cost=1800.0,
        operator_cost=450.0,
        transport_cost=120.0,
        total_amount=2370.0,
        status="requested",
        farmer_village="Guthalu, Mandya",
        delivery_required=True,
        notes="Secondary soil tillage after deep ploughing."
    )
    db.add(booking2)

    # 6. Pre-seed Sample Tracked Applications for Farmer 1
    app1 = models.ApplicationRecord(
        user_id=farmer1.id,
        scheme_id=1,  # PM-KISAN
        title="PM-KISAN 17th Installment KYC Update",
        department="Department of Agriculture, Govt of India",
        reference_number="PMK-KA-2024-88491",
        submission_date="2026-10-12",
        current_status="approved",
        status_notes="Land seeding verified via Bhoomi portal. e-KYC verified via OTP.",
        is_official_api=False
    )
    db.add(app1)

    app2 = models.ApplicationRecord(
        user_id=farmer1.id,
        scheme_id=4,  # PMKSY Drip
        title="Drip Irrigation 90% Subsidy for Sugarcane",
        department="Karnataka Horticulture Department",
        reference_number="PMKSY-MND-99231",
        submission_date="2026-11-02",
        current_status="under_verification",
        status_notes="Document checklist verified at RSK. Joint farm inspection scheduled by Horticulture Officer.",
        is_official_api=False
    )
    db.add(app2)

    # 7. Pre-seed Document Checklist Readiness for Farmer 1
    db.add(models.FarmerDocumentProgress(user_id=farmer1.id, scheme_id=1, document_key="aadhaar", document_name="Aadhaar Card", is_ready=True, notes="Verified & active"))
    db.add(models.FarmerDocumentProgress(user_id=farmer1.id, scheme_id=1, document_key="pahani_rtc", document_name="Pahani / RTC (Land Record)", is_ready=True, notes="Survey No. 42/1, Guthalu village"))
    db.add(models.FarmerDocumentProgress(user_id=farmer1.id, scheme_id=1, document_key="bank_passbook", document_name="Bank Passbook (NPCI Linked)", is_ready=True, notes="Canara Bank Mandya Branch"))
    db.add(models.FarmerDocumentProgress(user_id=farmer1.id, scheme_id=1, document_key="fruits_id", document_name="Karnataka FRUITS ID", is_ready=True, notes="FID: KA-MAN-2024-98451"))
    db.add(models.FarmerDocumentProgress(user_id=farmer1.id, scheme_id=4, document_key="water_cert", document_name="Water Source Certificate", is_ready=False, notes="Pending NOC from Gram Panchayat"))

    db.commit()
    logger.info("Successfully seeded Karnataka demo data!")
