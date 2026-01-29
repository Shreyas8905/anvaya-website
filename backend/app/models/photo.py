from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.models.wing import Wing


class Photo(SQLModel, table=True):
    """Photo model for wing image gallery."""
    
    __tablename__ = "photos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    wing_id: int = Field(foreign_key="wings.id", index=True)
    url: str  # Cloudinary secure URL
    cloudinary_id: str  # Cloudinary public_id for deletion
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    wing: Optional["Wing"] = Relationship(back_populates="photos")
    
    class Config:
        json_schema_extra = {
            "example": {
                "wing_id": 1,
                "url": "https://res.cloudinary.com/...",
                "cloudinary_id": "anvaya/codezero/photo123"
            }
        }
