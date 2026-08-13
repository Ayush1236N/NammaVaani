import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./complaints.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    raw_text = Column(String)
    normalized_text = Column(String)
    category = Column(String, index=True)
    location = Column(String, nullable=True)
    urgency = Column(String)
    summary = Column(String)
    complainant_name = Column(String, nullable=True)
    complainant_contact = Column(String, nullable=True)
    source = Column(String, default="voice")  # "voice" or "manual"
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
