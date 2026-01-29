from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class ActivityBase(BaseModel):
    """Base activity schema."""
    title: str
    description: str
    activity_date: date


class ActivityCreate(ActivityBase):
    """Activity creation schema."""
    wing_id: int


class ActivityUpdate(BaseModel):
    """Activity update schema - all fields optional."""
    title: Optional[str] = None
    description: Optional[str] = None
    activity_date: Optional[date] = None


class ActivityResponse(ActivityBase):
    """Activity response schema."""
    id: int
    wing_id: int
    report_url: Optional[str] = None
    report_cloudinary_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
