"""Schemas package initialization."""
from app.schemas.wing import WingResponse, WingWithRelations
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.schemas.photo import PhotoCreate, PhotoResponse
from app.schemas.auth import LoginRequest, TokenResponse

__all__ = [
    "WingResponse",
    "WingWithRelations",
    "ActivityCreate",
    "ActivityUpdate",
    "ActivityResponse",
    "PhotoCreate",
    "PhotoResponse",
    "LoginRequest",
    "TokenResponse",
]
