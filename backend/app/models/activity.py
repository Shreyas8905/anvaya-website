from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from app.models.wing import Wing


class Activity(SQLModel, table=True):
    """Activity model for wing events and reports."""
    
    __tablename__ = "activities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    wing_id: int = Field(foreign_key="wings.id", index=True)
    title: str = Field(max_length=200)
    description: str  # Full activity description
    activity_date: date  # Date when activity occurred
    report_url: Optional[str] = None  # Cloudinary PDF URL
    report_cloudinary_id: Optional[str] = None  # Cloudinary public_id for PDF
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    wing: Optional["Wing"] = Relationship(back_populates="activities")
    
    class Config:
        json_schema_extra = {
            "example": {
                "wing_id": 1,
                "title": "Python Workshop 2024",
                "description": "A comprehensive workshop on Python...",
                "activity_date": "2024-01-15",
                "report_url": "https://res.cloudinary.com/.../report.pdf"
            }
        }
