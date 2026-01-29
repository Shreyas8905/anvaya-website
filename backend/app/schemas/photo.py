from pydantic import BaseModel
from datetime import datetime


class PhotoCreate(BaseModel):
    """Photo creation schema."""
    wing_id: int


class PhotoResponse(BaseModel):
    """Photo response schema."""
    id: int
    wing_id: int
    url: str
    cloudinary_id: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True
