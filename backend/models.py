from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class TranscriptionResult(BaseModel):
    raw_text: str
    normalized_text: str
    detected_language: str


class ComplaintIntent(BaseModel):
    category: Literal[
        "water_issue",
        "electricity_issue",
        "hostel_complaint",
        "academic_query",
        "safety_concern",
        "other",
    ]
    location: Optional[str] = Field(default=None, description="Building/block/room mentioned")
    urgency: Literal["low", "medium", "high"]
    summary: str = Field(description="One-line plain-language summary of the complaint")


class ComplaintOut(BaseModel):
    id: int
    raw_text: str
    normalized_text: str
    category: str
    location: Optional[str]
    urgency: str
    summary: str
    complainant_name: Optional[str] = None
    complainant_contact: Optional[str] = None
    source: str = "voice"
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintCreate(BaseModel):
    raw_text: str
    normalized_text: str
    category: str
    location: Optional[str] = None
    urgency: str
    summary: str
    complainant_name: Optional[str] = None
    complainant_contact: Optional[str] = None
    source: str = "voice"


class ComplaintCreateManual(BaseModel):
    """Body for the typed / manual complaint registration endpoint."""
    complainant_name: str = Field(..., min_length=1, description="Name of the person filing the complaint")
    complainant_contact: str = Field(..., min_length=1, description="Email or phone number to reach the complainant")
    description: str = Field(..., min_length=3, description="Free-text description of the complaint")
