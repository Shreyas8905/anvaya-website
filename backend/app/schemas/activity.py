from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class ActivityBase(BaseModel):
    title: str
    description: str
    activity_date: date
    faculty_coordinator: Optional[str] = None


class ActivityCreate(ActivityBase):
    wing_id: int


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    activity_date: Optional[date] = None
    faculty_coordinator: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: int
    wing_id: int
    report_url: Optional[str] = None
    report_cloudinary_id: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
