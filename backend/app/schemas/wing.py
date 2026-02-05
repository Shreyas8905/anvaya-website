from pydantic import BaseModel
from typing import List, Optional
from app.schemas.activity import ActivityResponse
from app.schemas.photo import PhotoResponse


class WingBase(BaseModel):
    name: str
    slug: str
    about: str
    vision: str
    mission: str


class WingResponse(WingBase):
    id: int
    
    class Config:
        from_attributes = True


class WingWithRelations(WingResponse):
    activities: List[ActivityResponse] = []
    photos: List[PhotoResponse] = []
    
    class Config:
        from_attributes = True
