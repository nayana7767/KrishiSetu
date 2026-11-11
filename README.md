# KrishiSetu (ಕೃಷಿಸೇತು) – Full-Stack Agritech Web Application

> **"Your Farming Support, All in One Place"**  
> *"ನಿಮ್ಮ ಕೃಷಿ ಬೆಂಬಲ, ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ"*

**KrishiSetu** is an integrated, production-grade digital platform designed specifically for Indian farmers (with initial focus on Karnataka districts). It bridges the gap between rural cultivators and government benefits by combining a **personalized rule-based subsidy recommendation engine**, an **agricultural loan discovery and EMI comparison assistant**, a **step-by-step document readiness checklist**, an **application tracking system**, and a real-time **agricultural machinery marketplace with interactive OpenStreetMap/Leaflet maps and double-booking prevention**.

---

## 🌾 Core Capabilities & Modules

### 1. 5-Language Multilingual & Voice Guidance
- **Five Languages Supported**:
  - **English** (`en`)
  - **Kannada** (`kn` - ಕನ್ನಡ)
  - **Hindi** (`hi` - हिन्दी)
  - **Telugu** (`te` - తెలుగు)
  - **Tamil** (`ta` - தமிழ்)
- **High-Accessibility Design**: Large tactile action buttons, high contrast, minimal text clutter, large recognizable icons (tractor, government building, wallet, document, calendar).
- **Text-to-Speech (TTS) Engine**: Built-in browser Web Speech API synthesis that reads out scheme benefits, eligibility reasons, and instructions aloud in simplified vernacular speech.

### 2. Personalized Government Subsidy Recommendation Engine
- **Single-Entry Agricultural Profile**: Farmer enters land size (acres), ownership, crop types, crop season, irrigation setup, and Karnataka FRUITS ID once.
- **Rule-Based Matching Algorithm**:
  - Compares landholding limits (e.g. Small & Marginal $\le 5$ acres).
  - Evaluates crop eligibility (Paddy, Sugarcane, Millets/Ragi, Horticulture).
  - Evaluates irrigation availability (Drip, Sprinkler, Canal, Borewell, Rainfed).
  - Categorizes results into:
    1. **Potentially Eligible** (with transparent match score $\ge 90\%$ and detailed "Why You Match" explanations).
    2. **More Information Required**.
    3. **Not Eligible Based on Known Criteria**.
- **Verified Karnataka & Central Schemes**:
  - **PM-KISAN**: ₹6,000/yr direct income transfer.
  - **Raitha Siri Scheme (Karnataka)**: ₹10,000/hectare direct incentive for millet cultivation.
  - **Krishi Bhagya Scheme (Karnataka)**: Up to 90% subsidy on farm ponds (*Krishi Honda*), polythene lining, and diesel/solar pumps.
  - **PMKSY (Micro-Irrigation)**: 90% top-up subsidy for drip & sprinkler systems for small/marginal farmers in Karnataka.
  - **SMAM (Farm Mechanization)**: 40% to 50% subsidy for purchasing tractors, power tillers, rotavators, and transplanters.
  - **PM Fasal Bima Yojana (PMFBY)**: Crop insurance with only 1.5% to 2% farmer premium.
  - **National Livestock Mission (NLM)**: 25% to 33.33% subsidy for dairy cattle and cattle shed construction.
  - **PM KUSUM (Component B)**: Up to 80% combined Central & Karnataka subsidy on standalone solar agriculture water pumps.

### 3. Agricultural Loan Assistant & EMI Comparison Tool
- **Verified Credit Discovery**:
  - **Kisan Credit Card (KCC)** Crop Production Loan (effective 0% to 4% p.a. through prompt repayment interest subvention).
  - **Tractor & Machinery Term Loan** (Canara Bank / SBI).
  - **Micro-Irrigation & Borewell Term Loan** (NABARD tied).
  - **Dairy Livestock Loan**.
  - **Agricultural Gold Loan** (*Krishi Swarna*).
- **Dynamic Calculator**:
  - Input needed loan amount (₹20,000 to ₹10,00,000) and purpose.
  - Instantly computes monthly EMI, nominal bank rate vs subsidized rate, and **annual interest saved via government subsidies**.
  - Clearly identifies collateral-free limits (up to ₹1.60 Lakhs).

### 4. Document Checklist & Application Guidance
- **Karnataka Revenue & Identity Integration**:
  - **Pahani / RTC** (Bhoomi Portal).
  - **Aadhaar Card** (UIDAI).
  - **Bank Passbook** (Aadhaar & NPCI DBT Seeded).
  - **Karnataka FRUITS ID (FID)** (Raitha Samparka Kendra).
  - **Caste & Income Certificate** (Nadakacheri RD Number).
  - **Water Certificate** & **Dealer Quotation**.
- **Interactive Checklist**: Farmers mark each document as acquired/pending with a visual **Readiness Progress Bar** (e.g. 75% Ready) that persists to the database.

### 5. Application Tracker & Rejection Solutions
- Record and monitor application reference numbers, submission dates, departments, and status progression (*Preparation $\rightarrow$ Submitted $\rightarrow$ Under Verification $\rightarrow$ Approved $\rightarrow$ Benefit Received*).
- **Rejection Assistance Guide**: Actionable step-by-step solutions for common rejection causes:
  - *Name mismatch between Aadhaar and Pahani (RTC)*
  - *Bank account not seeded on NPCI DBT server*
  - *Pending land mutation / joint family khata*
  - *Expired caste/income RD certificate*
  - *Non-empanelled dealer quotation*

### 6. Agricultural Machinery Marketplace & Map View
- **Listings across Karnataka**: Tractors (Mahindra 575 DI, John Deere 5050D), Rubber Crawler Harvesters (Kubota DC-68G), Shaktiman Rotavators, Seed Drills, Boom Sprayers, Mobile Diesel Water Pumps, Multi-crop Threshers.
- **Dual View Modes**:
  - **Card/Grid View**: Detailed machinery specs, condition, horsepower, rates.
  - **Interactive OpenStreetMap / Leaflet Map**: Real GPS coordinates across Mandya, Mysuru, Maddur, Srirangapatna, and Nanjangud with custom tractor pins and one-click booking popups.
- **Transparent Pricing**: Rate per hour, per acre, per day, operator charge (₹150/hr), and transportation delivery (₹25/km).

### 7. Machinery Booking System with Concurrency Double-Booking Prevention
- Farmer selects date, time slot (*Morning 08:00-12:00, Afternoon 12:00-16:00, Evening 16:00-20:00, Full Day 08:00-18:00*), duration, and operator preference.
- **Concurrency & Overlap Validation**: The backend atomically checks existing active bookings for that equipment on that date. Conflicting or overlapping bookings are rejected with a clear `409 Conflict` message, completely preventing double bookings!
- Automatic booking code generation (e.g. `KS-2611-T091`) and printable receipt summary.

### 8. Machinery Provider & Administrator Dashboards
- **Provider Portal**: Register as equipment owner, publish machinery listings with photos/rates, view incoming booking requests, accept/reject bookings, mark field work in-progress/completed, and track gross rental earnings.
- **Admin Console**: Platform-wide KPIs, equipment distribution charts powered by **Recharts**, toggle scheme activations, and resolve user grievance tickets.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons |
| **Charts** | Recharts |
| **Maps** | OpenStreetMap, Leaflet |
| **Multilingual** | Custom Unicode-compatible i18n engine with Web Speech API Audio Synthesis |
| **Backend** | Python 3.12+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | MySQL 8.0+ / SQLite 3 (SQLAlchemy 2.0 ORM with PyMySQL driver) |
| **Security** | JWT Authentication (Bearer Tokens), Salted SHA-256 / Bcrypt, RBAC |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (3.10+) with `fastapi`, `uvicorn`, `sqlalchemy`, `pymysql`, `flask-cors`, `pyjwt`

### 1. Launching the Backend Server

```powershell
# From the root directory:
python backend/run_server.py
```
- The backend initializes the database automatically, creates all tables, and pre-seeds realistic Karnataka demo records.
- **API Base URL**: `http://127.0.0.1:8000`
- **Swagger Interactive API Documentation**: `http://127.0.0.1:8000/docs`

### 2. Launching the Frontend Application

```powershell
# In a new terminal window:
cd frontend
npm run dev
```
- Open your browser at: **`http://localhost:5173`**

*(Convenient Windows batch scripts `start_backend.bat` and `start_frontend.bat` are also provided in the root folder).*

---

## 🔑 Pre-Seeded Demo Login Credentials

The application includes pre-seeded demo accounts. You can either log in manually or click the **One-Click Demo Test buttons** on the landing page or login modal:

| Role | Email / Mobile Identifier | Password | Description / Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@krishisetu.in` *(or `9845012345`)* | `farmer123` | **Basavaraj Patil**: 2.5 Acres Paddy & Sugarcane, Mandya District, Canal irrigated, Karnataka FRUITS ID `KA-MAN-2024-98451`. |
| **Woman Farmer** | `lakshmi@krishisetu.in` *(or `9845067890`)* | `farmer123` | **Lakshmi Devi**: 1.8 Acres Ragi & Veg, Nanjangud (Mysuru), Drip irrigated. |
| **Machinery Provider** | `provider@krishisetu.in` *(or `9448011223`)* | `provider123` | **Siddalingappa Agro Services**: Owns Mahindra tractor, Shaktiman rotavator, and Kubota harvester in Maddur/Mandya. |
| **Administrator** | `admin@krishisetu.in` *(or `9000000001`)* | `admin123` | **State Admin**: Full access to KPI statistics, scheme toggles, and grievance resolution tickets. |

---

## 🗄️ Database Setup (MySQL Configuration)

By default, the application connects to a portable SQLite database (`krishisetu.db`) so it works instantly with zero setup.

To connect to your local **MySQL Server 8.0**:
1. Run the included schema script to create the database and tables:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database/schema.sql
   ```
2. Set the `DATABASE_URL` environment variable:
   ```powershell
   $env:DATABASE_URL="mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/krishisetu"
   ```
3. Run `python backend/run_server.py`. SQLAlchemy will automatically connect to MySQL and execute all transactions.

---

## 📋 Integrations & Official API Status

| Feature / Integration | Current Working Status | Official Production Integration Requirement |
| :--- | :--- | :--- |
| **Rule-Based Subsidy Finder** | **Live & Functional** | Department of Agriculture rules engine embedded locally. |
| **Loan Discovery & EMI Calc** | **Live & Functional** | Based on verified NABARD / RBI agricultural priority lending guidelines. |
| **Machinery Booking Engine** | **Live & Functional** | Real-time booking with backend concurrency conflict rejection. |
| **Leaflet OpenStreetMap Radar** | **Live & Functional** | OpenStreetMap tiles with GPS coordinates of Karnataka machinery providers. |
| **Bhoomi RTC Land Verification** | *Working Demo* | In production, requires authorized API access to Karnataka Bhoomi (*landrecords.karnataka.gov.in*) gateway. |
| **FRUITS ID (FID) Direct Pull** | *Working Demo* | Requires access to Karnataka Centre for e-Governance (*e-Parihara/FRUITS*) API token. |
| **PM-KISAN DBT Live Status** | *Working Demo* | Requires official integration with PFMS / NPCI Aadhaar Payment Bridge (APB) API. |
| **SMS Notifications** | *Local In-App Alerts* | In production, requires CDAC / NIC SMS Gateway integration. |
