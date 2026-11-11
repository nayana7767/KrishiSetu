import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models
from seed_data import seed_database

# Import routers
from routers.auth_router import router as auth_router
from routers.schemes_router import router as schemes_router
from routers.loans_router import router as loans_router
from routers.documents_router import router as documents_router
from routers.applications_router import router as applications_router
from routers.machinery_router import router as machinery_router
from routers.bookings_router import router as bookings_router
from routers.provider_router import router as provider_router
from routers.admin_router import router as admin_router
from routers.complaints_router import router as complaints_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("krishisetu.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables are created and demo seed is inserted
    logger.info("Initializing KrishiSetu database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown
    logger.info("KrishiSetu backend shutdown.")

app = FastAPI(
    title="KrishiSetu API",
    description="Integrated Agritech Platform for Government Subsidies, Agricultural Loans, and Farm Machinery Marketplace",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration allowing local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(schemes_router)
app.include_router(loans_router)
app.include_router(documents_router)
app.include_router(applications_router)
app.include_router(machinery_router)
app.include_router(bookings_router)
app.include_router(provider_router)
app.include_router(admin_router)
app.include_router(complaints_router)

@app.get("/")
def root():
    return {
        "platform": "KrishiSetu",
        "tagline": "Your Farming Support, All in One Place",
        "status": "online",
        "docs_url": "/docs",
        "demo_accounts": {
            "farmer": {"email": "farmer@krishisetu.in", "password": "farmer123", "role": "farmer"},
            "provider": {"email": "provider@krishisetu.in", "password": "provider123", "role": "provider"},
            "admin": {"email": "admin@krishisetu.in", "password": "admin123", "role": "admin"}
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
