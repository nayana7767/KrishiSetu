import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("krishisetu.database")

# Environment DATABASE_URL, defaults to SQLite for portable plug-and-play operation,
# with support for MySQL: e.g. mysql+pymysql://user:password@localhost:3306/krishisetu
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./krishisetu.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    # Test connection
    with engine.connect() as conn:
        logger.info(f"Connected to database successfully: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
except Exception as e:
    logger.warning(f"Failed to connect to primary DB ({DATABASE_URL}): {e}. Falling back to SQLite.")
    DATABASE_URL = "sqlite:///./krishisetu.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
