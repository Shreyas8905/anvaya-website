from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.activity import Activity
    from app.models.photo import Photo


class Wing(SQLModel, table=True):
    __tablename__ = "wings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=100)
    slug: str = Field(unique=True, index=True, max_length=100)
    about: str
    vision: str
    mission: str
    
    activities: List["Activity"] = Relationship(back_populates="wing")
    photos: List["Photo"] = Relationship(back_populates="wing")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "CodeZero",
                "slug": "codezero",
                "about": "The technical wing of Anvaya Club...",
                "vision": "To foster technical excellence...",
                "mission": "Empowering students through coding..."
            }
        }
