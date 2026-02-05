from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PhotoCreate(BaseModel):
    wing_id: int


class PhotoResponse(BaseModel):
    id: int
    wing_id: int
    url: str
    cloudinary_id: str
    uploaded_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
